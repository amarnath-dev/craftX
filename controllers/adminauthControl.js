const session = require('express-session');
const Admin = require('../models/adminModel');
const Otp = require('../models/otpModel');
const nodemailer = require('nodemailer');
const cryptojs = require('crypto-js');
const jwt = require('jsonwebtoken');



//OTP number generating function(6numbers)
const generateOTPadmin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const sendEmailotpadmin = async (email) => {
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

    // Getting the OTP number and saving it to the new model
    const otpnum = generateOTPadmin();

    const otpData = new Otp({
      emailID: email,
      otp: otpnum,
    });


    try {
      await otpData.save();
      console.log('OTP saved successfully');
    } catch (error) {
      console.error('Error saving OTP to the database:', error);
    }


    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: email,
      subject: "CraftX, Hello there",
      html: `<p>Hi Admin, ${otpnum} is your OTP number for resetting the password.</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Email sending failed:', error);
      } else {
        console.log('Email has been sent to', info.response);
      }
    });
  } catch (error) {
    console.error('An error occurred while sending OTP:', error.message);
  }
};





module.exports.adminforgotpass_get = (req, res) => {
  res.render('admin/newpassemail');
}


module.exports.adminforgotpass_post = async (req, res) => {
  const adminEmail = req.body.email;
  req.session.adminEmail = adminEmail;

  try {
    const checkAdmin = await Admin.findOne({ email: req.body.email });
    console.log(checkAdmin);


    if (!checkAdmin) {
      return res.status(401).json({ error: 'Email Doesnt Exists' });
    }

    //Sending email to the given email id
    await sendEmailotpadmin(checkAdmin.email);

    res.status(200).json({ message: "Admin Exists in DB", adminId: checkAdmin._id });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }

}


module.exports.adminpostverifynewmail_otp = (req, res) => {
  console.log("Reached at new email otp sending");

  try {
    const userEmail = req.body.email;
    console.log(userEmail);

    //send the email
    sendEmailotpadmin(userEmail);
  } catch (error) {
    console.log(error);
    res.status(401).send("Email resend Failed");
  }
}


module.exports.admingetverify_otp = (req, res) => {
  res.render('admin/adminotp');
}


module.exports.adminpostverify_otp = async (req, res) => {
  const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
  const enteredOTP = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;


  try {
    const dbOTP = await Otp.findOne({ otp: enteredOTP });

    if (!dbOTP) {
      return res.status(401).json({ error: "Please Enter a valid OTP" });
    }

    res.status(201).json({ message: "OTP is Verified", emailID: dbOTP.emailID });

  } catch (error) {
    console.log(error.message);
    res.status(401).send("OTP Coudn't Find");
  }
}


module.exports.adminnewpass_get = (req, res) => {
  res.render('admin/adminnewpass');
}



module.exports.adminnewpass_post = async (req, res) => {
  console.log("New password post");

  try {
    const newPassword = req.body.password;
    const newPasswordhashed = cryptojs.AES.encrypt(newPassword, process.env.HASH_KEY).toString();


    const sessionEmail = req.session.adminEmail;
    console.log(sessionEmail);
    const updating = await Admin.findOneAndUpdate({ email: req.session.adminEmail }, { password: newPasswordhashed });
    console.log(updating);

    if (!updating) {
      return res.status(401).send("Failed to Upadate the User");
    }

    res.status(201).json({ message: "Password Updated Successfully", adminEmail: updating.email });

  } catch (error) {
    console.log(error);
    res.status(401).send("Something went Wrong!")
  }
}



module.exports.adminlogout_get = (req, res) => {
  res.cookie('jwtAdmin', '', { maxAge: 1 });
  res.render('admin/login')
}