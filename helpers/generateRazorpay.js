const Razorpay = require("razorpay")

const instance = new Razorpay({
    key_id: "rzp_test_tCfZmeT9T0PkkV",
    key_secret: "bfr2tHHzfjafjSdQPPtH8MuY",
});

function generateRazorpay(orderID,totalAmount) {
    return new Promise((resolve, reject) => {
        
        const options = {
            amount: totalAmount*100,
            currency: "INR",
            receipt: orderID
        };
        instance.orders.create(options, function(err, order) {
            // console.log('This is new Order',order);
            resolve(order);
        });
    })
}


module.exports = {generateRazorpay}