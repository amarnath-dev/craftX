
const { decodeJwt } = require('../helpers/jwtDecode');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Wishlist = require('../models/wishlistModel');


module.exports.userWishlist_add = async (req, res) => {

    const token = req.cookies.jwt;
    const userID = decodeJwt(token);
    const productID = req.params.productID;

    try {

        const checkAlredyexists = await Wishlist.findOne({ productID });

        if (checkAlredyexists) {
            return res.status(200).json({ exists: "Product Alredy Exists in the Wishlist" })
        }

        const getProduct = await Product.findById(productID);

        if (!getProduct) {
            return res.status(400).json({ error: "Wishlist Product Get Failed" });
        }

        const saveData = new Wishlist({
            userID: userID,
            productID: getProduct._id,
        });

        const wishlistAdd = await saveData.save();

        if (!wishlistAdd) {
            return res.status(400).json({ error: "Wishlist Product Add Failed" });
        }
        return res.status(200).json({ message: "Wishlist Product Add Successfull" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error" });
    }

}

module.exports.userWishlist_get = async (req, res) => {

    try {
        const getWishlistData = await Wishlist.aggregate([

            {
                $lookup: {
                    from: 'products',
                    localField: 'productID',
                    foreignField: '_id',
                    as: 'productDetails',
                }
            }
        ]);


        if (!getWishlistData) {
            return res.status(400).json({ error: "Wishlist Data Fetch Failed" })
        }

        res.render('user/wishlist', { getWishlistData });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}


module.exports.wishlistDelete_get = async (req, res) => {

    const productID = req.params.productID;
    try {
        const getProduct = await Wishlist.findOneAndDelete(productID);

        if (!getProduct) {
            return res.status(400).json({ error: "Whalist Product Remove Failed" });
        }

        return res.status(200).json({ message: "Wishlist Product Remove Successfull" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports.moveToCart_get = async (req, res) => {
    const token = req.cookies.jwt;
    const userID = decodeJwt(token);
    const productID = req.params.productID;

    try {
        //Checking if its alredy there
        const user = await User.findById(userID);

        const isItemExists = user.cart.some((cartItem) => cartItem.product_id == productID);

        if (isItemExists) {
            return res.status(200).json({ exists: "The Product Already Exists In the Cart" });
        }

        user.cart.push({ product_id: productID });
        const saveResult = await user.save();

        if (saveResult) {

            try {

                const getCartItem = await Wishlist.findOneAndDelete(productID)

                if (!getCartItem) {
                    return res.status(400).json({ error: "Wishlist Item Remove Failed" });
                }
                return res.status(200).json({ message: "Item Added to the Cart" });
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        } else {
            return res.status(400).json({ error: "Item Push To Cart Failed" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
