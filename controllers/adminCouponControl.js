const Coupon = require("../models/couponModel");



module.exports.adminCoupon_get = async (req, res) => {

    try {
        const coupons = await Coupon.find({ is_delete: false });


        if (coupons) {
            coupons.forEach(coupon => {
                coupon.start_date = coupon.start_date.toISOString();
            });

            return res.render('admin/couponManagment', { coupons })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
    res.render('admin/couponManagment');
}


module.exports.newCoupon_post = async (req, res) => {

    try {
        const saveData = new Coupon({
            coupon_code: req.body.coupon_code,
            max_use: req.body.max_use,
            minPurchase_amount: req.body.minPurchase_amount,
            description: req.body.coupon_description,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            discount_value: req.body.discount_value,
        });

        const savedData = await saveData.save();

        if (savedData) {
            return res.status(200).json({ message: "Data Saved To The Database" });
        } else {
            return res.status(400).json({ error: "Data Saved Failed" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}



module.exports.editCoupon_get = async (req, res) => {
    const couponID = req.params.couponID;

    try {

        const coupon = await Coupon.findOne({ _id: couponID });

        if (coupon) {
            return res.render('admin/editCoupon', { coupon });
        } else {
            return res.status(400).json({ error: "Coupon Data Fetch Failed" });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}




module.exports.editCoupon_post = async (req, res) => {
    const couponID = req.body.couponID;
    const status = req.body.status;
    console.log("This is the current status of the coupon", status);

    if (status) {
        if (status === 'Activate') {
            try {
                const couponStatus = await Coupon.updateOne({ _id: couponID }, {
                    $set: {
                        status: false,
                    }
                });
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: "Status Upadte Failed" })
            }

        } else if (status === 'De-Activate') {
            try {
                const couponStatus = await Coupon.updateOne({ _id: couponID }, {
                    $set: {
                        status: true,
                    }
                });
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: "Status Upadte Failed" })
            }

        }
    } else {

    }

    try {
        const coupon = await Coupon.updateOne({ _id: couponID }, {
            $set: {
                coupon_code: req.body.coupon_code,
                max_use: req.body.max_use,
                minPurchase_amount: req.body.minPurchase_amount,
                discount_value: req.body.discount_value,
            }
        });

        if (coupon) {
            return res.status(200).json({ message: "Update Successfull" });
        } else {
            return res.status(400).json({ error: "Update Failed" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}



module.exports.deleteCoupon_get = async (req,res) => {
    const couponID = req.params.couponID;
    

    try {

        const deleteCoupon = await Coupon.updateOne({_id: couponID}, {$set: {is_delete: true}});

        if(deleteCoupon) {
            return res.status(200).json({message: "Delete Successfull"});
        } else {
            return res.status(400).json({error: "Delete Failed"});
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}