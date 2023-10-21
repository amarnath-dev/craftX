
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
        const thismonthRevenue = Array(6).fill(0);

        let todaysOrder = 0;
        let thisYearOrder = 0;
        let totalSalesPrice = 0;
        let usersArray = [];
        let thismonthSalesPrice = 0;

        //today date calculation
        const today = new Date();
        const currentYear = today.getFullYear()
        const currentMonth = today.getMonth();


        const startMonths = [];
        const endMonths = [];

        for (let i = 0; i < 6; i++) {
            const endMonth = new Date(currentYear, currentMonth - i, 0);
            const startMonth = new Date(currentYear, currentMonth - i - 1, 1);
            startMonths.push(startMonth);
            endMonths.push(endMonth);
        }

        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        //this year date calculation
        const thisYearStart = new Date(today.getFullYear(), 0, 1);
        const thisYearEnd = new Date(today.getFullYear() + 1, 0, 1);

        //this month calculation
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        //getting the count of this month users
        const thisDayUsers = await User.find({ createdAt: { $gte: todayStart, $lt: todayEnd, } }).count();
        usersArray.push(thisDayUsers);
        const thisMonthUsers = await User.find({ createdAt: { $gte: startOfMonth, $lt: endOfMonth, } }).count();
        usersArray.push(thisMonthUsers);
        const thisYearUsers = await User.find({ createdAt: { $gte: thisYearStart, $lt: thisYearEnd } }).count();
        usersArray.push(thisYearUsers);


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



        //Getting this month total Revenue(this code is not using)
        // const allthismonthOrders = await Order.aggregate([
        //     {
        //         $match: {
        //             orderDate: {
        //                 $gte: startOfMonth,
        //                 $lt: endOfMonth,
        //             },
        //             "orderItems.orderStatus": "delivered",
        //         },
        //     },
        // ]);
        const currentDate = new Date();
        const currentMonthnow = currentDate.getMonth() + 1;


        const monthlyRevenues = Array(6).fill(0);

        for (let i = 0; i < 6; i++) {
            const startMonth = new Date(currentYear, currentMonthnow - 4 + i, 1);
            const endMonth = new Date(currentYear, currentMonthnow - 3 + i, 0);

            const ordersInMonth = await Order.find({
                orderDate: { $gte: startMonth, $lte: endMonth },
            });

            let totalRevenue = 0;

            ordersInMonth.forEach((order) => {
                order.orderItems.forEach((orderItem) => {
                    if (orderItem.orderStatus === "delivered") {
                        totalRevenue += orderItem.unitPrice;
                    }
                });
            });

            monthlyRevenues[i] = totalRevenue;
        }

        console.log("Monthly Revenues:", monthlyRevenues);



        try {

            var getTotalUsers = await User.find({}).count();

            var getTotalProducts = await Product.find({}, { is_delete: false }).count();

            if (!getTotalUsers || !getTotalProducts) {
                return res.status(400).json({ error: "Something went Wrong" });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }


        //calling the function to get sum of result array
        const totalOrders = sumArray(result);


        return res.status(200).json({ todayOrders: todaysOrder, monthlyOrders: result, yearlyOrders: thisYearOrder, thismonthOrders: totalOrders, totalSalesPrice, getTotalUsers, getTotalProducts, thisMonthUsers, usersArray, thismonthSalesPrice, monthlyRevenues });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

