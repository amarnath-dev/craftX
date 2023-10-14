
const Order = require("../models/userOrderModel");



module.exports.adminchart_get = async (req, res) => {

    try {
        const result = Array(12).fill(0);


        const getOrders = await Order.find();

        getOrders.forEach((orderItem) => {
            const deliveredOrderItems = orderItem.orderItems.filter((orderItem) => {
                return orderItem.orderStatus === "delivered";
            });


            deliveredOrderItems.forEach((deliveredItem) => {
                const orderDate = new Date(deliveredItem.order_item_date);
                const month = orderDate.getMonth();
                result[month] += 1;
            });
        });


        console.log("This is the final array of the month values", result);

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


