const cryptojs = require('crypto-js');
const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Product = require('../models/productModel');
const { decodeJwt } = require('../helpers/jwtDecode');
const Banner = require('../models/bannerModel');
const { generateReferralCode } = require('../helpers/referalCode');
const Wallet = require('../models/walletHistoryModel');
const { generateDescription } = require('../helpers/generateDescription')
const { generateTitle } = require('../helpers/generateTitle');


//Create the token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: maxAge
  });
}


//otp number generating 
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// //Email Sending Function (verification using link when user signs up)

// const sendEmail = (fullname,email,userID) => {

//   try {
//     const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 587,
//       secure: false,
//       requireTLS: true,
//       auth:{
//         user: process.env.MY_EMAIL, 
//         pass: process.env.SMTP_PASS, 
//       }
//     });

//     //Getting the otp Number
//     const otp = generateOTP();

//     const mailOptions = {
//       from:process.env.MY_EMAIL,
//       to:email,
//       subject:"CraftX Verification Email",
//       html:'<p>Hy  '+ fullname +"," + otp + ' is youre OTP number'
//       // html:'<p>Hy  '+fullname+',Please click here to <a href="http://localhost:3000/verify?id='+userID+'">verify </a> youre email address.</p>  '
//     }

//     transporter.sendMail(mailOptions, function(error,info) {
//        if(error) {
//         console.log(error);
//        }else{
//         console.log("Email has been sent to ", info.response);
//        }
//     })
//   } catch (error) {
//     console.log(error.message);
//   }
// }



//Sending forgot password Otp Number(email that sends the otp number)


const sendEmailotp = async (fullname, email, userID) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.SMTP_PASS,
      }
    });

    //Getting the otp number and saving it to the new model
    const otpnum = generateOTP();

    const otpData = new Otp({
      emailID: email,
      otp: otpnum,
    })

    await otpData.save();
    //end of the otp saving process

    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: email,
      subject: "CraftX",
      html: '<p>Hy  ' + fullname + "," + otpnum + ' is youre OTP number for Verification Number'
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent to ", info.response);
      }
    })
  } catch (error) {
    console.log(error.message);
  }
}


//res and req managing exports belove
module.exports.get_home = async (req, res) => {

  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    var userID = decodeJwt(token);
  }

  try {

    const allproducts = await Product.find();

    const allBanner = await Banner.find();

    if (!allproducts) {
      return res.status(404).send("No products found");
    }

    if (userID) {
      const getUser = await User.findById({ _id: userID });
      var getProductCount = getUser?.cart?.length;
    }

    res.render('user/home', { message: "Products Fetch successfully", allproducts, getProductCount, allBanner });

  } catch (error) {
    console.log(error.message);
    res.status(400).send("Canno't fetch Products");
  }
};


//user sign in control
module.exports.get_signup = (req, res) => {
  res.render('user/signup');
};


module.exports.get_login = (req, res) => {
  res.render('user/login');
}

