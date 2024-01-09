const { default: mongoose } = require('mongoose');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');


//function to get all category names
async function getAllCategoryNames() {
    try {
        const categories = await Category.find({}, '_id name');

        return categories.map(category => ({
            _id: category._id,
            name: category.name,
        }));

    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}


//get all the categories
async function getAllCategories() {
    try {
        const categories = await Category.find({}, '_id name');
        return categories.map(category => ({
            _id: category._id,
            name: category.name,
        }));
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}


module.exports.products_get = async (req, res) => {

    try {
        const products = await Product.find();


        const categories = await getAllCategories();

        // Map product category_names to their corresponding category names
        const productsWithCategoryNames = products.map(product => ({
            ...product.toObject(),
            category_name: categories.find(category => category._id.equals(product.category_name)).name,
        }));

        if (!productsWithCategoryNames) {
            return res.status(404).send("Data Fetch Failed");
        }

        res.render('admin/products', {
            message: "Data Fetch Successful",
            products: productsWithCategoryNames,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching data from the database.");
    }
};



module.exports.adminaddproduct_get = async (req, res) => {

    const categoryNames = await getAllCategoryNames();

    res.render("admin/newproduct", { categoryNames });
}



module.exports.adminaddproduct_post = async (req, res) => {

    try {
        const { product_name, category_name, color, stock, description, prod_price } = req.body;

        // console.log("This is the category id", category_name);

        const primaryImage = req.files['primaryImage'];
        const secondaryImages = req.files['images'];

        //here it only takes second postion image(which is the cropped image )
        const primaryImageNames = primaryImage.length >= 2 ? [primaryImage[1].filename] : [];

        const secondaryImageNames = secondaryImages.map(file => file.filename);

        //Taking the category Name because front end category name is not name its _id
        const product = await Category.findById(category_name);
        if (product) {
            var productName = product.name;
        } else {
            console.log('Product not found');
        }

        const newProduct = new Product({
            name: product_name,
            category_name,
            color,
            stock,
            description,
            price: prod_price,
            primaryImage: primaryImageNames,
            secondaryImage: secondaryImageNames,
            catName: productName,
        });

        const savedProduct = await newProduct.save();

        if (!savedProduct) {
            return res.status(400).send("Product creation failed");
        }
        // res.redirect(302, '/admin/products');
        return res.status(200).json({ message: "Product Created Successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


//Edit Product
module.exports.admineditproduct_get = async (req, res) => {
    try {
        const productData = await Product.findById(req.params.productId);

        if (!productData) {
            return res.status(401).send("Data Fetch Failed");
        }

        // console.log("This is the product data", productData);
        res.render('admin/editproduct', { message: "Data Fetch Successful", product: productData });
    } catch (error) {
        console.log(error.message);
    }
}



module.exports.admineditproduct_post = async (req, res) => {

    const productID = req.body.productID;

    const product_offer = parseInt(req.body.product_offer);

    const prod_price = parseInt(req.body.prod_price);

    const { product_name, category_name, color, stock, description, status, category_ID } = req.body;

    const primaryImage = req.files['primaryImage'];
    const secondaryImages = req.files['images'];

    try {
        const existingProduct = await Product.findById(productID);

        if (!existingProduct) {
            return res.status(400).send("Product not found");
        }

        // Extract the old secondary images
        const oldSecondaryImages = existingProduct.secondaryImage || [];

        if (primaryImage && secondaryImages) {
            // Extract the new image filenames
            const primaryImageNames = primaryImage.map(file => file.filename);
            const secondaryImageNames = secondaryImages.map(file => file.filename);

            const updatedProduct = {
                name: product_name,
                category_name: new mongoose.Types.ObjectId(category_ID),
                color,
                stock,
                description,
                price: prod_price,
                status: status,
                primaryImage: primaryImageNames,
                secondaryImage: oldSecondaryImages.concat(secondaryImageNames),
                catName: category_name,
            };


            //Adding the product Offer
            if (product_offer > 0) {

                const newPrice = prod_price - (prod_price * (product_offer / 100));

                const updatedProductwithOffer = {
                    name: product_name,
                    category_name: new mongoose.Types.ObjectId(category_ID),
                    color,
                    stock,
                    description,
                    price: newPrice,
                    status: status,
                    primaryImage: primaryImageNames,
                    secondaryImage: oldSecondaryImages.concat(secondaryImageNames),
                    catName: category_name,
                    old_Price: prod_price,
                    offer_price: newPrice,
                    offer_discount: product_offer,
                    is_Offer: true,
                };


                const product = await Product.findByIdAndUpdate(productID, updatedProductwithOffer, { new: true });

                if (!product) {
                    return res.status(400).send("Edit Failed");
                }


                res.redirect(302, '/admin/products');

            } else {

                const product = await Product.findByIdAndUpdate(productID, updatedProduct, { new: true });


                if (!product) {
                    return res.status(400).send("Edit Failed");
                }

                res.redirect(302, '/admin/products');
            }

        } else if (!primaryImage && !secondaryImages) {

            console.log("Code comes at here because there is no primary image and secondary image");


            const updatedProduct = {
                name: product_name,
                category_name: new mongoose.Types.ObjectId(category_ID),
                color,
                stock,
                description,
                price: prod_price,
                status: status,
                secondaryImage: oldSecondaryImages,
                catName: category_name,
            };


            //Adding the product Offer
            if (product_offer > 0) {

                console.log("Code is inside exicuting the product offer avilable");

                const newPrice = prod_price - (prod_price * (product_offer / 100));

                const updatedProductwithOffer = {
                    name: product_name,
                    category_name: new mongoose.Types.ObjectId(category_ID),
                    color,
                    stock,
                    description,
                    price: newPrice,
                    status: status,
                    secondaryImage: oldSecondaryImages,
                    catName: category_name,
                    old_Price: prod_price,
                    offer_price: newPrice,
                    offer_discount: product_offer,
                    is_Offer: true,
                };

                const product = await Product.findByIdAndUpdate(productID, updatedProductwithOffer, { new: true });

                if (!product) {
                    return res.status(400).send("Edit Failed");
                }


                res.redirect(302, '/admin/products');

            } else {
                const product = await Product.findByIdAndUpdate(productID, updatedProduct, { new: true });

                if (!product) {
                    return res.status(400).send("Edit Failed");
                }

                res.redirect(302, '/admin/products');
            }

        } else {
            if (primaryImage) {

                const primaryImageNames = primaryImage.map(file => file.filename);

                const updatedProduct = {
                    name: product_name,
                    category_name: new mongoose.Types.ObjectId(category_ID),
                    color,
                    stock,
                    description,
                    price: prod_price,
                    status: status,
                    primaryImage: primaryImageNames,
                    secondaryImage: oldSecondaryImages,
                    catName: category_name,
                };


                //Adding the product Offer
                if (product_offer > 0) {

                    const newPrice = prod_price - (prod_price * (product_offer / 100));

                    const updatedProductwithOffer = {
                        name: product_name,
                        category_name: new mongoose.Types.ObjectId(category_ID),
                        color,
                        stock,
                        description,
                        price: newPrice,
                        status: status,
                        primaryImage: primaryImageNames,
                        secondaryImage: oldSecondaryImages,
                        catName: category_name,
                        old_Price: prod_price,
                        offer_price: newPrice,
                        offer_discount: product_offer,
                        is_Offer: true,
                    };

                    const product = await Product.findByIdAndUpdate(productID, updatedProductwithOffer, { new: true });

                    if (!product) {
                        return res.status(400).send("Edit Failed");
                    }
                    res.redirect(302, '/admin/products');
                } else {

                    const product = await Product.findByIdAndUpdate(productID, updatedProduct, { new: true });

                    if (!product) {
                        return res.status(400).send("Edit Failed");
                    }

                    res.redirect(302, '/admin/products');

                }

            } else {
                // No new primary image, but there are new secondary images
                const secondaryImageNames = secondaryImages.map(file => file.filename);

                const updatedProduct = {
                    name: product_name,
                    category_name: new mongoose.Types.ObjectId(category_ID),
                    color,
                    stock,
                    description,
                    price: prod_price,
                    status: status,
                    secondaryImage: oldSecondaryImages.concat(secondaryImageNames),
                    catName: category_name,
                };

                //Adding the product Offer
                if (product_offer > 0) {

                    const newPrice = prod_price - (prod_price * (product_offer / 100));

                    const updatedProduct = {
                        name: product_name,
                        category_name: new mongoose.Types.ObjectId(category_ID),
                        color,
                        stock,
                        description,
                        price: newPrice,
                        status: status,
                        secondaryImage: oldSecondaryImages.concat(secondaryImageNames),
                        catName: category_name,
                        old_Price: prod_price,
                        offer_price: newPrice,
                        offer_discount: product_offer,
                        is_Offer: true,
                    };

                    const product = await Product.findByIdAndUpdate(productID, updatedProductwithOffer, { new: true });

                    if (!product) {
                        return res.status(400).send("Edit Failed");
                    }


                    res.redirect(302, '/admin/products');
                } else {
                    const product = await Product.findByIdAndUpdate(productID, updatedProduct, { new: true });

                    if (!product) {
                        return res.status(400).send("Edit Failed");
                    }
                    res.redirect(302, '/admin/products');
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}





module.exports.admindeleteproduct_post = async (req, res) => {

    const deleteID = req.params.productId;


    try {
        const deleteProduct = await Product.findByIdAndUpdate(deleteID,
            { $set: { is_delete: true } });

        if (!deleteProduct) {
            return res.status(400).send("Something went Wrong");
        }

        res.status(200).json({ message: "Product Deleted Successfully" });
    } catch (error) {
        console.log(error.message);
    }
}




module.exports.admin_edit_delete_image_get = async (req, res) => {

    const imageID = req.params.imageID;
    const productID = req.params.productID;

    try {

        const product = await Product.findById(productID);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        const imageIndex = product.secondaryImage.indexOf(imageID);

        if (imageIndex === -1) {
            return res.status(404).send("Image not found in product");
        }

        product.secondaryImage.splice(imageIndex, 1);


        await product.save();

        res.status(200).send("Image deleted successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}


module.exports.removeOffer_get = async (req, res) => {

    const productID = req.params.productID;

    try {

        const getProduct = await Product.findById(productID);
        const oldPrice = getProduct.old_Price;

        const getUpdate = await Product.findByIdAndUpdate(productID, {
            $set: {
                price: oldPrice,
                is_Offer: false,
                offer_discount: parseInt(0),
                offer_price: parseInt(0),
                old_Price: parseInt(0),
            }
        }, { new: true });

        if (!getUpdate) {
            return res.status(400).json({ error: "Offer Upadate Failed" })
        }

        return res.status(200).json({ message: "Offer Upadate Successfull" });

    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: "Internal server error" })
    }
}