const Razorpay = require("razorpay");

const instance = new Razorpay({
    key_id: "rzp_test_d4DYYP3DeZhYXu",
    key_secret: "TCG5kzd8GkoW1S7rznvNpJ74",
});

function generateRazorpay(orderID, totalAmount) {
    return new Promise((resolve, reject) => {
        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: orderID
        };
        instance.orders.create(options, function (error, order) {
            if (error) {
                reject(error);
            } else {
                resolve(order);
            }
        });
    });
}

module.exports = { generateRazorpay };