module.exports.post_signup = async (req, res) => {

  req.session.userEmail = req.body.email;
  const referalAmount = parseInt(100);

  const newUser = new User({
    fullname: req.body.fullname,
    email: req.body.email,
    password: cryptojs.AES.encrypt(req.body.password, process.env.HASH_KEY).toString(),
    phonenumber: req.body.phonenumber,
    referalCode: generateReferralCode(6),
  });


  if (req.body.referalCode) {

    try {

      const referredUser = await User.findOne({ referalCode: req.body.referalCode });

      if (referredUser) {
        const newCartAmount = referredUser.wallet + 100;

        await User.findByIdAndUpdate(referredUser._id, { $set: { wallet: newCartAmount } }, { new: true });

        const saveData = new Wallet({
          userID: newUser._id,
          transaction_amount: referalAmount,
          transaction_title: generateTitle(referalAmount),
          transaction_des: generateDescription(referalAmount),

        })

        const save = await saveData.save()

        if (!save) {
          return res.status(400).json({ error: "Wallet data creation Failed" });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }


  try {

    try {
      //check for email exists or not 
      const emailCheck = await User.findOne({ email: req.body.email });

      if (emailCheck) {
        return res.status(401).json({ error: 'Email Alredy Exists' });
      }

      //check for phone number alredy exists or not 
      const phonenumCheck = await User.findOne({ phonenumber: req.body.phonenumber });
      console.log(phonenumCheck);

      if (phonenumCheck) {
        return res.status(401).json({ error: 'Phone Number Alredy Exists' });
      }


    } catch (error) {
      console.log(error);
      res.status(401).json({ error: "Internal sever Error" });
    }


    const savedUser = await newUser.save();

    req.session.userID = savedUser._id;

    //Email sending code
    sendEmailotp(req.body.fullname, req.body.email, savedUser._id);


    //Create and send a jwt token inside a cookie
    const token = createToken(savedUser._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

    res.status(200).json({ message: "Login Successfull", userID: savedUser._id })

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Something went Wrong" });
  }
}



// Your route for handling login
module.exports.post_login = async (req, res) => {

  const { email, password } = req.body;
  try {

    const user = await User.login(email, password);

    if (user.status == false) {
      return res.status(401).json({ error: 'Account has been Blocked' });
    }


    if (user) {
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

      //Store the user id in session
      req.session.userID = user._id;

      return res.status(200).json({ user: user.email });
    }

  } catch (error) {
    if (error.message === 'Incorrect Email') {
      res.status(400).json({ error: 'Invalid Email' });

    } else if (error.message === 'Incorrect Password') {
      res.status(400).json({ error: 'Invalid Password' });

    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};




//User login management
// module.exports.post_login = async (req, res) => {
//   const { email, password } = req.body;

//   try {

//     //checking user blocked or not
//     const userStatus = await User.findOne({ email: email });
//     console.log(userStatus);


//     if(!userStatus) {
//       return res.status(401).json({ error: "Email Doesn't Exists"})
//     }

//     if (userStatus.status == false) {
//       return res.status(401).json({ error : 'Account Blocked' });
//     }
//     //end block check end

//     const user = await User.login(email, password);
//     console.log(user);


//     const token = createToken(user._id);
//     res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });


//     res.status(200).json({ user: user.email });

//   } catch (error) {
//     res.status(400).send("Failed to Login");
//     console.log(error);
//   }
// }






//Email Verification Route (through the link)
module.exports.verify_email_get = async (req, res) => {
  res.render('user/emailverify');
}


module.exports.verify_email_post = async (req, res) => {

  const userEmail = req.session.userEmail;
  console.log(userEmail);

  const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
  const enteredOTP = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;
  console.log(enteredOTP);

  try {
    const dbOTP = await Otp.findOne({ otp: enteredOTP });
    // console.log("Inside otp verification");

    if (!dbOTP) {
      return res.status(401).send("Invalid OTP");
    }

    console.log(dbOTP);

    const emailUpdate = await User.findOneAndUpdate({ email: userEmail }, { $set: { isVerified: true } });
    console.log(emailUpdate);

    res.status(201).json({ message: "OTP is Verified", emailID: dbOTP.emailID });

    console.log(dbOTP.emailID);

  } catch (error) {
    console.log(error.message);
    res.status(401).send("OTP Coudn't Find");
  }
}


//Forgot Password Route
module.exports.get_forgetpass = (req, res) => {
  res.render('user/forgotPass');
}


module.exports.reset_password = async (req, res) => {
  const userEmail = req.body.email;
  req.session.userEmail = userEmail;

  console.log(userEmail);

  try {
    const checkUser = await User.findOne({ email: userEmail });
    console.log(checkUser);

    if (!checkUser) {
      res.status(401).send("Email does't exists");
    }

    sendEmailotp(checkUser.fullname, checkUser.email, checkUser._id);

    res.status(200).json({ message: "User Exists in DB", userId: checkUser._id });

  } catch (error) {
    console.log(error);
  }
}

//Verify OTP Route
module.exports.get_verifyotp = (req, res) => {
  res.render('user/otppage');
}

module.exports.verify_otp = async (req, res) => {
  const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
  const enteredOTP = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;


  try {
    const dbOTP = await Otp.findOne({ otp: enteredOTP });

    if (!dbOTP) {
      return res.status(401).send("Invalid OTP");
    }

    res.status(201).json({ message: "OTP is Verified", emailID: dbOTP.emailID });

  } catch (error) {
    console.log(error.message);
    res.status(401).send("OTP Coudn't Find");
  }
}


//Taking and setting the new password
module.exports.get_newpassword = (req, res) => {
  res.render('user/newpass');
}

module.exports.new_password = async (req, res) => {

  try {
    const newPassword = req.body.password;
    const newPasswordhashed = cryptojs.AES.encrypt(newPassword, process.env.HASH_KEY).toString();


    const sessionEmail = req.session.userEmail;
    console.log(sessionEmail);
    const updating = await User.findOneAndUpdate({ email: req.session.userEmail }, { password: newPasswordhashed });
    console.log(updating);

    if (!updating) {
      return res.status(401).send("Failed to Upadate the User");
    }

    res.status(201).json({ message: "Password Updated Successfully", userEmail: updating.email });
  } catch (error) {
    console.log(error);
    res.status(401).send("Something went Wrong!")
  }
}

//log out
module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });

  res.redirect('/login');
}

