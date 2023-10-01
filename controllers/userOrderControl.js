const Address = require("../models/addressModel");
const { decodeJwt } = require('../helpers/jwtDecode');
const Product = require("../models/productModel");
const User = require("../models/userModel");
const { getCartCount } = require('../helpers/cart-product-count');
const mongoose = require('mongoose');
const Order = require('../models/userOrderModel');


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

        if (userAddress && productDetails) {

            const orderData = {
                userID: userID,
                orderAmount: productDetails.price,
                orderItems: productDetails,
                address: userAddress,
                payment_method: paymentMethod,
            }
        }

        const newOrder = new Order(orderData);

        newOrder.save()
            .then(savedOrder => {
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

        if (cartList.length > 0) {

            console.log("This is product total amount", totalAmount);
            console.log(cartList);
            res.render('user/cart-check-out', { cartList, cartCount, totalAmount, userAddress, message: 'Cart fetched successfully' });
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

            // Create an order item object and push it to the orderItems array
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

        newOrder.save()
            .then(savedOrder => {
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


