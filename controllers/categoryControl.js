const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const { formatDate } = require('../helpers/date-time-format');


//Get product coutn comes under each category

const getProductCountsByCategory = async () => {

  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: '$category_name',
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryCounts = {};

    result.forEach((item) => {
      categoryCounts[item._id] = item.count;
    });

    return categoryCounts;

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};



//Get Category
module.exports.admincategory_get = async (req, res) => {
  try {
    const allCategories = await Category.find();

    const categoriesWithProductCount = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category_name',
          as: 'products',
        },
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
        },
      },
    ]);

    if (!categoriesWithProductCount) {
      return res.status(404).send("Couldn't complete the request");
    }


    categoriesWithProductCount.forEach((category) => {
      category.formattedDate = formatDate(category.createdon);
    });


    res.render('admin/category', {
      message: 'Fetch Successful',
      allCategories: allCategories,
      categoriesWithProductCount: categoriesWithProductCount,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
};



//New Cat Page
module.exports.newadmincategory_get = (req, res) => {
  res.render('admin/newcategory');
}

//Posting New Cat
module.exports.newadmincategory_post = async (req, res) => {

  const newCat = new Category({
    name: req.body.categoryName,
    description: req.body.categoryDescription,
  });

  try {
    const savedCat = await newCat.save();
    console.log(savedCat);
    if (!savedCat) {
      return res.status(401).send("Cannot add Category");
    }

    res.status(200).json({ message: "Category added Succesfully", savedCatID: savedCat._id });

  } catch (error) {
    console.log(error);
  }
}


//Admin Edit Category Get
module.exports.admineditcategory_get = async (req, res) => {
  const categoryId = req.params.categoryId;
  console.log(`Received request for category with ID: ${categoryId}`);

  try {
    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.render('admin/editcategory', { categories: category });
  } catch (error) {
    console.error(`Error retrieving category: ${error}`);
    res.status(500).send("Internal server error");
  }
};


//Edit Cat Post
module.exports.admineditcategory_post = async (req, res) => {
  try {

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.body.id },
      {
        name: req.body.name,
        status: req.body.status,
        description: req.body.description,
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(400).json({ message: "Category not found or update failed" });
    }


    res.status(200).json({ message: "Update successful", updatedCategory, catID: updatedCategory._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



//Admin Delete Catagory 
module.exports.admindeletecategory_post = async (req, res) => {
  console.log("Reached at delete category");
  const categoryId = req.params.categoryId;
  console.log(categoryId);

  try {

    const changeStatus = await Category.findByIdAndUpdate({ _id: categoryId }, { $set: { delete: true } });

    if (!changeStatus) {
      return res.status(404).json({ message: 'Update Failed' });
    }

    return res.redirect('/admin/category');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while deleting the category' });
  }
};



