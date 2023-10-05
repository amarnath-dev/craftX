const router = require('express').Router();
const adminControllers = require('../controllers/adminControllers');
const categoryControl = require('../controllers/categoryControl');
const productControl = require('../controllers/productControl');
const adminauthControl = require('../controllers/adminauthControl');
const customersControl = require('../controllers/customersControl');
const adminOrderControl = require('../controllers/adminOrderControl');
const adminSalesControl = require('../controllers/adminSalesControl');
const upload = require('../middlewares/multer');
const { checkAuthadmin } = require('../middlewares/authMiddleware');


//Admin Home Get
router.get('/', checkAuthadmin, adminControllers.adminhome_get);

//Admin SignUp Management

// router.get("/signup", adminControllers.adminsignup_get); 
// router.post("/signup", adminControllers.adminsignup_post); 
router.get('/login', adminControllers.adminlogin_get);
router.post("/login", adminControllers.adminlogin_post);

//Get Category
router.get('/category', checkAuthadmin, categoryControl.admincategory_get);

//New Category Adding Route
router.get('/category/newcategory', checkAuthadmin, categoryControl.newadmincategory_get);
router.post('/category/newcategory', categoryControl.newadmincategory_post);

//Category Edit Page
router.get('/categories/editcategory/:categoryId', categoryControl.admineditcategory_get);
router.post('/categories/editcategory', categoryControl.admineditcategory_post);

//Delete Category
router.get('/categories/deletecategory/:categoryId', categoryControl.admindeletecategory_post);

//Products Page
router.get('/products', checkAuthadmin, productControl.products_get);
router.get('/products/newproduct', productControl.adminaddproduct_get);
router.post('/products/newproduct', upload.fields([{ name: 'images' }, { name: 'primaryImage' }]), productControl.adminaddproduct_post);

//Edit Product Route
router.get('/products/editproduct/:productId', productControl.admineditproduct_get);
router.post('/products/editproduct', upload.fields([{ name: 'images' }, { name: 'primaryImage' }]), productControl.admineditproduct_post);
router.get('/products/deleteproduct/:productId', productControl.admindeleteproduct_post);
router.get('/products/editproduct/deleteImage/:imageID/:productID', productControl.admin_edit_delete_image_get)


//Admin Forgotpassword
router.get('/login/forgotpassword', adminauthControl.adminforgotpass_get);
router.post('/login/forgotpassword', adminauthControl.adminforgotpass_post);


//Verify Otp Page
router.get('/login/forgotpassword/verifyotp', adminauthControl.admingetverify_otp);
router.post('/login/forgotpassword/verifyotp', adminauthControl.adminpostverify_otp);
router.post('/login/forgotpassword/verifyotp/newmail', adminauthControl.adminpostverifynewmail_otp);

//New Password
router.get('/login/forgotpassword/verifyotp/newpass', adminauthControl.adminnewpass_get);
router.post('/login/forgotpassword/verifyotp/newpass', adminauthControl.adminnewpass_post);


//All customers
router.get('/customers', checkAuthadmin, customersControl.customers_get)
//customer block/unblock
router.get('/customers/block/:customerId', customersControl.customer_block);
router.get('/customers/unblock/:customerId', customersControl.customer_unblock);


//order management routes
router.get('/orders', adminOrderControl.adminOrders_get);

router.get('/orders/editOrder', adminOrderControl.adminOrderEdit_get);
router.post('/orders/editOrder', adminOrderControl.adminOrderEdit_post);

// Sales Report Routes
router.get('/sales-report',adminSalesControl.salesPage_get);
router.get('/sales-report/getInvoice', adminSalesControl.salesInvoice_get);
router.get('/sales-report/postInvoice', adminSalesControl.salesInvoice_post);

//sales Filter Router
router.post('/sales-report/filter', adminSalesControl.salesFilter_get);

//Log out
router.get('/logout', adminauthControl.adminlogout_get)


module.exports = router