const Banner = require('../models/bannerModel');
const { newformatDate } = require('../helpers/dateFormat');


module.exports.banner_get = async (req, res) => {

    try {

        const allBanner = await Banner.find();

        allBanner.forEach((item) => {
            item.startDate = newformatDate(item.startDate)

            item.endDate = newformatDate(item.endDate)

            item.createdDate = newformatDate(item.startDate)

        });

        if (allBanner) {
            return res.render('admin/bannerManagment', { allBanner });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json("Internal Server Error")
    }
}


module.exports.newBanner_get = (req, res) => {
    res.render('admin/createBanner');
}



module.exports.newBanner_post = async (req, res) => {

    try {
        const { banner_title, banner_url, banner_link, banner_position, banner_category, banner_status, start_date, end_date } = req.body;


        const bannerImage = req.files['bannerImage'];

        //here it only takes second postion image(which is the cropped image )
        const bannerImageNames = bannerImage.length >= 2 ? [bannerImage[1].filename] : [];

        const newBanner = new Banner({
            title: banner_title,
            imageUrl: banner_url,
            linkUrl: banner_link,
            bannerImage: bannerImageNames,
            position: banner_position,
            category: banner_category,
            status: banner_status,
            startDate: start_date,
            endDate: end_date,
            createdDate: start_date,
        });

        const savedProduct = await newBanner.save();

        if (!savedProduct) {
            return res.status(400).send("Banner creation failed");
        }

        return res.status(200).json({ message: "Banner Created Successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }

}

module.exports.bannerEdit_get = async (req, res) => {
    const bannerId = req.params.bannerId;

    try {
        const getBanner = await Banner.findById(bannerId);

        if (getBanner) {
            console.log(getBanner);
            res.render('admin/editBanner', { getBanner });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports.bannerEdit_post = async (req, res) => {

    const bannerId = req.body.bannerId;
    const {
        banner_title,
        banner_url,
        banner_link,
        banner_position,
        banner_category,
        banner_status,
        end_date,
    } = req.body;

    const bannerImage = req.files['bannerImage'];
    const bannerImageNames = bannerImage && bannerImage.length >= 2 ? [bannerImage[1].filename] : [];

    try {
        const updateFields = {
            title: banner_title,
            imageUrl: banner_url,
            linkUrl: banner_link,
            position: banner_position,
            category: banner_category,
        };

        //It adds only when banner image is provided
        if (bannerImage) {
            updateFields.bannerImage = bannerImageNames[0];
        }

        if (banner_status != 'None') {
            updateFields.status = banner_status;
        }

        if (end_date) {
            updateFields.endDate = end_date;
        }

        const getBanner = await Banner.findByIdAndUpdate(bannerId, { $set: updateFields }, { new: true });

        if (getBanner) {
            return res.status(200).json({ message: "Banner Update Successful" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports.bannerDelete_get = async (req, res) => {

    const bannerId = req.params.bannerId;
    console.log("Banner id", bannerId);

    try {

        const getBanner = await Banner.findByIdAndUpdate(bannerId, {$set: {is_delete: true}}, {new: true});
        await getBanner.save();
        if(getBanner) {
            return res.status(200).json({message: "Banner Delete Successfull"});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Intenal Server Error" });
    }
}