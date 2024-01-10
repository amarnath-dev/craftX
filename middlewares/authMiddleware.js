
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

//For User
const checkAuth = (req, res, next) => {
   const token = req.cookies.jwt;

   if(token) {
      jwt.verify(token,process.env.JWT_KEY, (err,decodeToken) => {
        if(err) {
            console.log(err.message);
            res.redirect('/login');
        } else {
          console.log(decodeToken);
          next();
        }
      })
   } else {
      res.redirect('/login');
   }
}

//User Status checking middleware(blocked or active)
const checkStatus = async (req, res, next) => {
  
   const currUser = req.session.userEmail;

   try {
      const getData = await User.findById(currUser);
      if(getData.status) {
         next();
      }else {
         return res.status(403).send("Access Denied");
      }
   } catch (error) {
      console.log(error.message);
   }
}

//For Admin Authentication
const checkAuthadmin = (req, res, next) => {
   const token = req.cookies.jwtAdmin;

   if(token) {
      jwt.verify(token,process.env.JWT_KEY, (err,decodeToken) => {
        if(err) {
            console.log(err.message);
            res.redirect('/admin/login');
        } else {
          console.log(decodeToken);
          next();
        }
      })
   } else {
      res.redirect('/admin/login');
   }
}

module.exports = { checkAuth, checkAuthadmin, checkStatus };
