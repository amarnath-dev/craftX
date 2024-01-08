const OrderReturn = require('../models/orderReturnModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');



module.exports.adminOrderReturnControl = async (req, res) => {

    try {
        const getReturnOrders = await OrderReturn.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userID',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'orderDetails',
                },
            },
        ]);

        if (getReturnOrders) {
            res.render('admin/orderReturn', { getReturnOrders });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports.orderApprove_get = async (req, res) => {

    const returnId = req.params.returnReqId;
    try {

        const getOrderReturn = await OrderReturn.findByIdAndUpdate(returnId, { $set: { status: "approved" } }, { new: true });

        const userData = await User.findById(getOrderReturn.userID);
        const userID = userData._id;

        const productData = await Product.findById(getOrderReturn.productId);
        const productPrice = productData.price;

        try {

            const incrementAmount = userData.wallet + productPrice;
            const getUpdate = await User.findByIdAndUpdate(userID, { $set: { wallet: incrementAmount } }, { new: true });

            if (!getUpdate) {
                return res.status(400).json({ error: "Order Return wallet amount increment failed" });
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (getOrderReturn && userData) {

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

                const mailOptions = {
                    from: process.env.MY_EMAIL,
                    to: userData.email,
                    subject: "CraftX Product Return",
                    html: 'Hy, Youre Order Return' + " " + productData.name + " " + "For the Reason" + " " + getOrderReturn.reason + 'Has Been Confirmed.  Please Ensure that The Product is Packed and Ready to Pick. The order Amount has been Credited to your Account Wallet',
                }

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email has been sent to ", info.response);
                    }
                })

            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            return res.status(200).json({ message: "Order Return Approve Successfull" });
        } else {
            return res.status(400).json({ error: "Order Return Approve Failed" });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports.orderReject_get = async (req, res) => {
    const returnId = req.params.returnReqId;

    try {

        const getOrderReturn = await OrderReturn.findByIdAndUpdate(returnId, { $set: { status: "declined" } }, { new: true });
        const userData = await User.findById(getOrderReturn.userID);
        const userID = userData._id;
        const productData = await Product.findById(getOrderReturn.productId);
        const productPrice = productData.price;

        try {

            const decrementAmount = userData.wallet - productPrice;

            const getUpdate = await User.findByIdAndUpdate(userID, { $set: { wallet: decrementAmount } }, { new: true });

            if (!getUpdate) {
                return res.status(400).json({ error: "Order Return wallet amount decrement failed" });
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: "Internal Server Error" });
        }


        if (getOrderReturn) {

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

                const mailOptions = {
                    from: process.env.MY_EMAIL,
                    to: userData.email,
                    subject: "CraftX Product Return",
                    html: 'Hy, Youre Order Return' + " " + productData.name + " " + "For the Reason" + " " + getOrderReturn.reason + 'Has Been Rejected. '
                }


                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email has been sent to ", info.response);
                    }
                })

            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            return res.status(200).json({ message: "Order Return Successfull" });
        } else {
            return res.status(400).json({ error: "Order Return Rejection Failed" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}