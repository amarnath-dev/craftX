const Category = require('../models/categoryModel');
const Categoryoffer = require('../models/offerModel')


module.exports.categoryOfferpage_get = async (req, res) => {

    try {
        const allData = await Categoryoffer.find();
        res.render('admin/categoryOffer', { allData });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports.categoryOfferpage_post = async (req, res) => {
    const { offerTitle, offerValue, category, startDate, endDate, offerDescription } = req.body;
    try {

        var getCategory = await Category.findOne({ name: category })
        const saveData = new Categoryoffer({
            category_Id: getCategory._id,
            category_name: getCategory.name,
            offer_title: offerTitle,
            discount: offerValue,
            startDate: startDate,
            endDate: endDate,
            description: offerDescription,
        })
        const save = await saveData.save();
        if (!save) {
            return res.status(400).json({ error: "Offer Data Save Faied" })
        }
        return res.status(200).json({ message: "Offer Created Successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error" });
    }

}