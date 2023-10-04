function generateUniqueID() {
    // You can use a timestamp, a random number, or a combination of both
    // Here, we'll use a timestamp as an example
    const timestamp = Date.now();
    // You can also add more uniqueness by appending a random number
    const random = Math.floor(Math.random() * 1000);
    return `order_${timestamp}_${random}`;
}


module.exports = {generateUniqueID}