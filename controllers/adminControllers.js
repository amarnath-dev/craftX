const Admin = require('../models/adminModel');
const cryptojs = require('crypto-js');
const jwt = require('jsonwebtoken');
const { checkAuthadmin } = require('../middlewares/authMiddleware');


const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: maxAge
  });
};


//Starting to Give The Routes
module.exports.adminhome_get = (req, res) => {
  res.render('admin/home');
};

module.exports.adminsignup_get = (req, res) => {
  res.render('admin/signup');
};



module.exports.adminsignup_post = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const encryptedPassword = cryptojs.AES.encrypt(password, process.env.HASH_KEY).toString();
    const newAdmin = new Admin({
      email,
      password: encryptedPassword,
    });

    const savedAdmin = await newAdmin.save();
    res.status(200).json({ message: 'Signup successful', adminID: savedAdmin._id });
  } catch (error) {
    console.error('Error in adminsignup_post:', error);
    res.status(500).json({ error: 'An error occurred during signup.' });
  }
};




module.exports.adminlogin_get = (req, res) => {
  const token = req.cookies.jwtAdmin;

  if (token) {
    jwt.verify(token, process.env.JWT_KEY, (err, decodeToken) => {
      if (err) {
        console.log(err);
        res.render('admin/login');
      } else {
        console.log(decodeToken)
        res.render('admin/home');
      }
    })
  } else {
    res.render('admin/login');
  }
};


module.exports.adminlogin_post = async (req, res) => {

  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid Email' });
    }

    const unhashedPassword = cryptojs.AES.decrypt(admin.password, process.env.HASH_KEY).toString(cryptojs.enc.Utf8);

    if (unhashedPassword !== password) {
      return res.status(401).json({ error: 'Invalid Password' });
    }

    //create a token and sent it to the admin
    const token = createToken(admin._id);
    res.cookie('jwtAdmin', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ adminID: admin._id, jwtToken: token });
  } catch (error) {
    console.error('Error in adminlogin_post:', error);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
};
