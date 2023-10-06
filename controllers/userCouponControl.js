
const { decodeJwt } = require("../helpers/jwtDecode");
const Coupon = require("../models/couponModel");


module.exports.userCoupon_post = async (req, res) => {
    const token = req.cookies.jwt;
    const userID = decodeJwt(token);

    const couponID = req.body.couponID;
    const coupon_code = req.body.coupon_code;

    const discountValue = req.body.discountValue;
    const totalAmount = req.body.totalAmount;

    try {
        const getCoupon = await Coupon.findById({ _id: couponID });

        if (getCoupon) {
            const DBcoupon_code = getCoupon.coupon_code;

            if (DBcoupon_code === coupon_code) {
                const updatedCoupon = await Coupon.findByIdAndUpdate(couponID,
                    {
                        $push: { used_users: userID },
                        $inc: { usedCount: 1 },
                    },
                    { new: true }
                );

                //Calculate the discounted value
                const discount = (discountValue / 100) * totalAmount;
                const discountAmt = totalAmount - discount;



                if (updatedCoupon) {
                    return res.status(200).json({ discountAmt });
                }

            } else {
                return res.json({ message: "Unavailable Coupon" });
            }
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server" });
    }
}