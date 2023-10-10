const { decodeJwt } = require('../helpers/jwtDecode');
const Address = require('../models/addressModel');


module.exports.newAddress_get = async (req, res) => {
    const token = req.cookies.jwt;
    const userID = decodeJwt(token);
    console.log(userID)

    try {
        const userAddress = await Address.find({ userId: userID });
        console.log(userAddress);

        if (userAddress) {
            res.render('user/use-address', { userAddress: userAddress });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}


module.exports.newAddress_post = async (req, res) => {
    const token = req.cookies.jwt;
    const userID = decodeJwt(token);



    try {
        const formData = new Address({
            userId: userID,
            userName: req.body.name,
            phoneNumber: req.body.phonenumber,
            pinCode: req.body.pincode,
            locality: req.body.locality,
            address: req.body.address,
            town: req.body.town,
            state: req.body.state,
            landmark: req.body.optionalLandmark,
            alternativeNumber: req.body.alternativenumber,
            workHome: req.body.workHome,
        });

        const savedData = await formData.save();
        console.log(savedData);

        if (!savedData) {
            return res.status(401).json({ error: "Data save Failed" });
        }
        const userid = savedData._id ;
        res.redirect(`/profile/manageaddress/?userid=${userid}`);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server error" });
    }
}

module.exports.editaddress_get = async (req, res) => {
    const addressID = req.params.addressID;

    try {

        const userAddress = await Address.findOne({ _id: addressID });
       

        if (userAddress) {
            return res.render('user/edit-address', { userAddress: userAddress });
        } else {
            return res.status(401).json({ error: "Address Not found" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" })
    }
}


module.exports.editaddress_post = async (req, res) => {
    const addressID = req.body.objectID;

    const updateData = {
        userName: req.body.name,
        phoneNumber: req.body.phonenumber,
        pinCode: req.body.pincode,
        locality: req.body.locality,
        address: req.body.address,
        town: req.body.town,
        state: req.body.state,
        workHome: req.body.checkme,
    }

    try {
        const updateAddress = await Address.findByIdAndUpdate({ _id: addressID }, { $set: updateData }, { new: true });

        if(!updateAddress) {
            return res.status(401).json({ error: "Update Failed" });
        } else {
            res.redirect('/profile/manageaddress/');
        }

        // if (updateAddress) {
        //    return res.render('user/use-address', { updateAddress: updateAddress._id });
        // } else {
        //     return res.status(401).json({ error: "Update Failed" });
        // }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
    }
}

//Delete Route
module.exports.deleteaddress_get = async (req,res) => {
    const addressID = req.params.addressID;
    console.log(addressID);

    try {
        const deleteAddress = await Address.findOneAndDelete({_id: addressID});
        
        if(deleteAddress) {
            return res.redirect('/profile/manageaddress/');
        } else {
            return res.status(404).json({error: "Address Not Found"});
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Server Error"});
    }
}
