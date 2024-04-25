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
const OrderReturn = require('../models/orderReturnModel');
const pdf = require("pdf-creator-node");
const fs = require("fs");
const { newformatDate } = require('../helpers/dateFormat')
const { checkReturnExpired } = require('../helpers/checkReturnExpiry')
const { walletPurchaseDec } = require('../helpers/walletPurchaseDec')
const { walletPurchaseTitle } = require('../helpers/walletPurchaseTitle');
const Wallet = require("../models/walletHistoryModel");


module.exports.purachasePage_get = async (req, res) => {
    const token = req.cookies.jwt;
    const userID = decodeJwt(token);
    const productID = req.params.productID;

    try {
        const userAddress = await Address.find({ userId: userID });

        const productDetails = await Product.find({ _id: productID });

        const allCoupons = await Coupon.find();

        const getUser = await User.findById(userID);

        if (userAddress && productDetails) {
            return res.render('user/order-summary', { userAddress, productDetails, allCoupons, getUser });
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

        const userData = await User.findById(userID);

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
            res.render('user/cart-check-out', { cartList, cartCount, totalAmount, userAddress, allCoupons, userData, message: 'Cart fetched successfully' });
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
        const addressID = req.body.orderAddressID;
        const paymentType = req.body.paymentType;
        const appliedCouponID = req.body.appliedCouponID;
        let totalAmount = req.body.totalAmount;


        const productID = new mongoose.Types.ObjectId(req.body.productID);

        const paymentMethod = paymentType.join(', ');

        try {
            const userAddress = await Address.findOne({ _id: addressID });

            const productDetails = await Product.findOne({ _id: productID });

            let orderData = {};


            //Apply the discount amount
            if (appliedCouponID) {
                try {
                    const getCoupon = await Coupon.findById(appliedCouponID);
                    const discountValue = getCoupon.discount_value;
                    totalAmount = totalAmount - (totalAmount * discountValue / 100);

                } catch (error) {
                    console.log(error);
                    return res.status(400).json({ error: "Discount Coupon Get Failed" })
                }
            }

            if (userAddress && productDetails) {
                orderData = {
                    userID: userID,
                    orderAmount: totalAmount,
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
                .then(async savedOrder => {
                    if (newOrder.payment_method === "Cash On Delivery") {

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

                    } else if (newOrder.payment_method === "Pay Online") {
                        await generateRazorpay(newOrder._id, newOrder.orderAmount)
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

                    } else if (newOrder.payment_method === "wallet payment") {

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
                            const getUserwallet = await User.findById(userID);
                            const walletAmount = getUserwallet.wallet;

                            const walletUpdate = await User.findByIdAndUpdate(userID, { $set: { wallet: walletAmount - newOrder.orderAmount } }, { new: true });

                            if (walletUpdate) {
                                const savePaymentData = new Payment(paymentData).save();

                                if (savePaymentData) {

                                    const saveData = new Wallet({
                                        userID: userID,
                                        transaction_amount: newOrder.orderAmount,
                                        transaction_title: walletPurchaseTitle(newOrder.orderAmount),
                                        transaction_des: walletPurchaseDec(newOrder.orderAmount),
                                    })

                                    const save = await saveData.save();

                                    if (!save) {
                                        return res.status(400).json({ error: "wallet payment data save failed" });
                                    }

                                    const response = {
                                        success: true,
                                    };

                                    return res.status(200).json(response);
                                }

                            }

                        } catch (error) {
                            console.log(error);
                            return res.status(500).json({ error: "Single item order wallet data insertion failed" });
                        }
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

        const addressID = req.body.orderAddressID;
        const paymentType = req.body.paymentType;
        const appliedCouponID = req.body.appliedCouponID;

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

            let totalAmount = orderItems.reduce((total, item) => {
                return total + item.totalAmount;
            }, 0);


            //Apply the discount amount
            if (appliedCouponID) {
                try {

                    const getCoupon = await Coupon.findById(appliedCouponID);
                    const discountValue = getCoupon.discount_value;

                    totalAmount = totalAmount - (totalAmount * discountValue / 100);

                } catch (error) {
                    console.log(error);
                    return res.status(400).json({ error: "Discount Coupon Get Failed" })
                }
            }


            const orderData = {
                userID: userID,
                orderAmount: totalAmount,
                totalOrderProducts: orderItems.length,
                orderItems: orderItems,
                address: userAddress,
                payment_method: paymentMethod,
            };

            const newOrder = new Order(orderData);

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
                        await generateRazorpay(newOrder?._id, newOrder?.orderAmount)
                            .then((response) => {
                                const paymentData = {
                                    payment_ID: response?.id,
                                    amount: response?.amount,
                                    currency: response?.currency,
                                    payment_method: "Pay Online",
                                    status: response?.status,
                                    order_id: response?.receipt,
                                    created_at: response?.created_at,
                                    attempts: response?.attempts,
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
                            }).catch((err) => {
                                console.log("Error Occured", err)
                            })

                    } else if (newOrder.payment_method === "wallet payment") {

                        const paymentData = {
                            payment_ID: "order_" + generateUniqueID(),
                            amount: newOrder.orderAmount,
                            currency: "INR",
                            payment_method: "wallet payment",
                            status: newOrder.orderItems[0].orderStatus,
                            order_id: newOrder._id,
                            created_at: newOrder.orderDate,
                            attempts: 1,
                        }


                        try {
                            const getUserwallet = await User.findById(userID);
                            const walletAmount = getUserwallet.wallet;

                            const walletUpdate = await User.findByIdAndUpdate(userID, { $set: { wallet: walletAmount - newOrder.orderAmount } }, { new: true });

                            if (walletUpdate) {
                                const savePaymentData = new Payment(paymentData).save();

                                if (savePaymentData) {

                                    const saveData = new Wallet({
                                        userID: userID,
                                        transaction_amount: newOrder.orderAmount,
                                        transaction_title: generateTitle(newOrder.orderAmount),
                                        transaction_des: walletPurchaseDec(newOrder.orderAmount),
                                    })

                                    const save = await saveData.save();
                                    if (!save) {
                                        return res.status(400).json({ error: "wallet data save failed" });
                                    }

                                    const response = {
                                        success: true,
                                    };

                                    return res.status(200).json(response);
                                }

                            }

                        } catch (error) {
                            console.log(error);
                            return res.status(500).json({ error: "wallet payment data save failed" });
                        }
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

        const orders = await Order.find({ userID: userID }).populate('orderItems.productID').sort({ orderDate: -1 });


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
                    _id: orderItem._id,
                    is_Delivered: orderItem.is_Delivered,
                    is_return: orderItem.is_return,
                    order_item_date: newformatDate(orderItem.order_item_date),
                    return_expired: checkReturnExpired(orderItem.order_item_date),
                })),
            address: order.address,
        }));

        console.log("This is order details", orderDetails);



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

    const orderID = new mongoose.Types.ObjectId(req.query.orderID);
    // console.log("This is the order Id", orderID)

    const productID = req.query.productID;
    // console.log("This is product ID", productID)


    const uniqueID = req.query.uniqueID;

    try {
        const order = await Order.findById(orderID);

        const orderItemToCancel = order.orderItems.find(item => item._id.toString() === uniqueID);


        if (orderItemToCancel) {
            orderItemToCancel.is_Canceled = true;

            await order.save();

            const proID = orderItemToCancel.productID;
            const quantity = orderItemToCancel.quantity;

            try {

                const decrement = await Product.findByIdAndUpdate(proID, { $inc: { stock: quantity } });
                // console.log("This is the Decremeneted item ", decrement);

            } catch (error) {
                console.log(error);
                return res.status(400).json({ error: "Product Not Found in database" });
            }

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

    const payment = req.body?.payment;
    const order = req.body?.order;

    let hmac = crypto.createHmac('sha256', 'TCG5kzd8GkoW1S7rznvNpJ74');
    hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id);
    hmac = hmac.digest('hex');

    if (hmac == payment?.razorpay_signature) {
        const orderID = new mongoose.Types.ObjectId(order.receipt);
        try {
            const getPaymentData = await Payment.find({ order_id: orderID });

            if (!getPaymentData || getPaymentData.length === 0) {
                return res.status(400).json({ error: "Payment Failed" });
            }

            for (const paymentDoc of getPaymentData) {
                const getOrderID = await Order.findById(paymentDoc.order_id);
                if (!getOrderID) {
                    console.log("Order not found for payment ID: ", paymentDoc._id);
                    continue; //move to the next payment
                }

                // Update product stock
                const productUpdates = getOrderID.orderItems.map(async (item) => {
                    const productData = item.productID;
                    const productQuantity = item.quantity;

                    const getDecrement = await Product.findById(productData);
                    if (getDecrement) {
                        getDecrement.stock -= productQuantity;
                        await getDecrement.save();
                    } else {
                        console.log("Product Find Failed");
                    }
                });

                // Use Promise.all to wait for all product updates to complete
                await Promise.all(productUpdates);

                // Update both fields in the order document
                getOrderID.payment_status = "completed";
                getOrderID.status = "placed";
                await getOrderID.save();

                // Update the payment status
                const update = await Payment.updateOne(
                    { order_id: orderID },
                    { $set: { status: 'placed' } }
                );
                if (update) {
                    return res.status(200).json({ message: "Payment Successful" });
                }
            }
            return res.status(400).json({ error: "No valid payment found" });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: "Payment Failed" });
        }
    } else {
        return res.status(400).json({ error: "Payment Failed" });
    }
}

module.exports.userThankyoupage_get = (req, res) => {
    res.render('user/orderCompleteTnxPage');
}

module.exports.userOrderFailure_get = (req, res) => {
    res.render('user/userOrderFailurePage');
}

module.exports.userPaymentFailure_updations = (req, res) => {
    console.log("Code is inside the payment failed updations section");
    console.log("This is the payment failure options passed from the front end", req.body);
}


module.exports.returnProduct_get = (req, res) => {
    const productId = req.params.productId;
}


module.exports.returnProduct_post = async (req, res) => {

    const token = req.cookies.jwt;
    const userID = decodeJwt(token);

    const productId = req.params.productId;

    const orderId = req.params.orderId;

    const issueDescription = req.body.issueDescription;

    const returnReason = req.body.returnReason;

    try {

        const saveData = new OrderReturn({
            orderId: orderId,
            productId: productId,
            userID: userID,
            reason: returnReason,
            additionalInfo: issueDescription,
            createdDate: Date.now(),
        })

        const save = await saveData.save();

        if (save) {

            const getOrder = await Order.findById(orderId);
            getOrder.orderItems.forEach((orderItem) => {
                orderItem.is_return = true;

            })

            const saveData = await getOrder.save();

            if (saveData) {
                return res.status(200).json({ message: "Return Order Data Saved Successfully" })
            }

        } else {
            return res.status(400).json({ error: "Return Data saved failed" });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports.invoicePage_get = async (req, res) => {

    const orderID = req.query.orderId;
    const productID = req.params.productId;

    try {
        const allDetails = await Order.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(orderID) }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orderPaymentDetails',
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.productID',
                    foreignField: '_id',
                    as: 'productDetails',
                }
            }
        ]);

        if (allDetails) {
            console.log("this is all deails from server", allDetails)
            return res.render('user/order-invoice', { allDetails });
        } else {
            return res.status(404).json({ error: "Order not found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports.invoicePage_post = async (req, res) => {

    const orderID = req.query.orderId;
    const productID = req.query.productID;

    try {
        const allDetails = await Order.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(orderID) }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'order_id',
                    as: 'orderPaymentDetails',
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.productID',
                    foreignField: '_id',
                    as: 'productDetails',
                }
            }
        ]);


        const html = fs.readFileSync('./views/pdf/invoice.hbs', "utf8");
        const options = {
            format: "A4",
            orientation: "portrait",
            border: "10mm",
            header: {
                height: "5mm",
                contents: '<div style="text-align: center;">INVOICE</div>'
            },
        };


        const document = {
            html: html,
            data: {
                allDetails: allDetails,
            },
            path: "./invoice.pdf",
            type: "file",
        };


        pdf.create(document, options).then((data) => {
            const pdfStream = fs.createReadStream("invoice.pdf");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=invoice.pdf`);
            pdfStream.pipe(res);
            console.log("PDF sent as a download");
        }).catch((error) => {
            console.error(error);
            res.status(500).send("Error generating the PDF");
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}