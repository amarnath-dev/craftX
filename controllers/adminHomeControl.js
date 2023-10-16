
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

        //today date calculation
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        //this year date calculation
        const thisYearStart = new Date(today.getFullYear(), 0, 1);
        const thisYearEnd = new Date(today.getFullYear() + 1, 0, 1);


        //getting all the data
        const getallOrders = await Order.find();

        //getting todays total orders
        const getTodayOrders = await Order.find({
            orderDate: { $gte: todayStart, $lt: todayEnd },
        });

        getTodayOrders.forEach((orderItem) => {
            const deliveredOrderItemstoday = orderItem.orderItems.filter((orderItem) => {
                return orderItem.orderStatus === "delivered";
            })


            deliveredOrderItemstoday.forEach((orderItem) => {
                todaysOrder++;
            });
        });
        //getting order items today end



        //getting this year order items
        const getYearlyOrders = await Order.find({
            orderDate: { $gte: thisYearStart, $lt: thisYearEnd },
        });


        getYearlyOrders.forEach((orderItem) => {
            const deliveredOrderItems = orderItem.orderItems.filter((orderItem) => {
                return orderItem.orderStatus === "delivered";
            });

            deliveredOrderItems.forEach((orderItem) => {
                thisYearOrder++;
            });
        });
        //order items getting this year end



        getallOrders.forEach((orderItem) => {
            const deliveredOrderItems = orderItem.orderItems.filter((orderItem) => {
                return orderItem.orderStatus === "delivered";
            });


            deliveredOrderItems.forEach((deliveredItem) => {
                const orderDate = new Date(deliveredItem.order_item_date);
                const month = orderDate.getMonth();
                result[month] += 1;
            });
        });

        getallOrders.forEach((orderItem) => {
            const deliveredItems = orderItem.orderItems.filter((orderItem) => {
                return orderItem.orderStatus === "delivered";
            })

            deliveredItems.forEach((orderItem) => {
                totalSalesPrice += orderItem.unitPrice;
            })
        })



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


        return res.status(200).json({ todayOrders: todaysOrder, monthlyOrders: result, yearlyOrders: thisYearOrder, thismonthOrders: totalOrders, totalSalesPrice, getTotalUsers, getTotalProducts });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

