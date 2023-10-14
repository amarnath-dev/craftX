
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/userOrderModel");

//to get the sum of array 
function sumArray(array) {
    return array.reduce((acc, curr) => acc + curr, 0);
}


module.exports.adminchart_get = async (req, res) => {
    try {
        const result = Array(12).fill(0);
        let todaysOrder = 0;
        let thisYearOrder = 0;
        let totalSalesPrice = 0;

        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const thisYearStart = new Date(today.getFullYear(), 0, 1);
        const thisYearEnd = new Date(today.getFullYear() + 1, 0, 1);

        const getTodayOrders = await Order.find({
            orderDate: { $gte: todayStart, $lt: todayEnd },
        });

        const getYearlyOrders = await Order.find({
            orderDate: { $gte: thisYearStart, $lt: thisYearEnd },
        });

        getTodayOrders.forEach((orderItem) => {
            const deliveredOrderItems = orderItem.orderItems.filter((orderItem) => {
                totalSalesPrice = totalSalesPrice + orderItem.unitPrice;
                todaysOrder++;
                return orderItem.orderStatus === "delivered";
            });

            console.log("This is the all order items", deliveredOrderItems);

            deliveredOrderItems.forEach((deliveredItem) => {
                const orderDate = new Date(deliveredItem.order_item_date);
                const month = orderDate.getMonth();
                result[month] += 1;
            });
        });


        getYearlyOrders.forEach((orderItem) => {
            const deliveredOrderItems = orderItem.orderItems.filter((orderItem) => {
                thisYearOrder++;
                return orderItem.orderStatus === "delivered";
            });
        });


        try {

            var getTotalUsers = await User.find({}).count();

            var getTotalProducts = await Product.find({}, { is_delete: false }).count();

            if (getTotalUsers && getTotalProducts) {
                console.log(getTotalUsers, getTotalProducts);
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }


        //calling the function to get sum of result array
        const totalOrders = sumArray(result);

        res.status(200).json({ todayOrders: todaysOrder, monthlyOrders: result, yearlyOrders: thisYearOrder, thismonthOrders: totalOrders, totalSalesPrice, getTotalUsers, getTotalProducts });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

