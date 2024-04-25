const { decodeJwt } = require("../helpers/jwtDecode");
const Product = require("../models/productModel");
const Rating = require("../models/ratingModel");

module.exports.productRatingPage_get = async (req, res) => {
    const productID = req.params.productID;

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



//code that calculates the avrage of rating
module.exports.productRatingPage_post = async (req, res) => {
    const token = req.cookies.jwt;
    const userID = decodeJwt(token);

    const productID = req.body.productID;
    const userRating = req.body.userRating;

    try {
        const newRating = new Rating({
            userID: userID,
            productID: productID,
            rating: userRating,
            description: req.body.ratingDescription,
        });

        const savedRating = await newRating.save();

        if (!savedRating) {
            return res.status(400).json({ error: "Rating data saving failed" });
        }

        // Calculate the average rating for the product
        const ratings = await Rating.find({ productID: productID });
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = sumRatings / totalRatings;

        // Update the product's rating
        const updatedProduct = await Product.findByIdAndUpdate(
            productID,
            { $set: { rating: averageRating } },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(400).json({ error: "Product rating update failed" });
        }
        return res.status(200).json({ message: "Data saved successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
