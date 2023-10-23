const router = require('express').Router();
const userControllers = require('../controllers/userControllers');
const userProfileControl = require('../controllers/userProfileControl');
const userAddressControl = require('../controllers/userAddressControl');
const userCartControl = require('../controllers/userCartControl');
const userProductControl = require('../controllers/userProductControl')
const userOrderControl = require('../controllers/userOrderControl');
const userCouponControl = require('../controllers/userCouponControl');
const userWishlistControl = require('../controllers/userWishlistControl')
const userRatingControl = require('../controllers/userRatingControl')
const userWalletControl = require('../controllers/userWalletControl');
const { checkAuth } = require('../middlewares/authMiddleware');


//User signUp Routes
router.get('/', userControllers.get_home);
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
router.get('/profile', checkAuth, userProfileControl.userprofile_get);

router.get('/profile/update', userProfileControl.updateprofile_get);
router.post('/profile/update', userProfileControl.updateprofile_post);

//Profile Update Route
router.post('/profile/update/password', userProfileControl.updatePass_post)
router.post('/profile/update/password/newpass', userProfileControl.newpass_post)


//Address management routes
router.get('/profile/manageaddress', userAddressControl.newAddress_get);

router.post('/profile/manageaddress/addaddress', userAddressControl.newAddress_post);

router.get('/profile/manageaddress/edit-address/:addressID', userAddressControl.editaddress_get);
router.post('/profile/manageaddress/edit-address', userAddressControl.editaddress_post);

router.get('/profile/manageaddress/delete/:addressID', userAddressControl.deleteaddress_get)

//Address management routes


//Product Details Page
router.get('/add-to-cart/:productID',checkAuth, userCartControl.usercart_get);

router.get('/my-cart', checkAuth, userCartControl.mycart_get);

router.get('/my-cart/remove/:productID', userCartControl.remove_product_get);

router.get('/my-cart/increment/:productID', userCartControl.usercartInc_get);
router.get('/my-cart/decrement/:productID', userCartControl.usercartDec_get);


//Product Details
router.get('/view-product/:productID', checkAuth, userProductControl.productDetails_get);


router.post('/check-out/edit-address', userOrderControl.checkOut_editproduct_post);

//Cart check out
router.get('/my-cart/check-out', userOrderControl.cartCheck_out_get);

router.post('/check-out', userOrderControl.user_confirmOrder);

//Single Order Routes(Buy Now)
router.get('/check-out/:productID', checkAuth, userOrderControl.purachasePage_get);


// This was separate payment process route for single productDetails_get
// router.post('/check-out', userOrderControl.purachasePage_post);


router.get('/profile/my-orders', userOrderControl.user_orderdetails_get)

router.get('/profile/my-orders/cancel-order', userOrderControl.user_orderCancel_get);


router.post('/verify-payment', userOrderControl.verifyPayment_post)


router.post('/my-cart/check-out/get-coupon', userCouponControl.userCoupon_post);

router.get('/logout', checkAuth, userControllers.logout_get)


router.get('/thank-you', userOrderControl.userThankyoupage_get);

router.get('/failed', userOrderControl.userOrderFailure_get);

router.get('/payment-failed', userOrderControl.userPaymentFailure_updations)

//Product Return Routes
router.get('my-orders/returnItem/:productID', userOrderControl.returnProduct_get);
router.post('/my-orders/returnItem/:orderId/:productId', userOrderControl.returnProduct_post);


router.get('/profile/my-orders/getInvoice', userOrderControl.invoicePage_get)
router.get('/profile/my-orders/postInvoice', userOrderControl.invoicePage_post)


router.get('/my-wishlist/:productID', userWishlistControl.userWishlist_add);

router.get('/wishlist', checkAuth, userWishlistControl.userWishlist_get)
router.get('/wishlist/removeItem/:productID', userWishlistControl.wishlistDelete_get)
router.get('/wishlist/move-to-cart/:productID', userWishlistControl.moveToCart_get);

//Rating And Reviw Routes
router.get('/profile/my-orders/rate-product/:productID', userRatingControl.productRatingPage_get)
router.post('/profile/my-orders/rate-product', userRatingControl.productRatingPage_post)

//Wallet add money
router.get('/profile/add-money/:paymentAmount', userWalletControl.walletaddmoney_get)
router.get('/profile/wallet-history', userWalletControl.wallestHistory_get)

module.exports = router;


