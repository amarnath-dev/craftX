
const User = require('../models/userModel');

const getCartCount = async (userID) => {
  try {

    const userCart = await User.findOne({_id: userID });

    if (userCart) {
      const itemCount = userCart.cart.length;
      return itemCount;
    }

    return 0;
  } catch (error) {
    return 0;
  }
};


module.exports = { getCartCount };
