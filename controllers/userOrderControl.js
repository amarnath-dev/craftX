const Address = require("../models/addressModel");
const { decodeJwt } = require('../helpers/jwtDecode');
const Product = require("../models/productModel");
const User = require("../models/userModel");
const { getCartCount } = require('../helpers/cart-product-count');
const mongoose = require('mongoose');
const Order = require('../models/userOrderModel');
const { generateRazorpay } = require('../helpers/generateRazorpay');
const Payment = require("../models/paymentModel");
const crypto = require("crypto");
const { generateUniqueID } = require('../helpers/codUniquePaymntID');
const Coupon = require("../models/couponModel");
const { checkProductStock } = require('../helpers/checkProductStock');


module.exports.purachasePage_get = async (req, res) => {
    const token = req.cookies.jwt;
    const userID = decodeJwt(token);
    const productID = req.params.productID;

    try {
        const userAddress = await Address.find({ userId: userID });
        console.log(userAddress)

        const productDetails = await Product.find({ _id: productID });
        console.log(productDetails);

        if (userAddress && productDetails) {
            return res.render('user/order-summary', { userAddress, productDetails });
        } else {
            return res.status(401).json({ error: "User Coudn't find" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server Error" });
    }
}

//This was the single product Purchase route 
// now both cartCheck out and single product buying merged into one route 
module.exports.purachasePage_post = async (req, res) => {

    const token = req.cookies.jwt;
    const userID = decodeJwt(token);

    const addressID = req.body.orderAddressID;
    const paymentType = req.body.paymentType;

    const productID = new mongoose.Types.ObjectId(req.body.productID);

    const paymentMethod = paymentType.join(', ');

    try {
        const userAddress = await Address.findOne({ _id: addressID });

        const productDetails = await Product.findOne({ _id: productID });

        console.log("This is product details", productDetails);

        let orderData = {};

        if (userAddress && productDetails) {
            orderData = {
                userID: userID,
                orderAmount: productDetails.price,
                orderItems: {
                    productID: productDetails._id,
                    quantity: 1,
                    unitPrice: productDetails.price,
                },
                address: userAddress,
                payment_method: paymentMethod,
            };
        }

        const newOrder = new Order(orderData);

        newOrder.save()
            .then(savedOrder => {
                console.log("This is saved Order", savedOrder);
                res.status(201).json({ message: "Order placed successfully" });
            })
            .catch(error => {
                console.error('Error saving order:', error);
                res.status(500).json({ error: "Internal Server Error" });
            });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }


}




module.exports.checkOut_editproduct_post = async (req, res) => {
    const addressID = req.body.addressID;


    const updateData = {
        userName: req.body.name,
        phoneNumber: req.body.phonenumber,
        pinCode: req.body.pincode,
        locality: req.body.locality,
        address: req.body.address,
        town: req.body.town,
        state: req.body.state,
        landmark: req.body.optionalLandmark,
        alternativeNumber: req.body.alternativenumber,
        workHome: req.body.radioBtn,
    }


    try {
        const userAddress = await Address.findByIdAndUpdate({ _id: addressID }, { $set: updateData }, { new: true });

        if (userAddress) {
            return res.send('Data Updated Succesfully');
        } else {
            return res.status(401).json({ error: "Update Address Drom Check Our Failed" });
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports.cartCheck_out_get = async (req, res) => {

    const token = req.cookies.jwt;
    const userID = decodeJwt(token);

    //Checking the has enough stock
    // const checkStockCount = await checkProductStock(userID);
    // if (checkStockCount === 1) {
    //     return res.status(400).json({ error: "Some Products are out of stock" });
    // }


    const cartCount = await getCartCount(userID);

    try {

        const userAddress = await Address.find({ userId: userID });

        let cartList = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userID) } },
            { $project: { cart: 1, _id: 0 } },
            { $unwind: { path: '$cart' } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'cart.product_id',
                    foreignField: '_id',
                    as: 'prod_detail'
                }
            },
            { $unwind: { path: '$prod_detail' } },
        ]);


        for (const prod of cartList) {
            prod.price = prod.prod_detail.price * prod.cart.cartCount;
        }

        //calculate the Total product Amount
        let totalAmount = 0;
        for (const item of cartList) {
            totalAmount += item.prod_detail.price * item.cart.count;
        }

        //Getting all coupons
        const allCoupons = await Coupon.find();


        if (cartList.length > 0 && allCoupons) {

            res.render('user/cart-check-out', { cartList, cartCount, totalAmount, userAddress, allCoupons, message: 'Cart fetched successfully' });
        } else {
            res.render('user/cart-check-out', { message: 'Cart is empty or fetch failed' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}




module.exports.user_confirmOrder = async (req, res) => {

    const token = req.cookies.jwt;
    const userID = decodeJwt(token);


    //Single Product Buy
    if (req.body.productID) {

        console.log("Inside single product buying page");

        const addressID = req.body.orderAddressID;
        const paymentType = req.body.paymentType;

        const productID = new mongoose.Types.ObjectId(req.body.productID);

        const paymentMethod = paymentType.join(', ');

        try {
            const userAddress = await Address.findOne({ _id: addressID });

            const productDetails = await Product.findOne({ _id: productID });

            // console.log("This is product details", productDetails);

            let orderData = {};

            if (userAddress && productDetails) {
                orderData = {
                    userID: userID,
                    orderAmount: productDetails.price,
                    orderItems: {
                        productID: productDetails._id,
                        quantity: 1,
                        unitPrice: productDetails.price,
                    },
                    address: userAddress,
                    payment_method: paymentMethod,
                };
            }

            const newOrder = new Order(orderData);

            //decrementing the count
            if (newOrder) {
                console.log("Inside stock count decrement function");
                for (const item of newOrder.orderItems) {
                    const proID = item.productID;
                    const proQty = item.quantity;

                    const prod = await Product.findById(proID);
                    if (prod) {
                        console.log("Inside decrement section");
                        prod.stock -= proQty;
                        await prod.save()
                    } else {
                        console.log("Product Finding for stock updation Failed");
                    }
                }
            }

            newOrder.save()
                .then(async savedOrder => {
                    if (newOrder.payment_method == "Cash On Delivery") {

                        const paymentData = {
                            payment_ID: generateUniqueID(),
                            amount: newOrder.orderAmount,
                            currency: "INR",
                            payment_method: "Cash on Delivery",
                            status: newOrder.orderItems[0].orderStatus,
                            order_id: newOrder._id,
                            created_at: newOrder.orderDate,
                            attempts: 1,
                        }

                        try {
                            const savePaymentData = new Payment(paymentData).save();

                            if (savePaymentData) {
                                return res.status(201).json({ success: "Order placed successfully" });
                            }

                        } catch (error) {
                            console.log(error)
                            return res.status(400).json({ error: "Payment data insertion failed" })
                        }

                    } else if (newOrder.payment_method == "Pay Online") {

                        //Choosed Online Payment
                        const razorPayGeneration = await generateRazorpay(newOrder._id, newOrder.orderAmount)
                            .then((response) => {

                                const paymentData = {
                                    payment_ID: response.id,
                                    amount: response.amount,
                                    currency: response.currency,
                                    payment_method: "",
                                    status: response.status,
                                    order_id: response.receipt,
                                    created_at: response.created_at,
                                    attempts: response.attempts,
                                }


                                try {
                                    const savePaymentData = new Payment(paymentData).save();

                                    if (savePaymentData) {
                                        return res.status(200).json(response);
                                    }

                                } catch (error) {
                                    console.log(error);
                                    return res.status(400).json({ error: "Payment Data Saved Failed" })
                                }
                            });

                    } else {
                        return res.status(400).json({ error: "Please select an payment Method" });
                    }
                })
                .catch(error => {
                    console.error('Error saving order:', error);
                    res.status(500).json({ error: "Internal Server Error" });
                });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }

    } else {


        console.log("Inside cart multiple product buying page");

        const addressID = req.body.orderAddressID;
        const paymentType = req.body.paymentType;

        const paymentMethod = paymentType.join(', ');

        try {
            const userAddress = await Address.findOne({ _id: addressID });

            if (!userAddress) {
                return res.status(404).json({ error: "Address not found" });
            }

            let cartList = await User.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(userID) } },
                { $project: { cart: 1, _id: 0 } },
                { $unwind: { path: '$cart' } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'cart.product_id',
                        foreignField: '_id',
                        as: 'prod_detail',
                    },
                },
                { $unwind: { path: '$prod_detail' } },
            ]);

            const orderItems = [];

            for (const item of cartList) {
                const productID = item.cart.product_id;
                const productQuantity = item.cart.count;
                const itemPrice = item.prod_detail.price;


                orderItems.push({
                    productID: productID,
                    quantity: productQuantity,
                    unitPrice: itemPrice,
                    totalAmount: itemPrice * productQuantity,
                    orderStatus: 'processing',
                });
            }

            const totalAmount = orderItems.reduce((total, item) => {
                return total + item.totalAmount;
            }, 0);

            const orderData = {
                userID: userID,
                orderAmount: totalAmount,
                totalOrderProducts: orderItems.length,
                orderItems: orderItems,
                address: userAddress,
                payment_method: paymentMethod,
            };


            const newOrder = new Order(orderData);

            //decrementing the count
            if (newOrder) {
                console.log("Inside stock count decrement function");
                for (const item of newOrder.orderItems) {
                    const proID = item.productID;
                    const proQty = item.quantity;

                    const prod = await Product.findById(proID);
                    if (prod) {
                        console.log("Inside decrement section");
                        prod.stock -= proQty;
                        await prod.save()
                    } else {
                        console.log("Product Finding for stock updation Failed");
                    }
                }
            }

            newOrder.save()
                .then(async savedOrder => {
                    if (newOrder.payment_method === "Cash On Delivery") {


                        const paymentData = {
                            payment_ID: "order_" + generateUniqueID(),
                            amount: newOrder.orderAmount,
                            currency: "INR",
                            payment_method: "Cash on Delivery",
                            status: newOrder.orderItems[0].orderStatus,
                            order_id: newOrder._id,
                            created_at: newOrder.orderDate,
                            attempts: 1,
                        }

                        try {
                            const savePaymentData = new Payment(paymentData).save();

                            if (savePaymentData) {
                                return res.status(201).json({ success: "Order placed successfully" });
                            }

                        } catch (error) {
                            console.log(error)
                            return res.status(400).json({ error: "Payment data insertion failed" })
                        }


                    } else if (newOrder.payment_method === "Pay Online") {


                        //Choosed Online Payment
                        const razorPayGeneration = await generateRazorpay(newOrder._id, newOrder.orderAmount)
                            .then((response) => {

                                const paymentData = {
                                    payment_ID: response.id,
                                    amount: response.amount,
                                    currency: response.currency,
                                    payment_method: "Pay Online",
                                    status: response.status,
                                    order_id: response.receipt,
                                    created_at: response.created_at,
                                    attempts: response.attempts,
                                }


                                try {
                                    const savePaymentData = new Payment(paymentData).save();

                                    if (savePaymentData) {
                                        return res.status(200).json(response);
                                    }

                                } catch (error) {
                                    console.log(error);
                                    return res.status(400).json({ error: "Payment Data Saved Failed" })
                                }
                            });

                    } else {
                        return res.status(400).json({ error: "Please select an payment Method" });
                    }
                })
                .catch(error => {
                    console.error('Error saving order:', error);
                    res.status(500).json({ error: "Internal Server Error" });
                });


        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

};



module.exports.user_orderdetails_get = async (req, res) => {
    const token = req.cookies.jwt;
    const userID = decodeJwt(token);

    try {

        const orders = await Order.find({ userID: userID }).populate('orderItems.productID');

        const orderDetails = orders.map(order => ({
            _id: order._id,
            orderState: order.orderState,
            orderAmount: order.orderAmount,
            orderDate: order.orderDate,
            orderItems: order.orderItems
                .filter(orderItem => !orderItem.is_Canceled) // Filter out canceled items
                .map(orderItem => ({
                    productID: orderItem.productID._id,
                    productName: orderItem.productID.name,
                    orderStatus: orderItem.orderStatus,
                    quantity: orderItem.quantity,
                    unitPrice: orderItem.unitPrice,
                    primaryImages: orderItem.productID.primaryImage,
                })),
            address: order.address,
        }));

        console.log(orderDetails);

        if (orderDetails) {
            return res.render('user/user-order-details', { orderDetails });
        } else {
            return res.status(401).json({ error: "Details not found" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}



module.exports.user_orderCancel_get = async (req, res) => {

    const productID = req.query.productID;
    const orderID = new mongoose.Types.ObjectId(req.query.orderID);

    try {
        const order = await Order.findById(orderID);


        const orderItemToCancel = order.orderItems.find(item => item.productID.toString() === productID);


        if (orderItemToCancel) {
            orderItemToCancel.is_Canceled = true;

            await order.save();

            return res.status(200).json({ message: "Order Cancel Successful" });
        } else {
            return res.status(400).json({ error: "Product Not Found in Database" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports.verifyPayment_post = async (req, res) => {

    console.log(req.body);

    const payment = req.body.payment;
    const order = req.body.order;

    let hmac = crypto.createHmac('sha256', 'bfr2tHHzfjafjSdQPPtH8MuY')

    hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id);

    hmac = hmac.digest('hex');


    if (hmac == payment.razorpay_signature) {

        const orderID = new mongoose.Types.ObjectId(order.receipt);

        try {
            const update = await Payment.updateOne({ order_id: orderID }, { $set: { status: 'placed' } })

            if (update) {


                return res.status(200).json({ message: "Payment Successfull" });
            }

        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: "Payment Failed" });
        }

    } else {
        return res.status(400).json({ error: "Payment Failed" });
    }
}