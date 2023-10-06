const router = require('express').Router();
const userControllers = require('../controllers/userControllers');
const userProfileControl = require('../controllers/userProfileControl');
const userAddressControl = require('../controllers/userAddressControl');
const userCartControl = require('../controllers/userCartControl');
const userProductControl = require('../controllers/userProductControl')
const userOrderControl = require('../controllers/userOrderControl');
const userCouponControl = require('../controllers/userCouponControl');
const {checkAuth} = require('../middlewares/authMiddleware');


//User signUp Routes
router.get('/',checkAuth, userControllers.get_home);
router.get('/signup', userControllers.get_signup);
router.post('/signup', userControllers.post_signup);

//User signIn Routes
router.get('/login', userControllers.get_login);
router.post('/login', userControllers.post_login);

//OTP Verification Routes
router.get('/signup/verify', userControllers.verify_email_get);
router.post('/signup/verify', userControllers.verify_email_post);

//Forgot Password route
router.get('/forgotpassword', userControllers.get_forgetpass);
router.post('/forgotpassword', userControllers.reset_password);

//OTP Typing and verification Route
router.get('/verifyotp', userControllers.get_verifyotp);
router.post('/verifyotp', userControllers.verify_otp);

//Password Reseting routes
router.get('/newpassword', userControllers.get_newpassword);
router.post('/newpassword', userControllers.new_password);


//Profile Route
router.get('/profile',userProfileControl.userprofile_get);

router.get('/profile/update', userProfileControl.updateprofile_get);
router.post('/profile/update', userProfileControl.updateprofile_post);

//Profile Update Route
router.post('/profile/update/password', userProfileControl.updatePass_post)
router.post('/profile/update/password/newpass', userProfileControl.newpass_post)


//Address management routes
router.get('/profile/manageaddress',userAddressControl.newAddress_get);

router.post('/profile/manageaddress/addaddress',userAddressControl.newAddress_post);

router.get('/profile/manageaddress/edit-address/:addressID', userAddressControl.editaddress_get);
router.post('/profile/manageaddress/edit-address', userAddressControl.editaddress_post);

router.get('/profile/manageaddress/delete/:addressID', userAddressControl.deleteaddress_get)

//Address management routes


//Product Details Page
router.get('/add-to-cart/:productID', userCartControl.usercart_post);

router.get('/my-cart', userCartControl.mycart_get);

router.get('/my-cart/remove/:productID',userCartControl.remove_product_get);

router.get('/my-cart/increment/:productID', userCartControl.usercartInc_get);
router.get('/my-cart/decrement/:productID', userCartControl.usercartDec_get);


//Product Details
router.get('/view-product/:productID', userProductControl.productDetails_get);


router.post('/check-out/edit-address', userOrderControl.checkOut_editproduct_post);

//Cart check out
router.get('/my-cart/check-out', userOrderControl.cartCheck_out_get);

router.post('/check-out', userOrderControl.user_confirmOrder);


//Single Order Routes(Buy Now)
router.get('/check-out/:productID', userOrderControl.purachasePage_get);


// This was separate payment process route for single productDetails_get
// router.post('/check-out', userOrderControl.purachasePage_post);



router.get('/profile/my-orders', userOrderControl.user_orderdetails_get)

router.get('/profile/my-orders/cancel-order', userOrderControl.user_orderCancel_get);


router.post('/verify-payment',userOrderControl.verifyPayment_post)


router.post('/my-cart/check-out/get-coupon',userCouponControl.userCoupon_post);

router.get('/logout', userControllers.logout_get)





module.exports = router;


