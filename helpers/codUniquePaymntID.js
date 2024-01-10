function generateUniqueID() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `order_${timestamp}_${random}`;
}

module.exports = {generateUniqueID}