const Product = require('../models/productModel');
const User = require('../models/userModel');

async function checkProductStock(userID) {
    try {
        const getUser = await User.findById(userID);

        if (!getUser) {
            console.log("User not found");
            return 2;
        }

        const cartItems = getUser.cart;

        for (const item of cartItems) {
            const productID = item.product_id;
            const productCount = item.count;

            const getProductStock = await Product.findById(productID);

            if (!getProductStock) {
                console.log('Product no found in DB');
                return 3; 
            }

            const stockCount = getProductStock.stock;

            if (stockCount < productCount) {
                return 1; 
            }
        }

        return 0;
    } catch (error) {
        console.log(error);
        throw error; 
    }
}

module.exports = { checkProductStock };
