const Order = require('../models/userOrderModel');
const Product = require('../models/productModel');
const { default: mongoose } = require('mongoose');



function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}





module.exports.adminOrders_get = async (req, res) => {
    try {
        const allOrders = await Order.find().populate('userID');
   

        if (allOrders) {
            const orderDetails = [];

            for (const order of allOrders) {
                const orderItems = [];

                for (const orderItem of order.orderItems) {
                    const product = await Product.findById(orderItem.productID);

                    if (product) {
                        orderItems.push({
                            productID: orderItem.productID,
                            productName: product.name,
                            quantity: orderItem.quantity,
                            unitPrice: orderItem.unitPrice,
                            orderStatus: orderItem.orderStatus,
                        });
                    }
                }

                const orderAmount = orderItems.reduce(
                    (total, item) => total + item.quantity * item.unitPrice,
                    0
                );


                const customerAddress = {
                    userName: order.address.userName,
                    town: order.address.town,
                    state: order.address.state,
                    pinCode: order.address.pinCode,
                    locality: order.address.locality,
                    address: order.address.address,
                    landmark: order.address.landmark,
                    workHome: order.address.workHome,
                    phoneNumber: order.address.phoneNumber,
                    isDefaultShipping: order.address.isDefaultShipping,
                    isDefaultBilling: order.address.isDefaultBilling,
                    alternativeNumber: order.address.alternativeNumber,
                };

                const originalDate = new Date(order.orderDate);

                const formattedDate = formatDate(originalDate);

                orderDetails.push({
                    orderId: order._id,
                    customerName: order.userID.fullname,
                    orderDate: formatDate(new Date(order.orderDate)),
                    orderItems,
                    orderAmount,
                    orderState: order.orderState,
                    customerAddress,
                    payment_method: order.payment_method,
                });
            }
            console.log("Order Details from backend------------------------------")
            console.log(orderDetails);
            return res.render('admin/order-management', { orderDetails });
        } else {
            return res.status(400).json({ error: "All Orders fetch Failed" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports.adminOrderEdit_get = async (req, res) => {

    try {

        const orderId = new mongoose.Types.ObjectId(req.query.orderId);
        const productID = new mongoose.Types.ObjectId(req.query.productID);


        const order = await Order.aggregate([
            {
                $match: { _id: orderId },
            },
            {
                $project: {
                    userID: 1,
                    orderState: 1,
                    orderAmount: 1,
                    address: 1,
                    orderDate: 1,
                    orderItems: {
                        $filter: {
                            input: "$orderItems",
                            as: "item",
                            cond: { $eq: ["$$item.productID", productID] }
                        }
                    }
                }
            }
        ]);

        const product = await Product.findById(productID);

        if (!order || !product) {
            return res.status(404).json({ error: "Order or product not found" });
        }


        console.log(order)
        console.log(product)


        return res.render('admin/admin-order-edit', { order, product });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports.adminOrderEdit_post = async (req, res) => {

    console.log("Enterd into the admin order edit section");

    const { orderID, productID, newStatus } = req.body;

     console.log(orderID);
     console.log(productID);
     console.log(newStatus);
         

    try {
        await Order.findOneAndUpdate(
            { _id: orderID, 'orderItems.productID': productID },
            { $set: { 'orderItems.$.orderStatus': newStatus } }
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}
