const Product = require("../models/productModel");
const Rating = require("../models/ratingModel");

module.exports.productRatingPage_get = async (req, res) => {
    const productID = req.params.productID;
    console.log("This is product ID", productID);

    try {

        const getProduct = await Product.findById(productID);

        if (!getProduct) {
            return res.status(400).json({ error: "Product Data Fetch Failed" });
        }

        return res.render('user/productRating', { getProduct });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

module.exports.productRatingPage_post = (req, res) => {
    const productID = req.params.productID;

    try {

        



    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}