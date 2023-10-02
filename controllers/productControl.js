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

        const primaryImage = req.files['primaryImage'];
        const secondaryImages = req.files['images'];

       //Selecting Only the png format images
        const primaryImageNames = primaryImage
            .filter(file => file.mimetype === 'image/png') 
            .map(file => file.filename);

        const secondaryImageNames = secondaryImages.map(file => file.filename);

        const newProduct = new Product({
            name: product_name,
            category_name,
            color,
            stock,
            description,
            price: prod_price,
            primaryImage: primaryImageNames,
            secondaryImage: secondaryImageNames,
        });

        const savedProduct = await newProduct.save();

        if (!savedProduct) {
            return res.status(400).send("Product creation failed");
        }
        // res.redirect(302, '/admin/products');
        return res.status(200).json({message: "Product Created Successfully"});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


//Edit Product
module.exports.admineditproduct_get = async (req, res) => {
    try {
        const productData = await Product.findById(req.params.productId);
        console.log(productData);

        if (!productData) {
            return res.status(401).send("Data Fetch Failed");
        }

        res.render('admin/editproduct', { message: "Data Fetch Successful", product: productData });
    } catch (error) {
        console.log(error.message);
    }
}


module.exports.admineditproduct_post = async (req, res) => {
    const productID = req.body.productID;
    console.log(productID);

    const { product_name, category_name, color, stock, description, prod_price, status } = req.body;

    const primaryImage = req.files['primaryImage'];
    const secondaryImages = req.files['images'];

    try {
        // Retrieve the existing product from the database
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
                category_name,
                color,
                stock,
                description,
                price: prod_price,
                status: status,
                primaryImage: primaryImageNames,
                secondaryImage: oldSecondaryImages.concat(secondaryImageNames), // Combine old and new secondary images
            };

            const product = await Product.findByIdAndUpdate(productID, updatedProduct, { new: true });

            if (!product) {
                return res.status(400).send("Edit Failed");
            }

            res.redirect(302, '/admin/products');
        } else if (!primaryImage && !secondaryImages) {
            const updatedProduct = {
                name: product_name,
                category_name,
                color,
                stock,
                description,
                price: prod_price,
                status: status,
                secondaryImage: oldSecondaryImages, // Use the old secondary images
            };

            const product = await Product.findByIdAndUpdate(productID, updatedProduct, { new: true });

            if (!product) {
                return res.status(400).send("Edit Failed");
            }

            res.redirect(302, '/admin/products');
        } else {
            if (primaryImage) {
                const primaryImageNames = primaryImage.map(file => file.filename);

                const updatedProduct = {
                    name: product_name,
                    category_name,
                    color,
                    stock,
                    description,
                    price: prod_price,
                    status: status,
                    primaryImage: primaryImageNames,
                    secondaryImage: oldSecondaryImages, // Use the old secondary images
                };

                const product = await Product.findByIdAndUpdate(productID, updatedProduct, { new: true });

                if (!product) {
                    return res.status(400).send("Edit Failed");
                }

                res.redirect(302, '/admin/products');
            } else {
                // No new primary image, but there are new secondary images
                const secondaryImageNames = secondaryImages.map(file => file.filename);

                const updatedProduct = {
                    name: product_name,
                    category_name,
                    color,
                    stock,
                    description,
                    price: prod_price,
                    status: status,
                    secondaryImage: oldSecondaryImages.concat(secondaryImageNames), // Combine old and new secondary images
                };

                const product = await Product.findByIdAndUpdate(productID, updatedProduct, { new: true });

                res.redirect(302, '/admin/products');
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}





module.exports.admindeleteproduct_post = async (req, res) => {
    console.log("Admin reached product check");
    const deleteID = req.params.productId;

    try {
        const deleteProduct = await Product.findByIdAndUpdate({ _id: deleteID },
            { $set: { is_delete: true } });
        console.log(deleteProduct);

        if (!deleteProduct) {
            return res.status(400).send("Something went Wrong");
        }

        res.redirect('/admin/products');;
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