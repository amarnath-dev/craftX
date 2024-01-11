function checkReturnExpired(orderDate) {
    const currentDate = new Date();

    const twoWeeksAgo = new Date(currentDate);
    twoWeeksAgo.setDate(currentDate.getDate() - 14);

    const parsedOrderDate = new Date(orderDate);
    return parsedOrderDate < twoWeeksAgo;
}

module.exports = { checkReturnExpired }