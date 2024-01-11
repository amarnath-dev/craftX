const Product = require('../models/productModel');
const User = require('../models/userModel');

async function checkProductStock(userID) {
    try {
        const getUser = await User.findById(userID);

        if (!getUser) {
            return 2;
        }

        const cartItems = getUser.cart;

        for (const item of cartItems) {
            const productID = item.product_id;
            const productCount = item.count;

            const getProductStock = await Product.findById(productID);

            if (!getProductStock) {
                return 3; 
            }

            const stockCount = getProductStock.stock;
            if (stockCount < productCount) {
                return 1; 
            }
        }

        return 0;
    } catch (error) {
        throw error; 
    }
}

module.exports = { checkProductStock };
