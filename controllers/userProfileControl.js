const User = require("../models/userModel");
const { decodeJwt } = require('../helpers/jwtDecode');
const cryptojs = require('crypto-js');


module.exports.userprofile_get = async (req, res) => {

    const token = req.cookies.jwt;

    try {
        const userID = decodeJwt(token)

        const user = await User.findOne({ _id: userID });

        if (user) {
            console.log("This is user Details", user);
            return res.render('user/user-profile', { userDetails: user });
        } else {
            return res.status(400).json({ error: "User not found in database" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}



module.exports.updateprofile_get = async (req, res) => {
    const token = req.cookies.jwt;

    try {
        const userID = decodeJwt(token)


        const user = await User.findOne({ _id: userID });


        if (user) {
            return res.render('user/updateProfile', { userDetails: user });
        } else {
            return res.status(400).json({ error: "User not found in database" })
        }

    } catch (error) {
        console.log(error);
    }


    res.render('user/updateProfile');
}


module.exports.updateprofile_post = async (req, res) => {
    const token = req.cookies.jwt;


    const updatingFields = {
        fullname: req.body.fullname,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
    }

    const userID = decodeJwt(token);

    try {
        const updating = await User.findByIdAndUpdate({ _id: userID }, { $set: updatingFields }, { new: true });
        if (!updating) {
            return res.status(404).json({ error: "User not Found in Database" });
        }

        res.status(200).json({ message: "Data Updated Successfully", user: updating._id })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports.updatePass_post = async (req, res) => {
    console.log("Reached at upadet password post");
    const token = req.cookies.jwt;

    const currentPass = req.body.password;
    console.log(currentPass);

    try {
        const userID = decodeJwt(token);

        const getUser = await User.findOne({ _id: userID });


        if (!getUser) {
            return res.status(401).json({ error: "Coudn't find the User" });
        }

        const unhashedPassword = cryptojs.AES.decrypt(getUser.password, process.env.HASH_KEY).toString(cryptojs.enc.Utf8);


        if (unhashedPassword === currentPass) {
            return res.status(200).json({ message: "User Found", userID: getUser._id });
        }

        return res.satus(401).json({ message: "Data not found" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports.newpass_post = async (req, res) => {
    const token = req.cookies.jwt;
    const newPass = req.body.password;
    console.log(newPass);

    const user = decodeJwt(token);
    const hashing = cryptojs.AES.encrypt(req.body.password, process.env.HASH_KEY).toString();
    try {
        const update = await User.findOneAndUpdate({ _id: user }, { $set: { password: hashing } });
        if (!update) {
            return res.satus(401).json({ error: "Update Failed" });
        }
        res.status(200).json({ message: "Update Successfull" })
    } catch (error) {
        console.log(error)
        res.status(401).json({ error: "Internal server Errro" });
    }
}