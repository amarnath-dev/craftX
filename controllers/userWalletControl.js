const { decodeJwt } = require("../helpers/jwtDecode");
const User = require("../models/userModel");
const Wallet = require('../models/walletHistoryModel');
const { generateDescription } = require('../helpers/generateDescription')
const { generateTitle } = require('../helpers/generateTitle');
const { newformatDate } = require('../helpers/dateFormat')


module.exports.walletaddmoney_get = async (req, res) => {

    const paymentAmount = parseInt(req.params.paymentAmount);

    const token = req.cookies.jwt;
    const userID = decodeJwt(token)

    try {

        const getUserupdate = await User.findById(userID);
        const getAmount = getUserupdate.wallet + paymentAmount;
        const getUpdate = await User.findByIdAndUpdate(userID, { $set: { wallet: getAmount } }, { new: true });

        if (getUpdate) {

            const saveData = new Wallet({
                userID: userID,
                transaction_amount: paymentAmount,
                transaction_title: generateTitle(paymentAmount),
                transaction_des: generateDescription(paymentAmount),
            })

            const save = await saveData.save();

            if (save) {
                return res.status(200).json({ message: "Money Added Successfully" });
            } else {
                return res.status(400).json({ error: "Wallet Data Creation Failed" })
            }
        } else {
            return res.status(400).json({ error: "Money add failed" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports.wallestHistory_get = async (req, res) => {
    const token = req.cookies.jwt;
    const userID = decodeJwt(token)

    try {

        const getallData = await Wallet.find({ userID: userID }).sort({ date: -1 });
        getallData.forEach((item) => {
            item.date = newformatDate(item.date);
        });
        if (getallData) {
            return res.render('user/walletHistory', { getallData });
        } else {
            return res.status(400).json({ error: "Data fetch Failed" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Errro" });
    }
}

