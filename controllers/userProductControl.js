const { decodeJwt } = require("../helpers/jwtDecode");
const Product = require("../models/productModel");
const Rating = require("../models/ratingModel");


module.exports.productDetails_get = async (req, res) => {

    const token = req.cookies.jwt;
    const userID = decodeJwt(token);
    const productID = req.params.productID;

    try {
        const productDetails = await Product.findOne({ _id: productID });
        const productRating = await Rating.find({ productID: productID });

        if (productDetails) {
            console.log(productDetails);
            return res.render('user/product-details', { productDetails, productRating });
        } else {
            return res.status(401).json({ error: "Data Coud'nt Fetch" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}