const User = require('../models/userModel')

async function cartCountCheck(userID, productID) {
    try {

        const getUser = await User.findById(userID);

        if (!getUser) {
            return 0;
        }

        const cartItem = getUser.cart.find((item) => item.product_id.toString() === productID);

        if (cartItem) {
            return cartItem.count;
        } else {
            return 0;
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server Error" });
    }
}

module.exports = { cartCountCheck }