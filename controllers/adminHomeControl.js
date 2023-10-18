
const { count } = require("../models/adminModel");
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
        console.log("This is this day users", thisDayUsers);
        usersArray.push(thisDayUsers);
        const thisMonthUsers = await User.find({ createdAt: { $gte: startOfMonth, $lt: endOfMonth, } }).count();
        console.log("This is this month users", thisMonthUsers);
        usersArray.push(thisMonthUsers);
        const thisYearUsers = await User.find({ createdAt: { $gte: thisYearStart, $lt: thisYearEnd } }).count();
        console.log("This is this year users", thisYearUsers);
        usersArray.push(thisYearUsers);

        console.log("This is the Users array", usersArray);

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




        //Getting this month total Revenue
        const allthismonthOrders = await Order.find({ orderDate: { $gte: startOfMonth, $lt: endOfMonth } });


        allthismonthOrders.forEach((item) => {
            const deliveredOrders = item.orderItems.filter((orderItem) => {
                return orderItem.orderStatus === "delivered";
            })

            deliveredOrders.forEach((item) => {
                const orderDate = new Date(item.order_item_date);
                const month = orderDate.getMonth();
                thismonthRevenue[month] += 1;
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


        return res.status(200).json({ todayOrders: todaysOrder, monthlyOrders: result, yearlyOrders: thisYearOrder, thismonthOrders: totalOrders, totalSalesPrice, getTotalUsers, getTotalProducts, thisMonthUsers, usersArray, thismonthSalesPrice, thismonthRevenue });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

