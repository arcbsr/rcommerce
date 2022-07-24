const express = require("express");
const {
  getAllProducts,
  createProduct,
  createProductConfig,
  productUpd,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  createProductReview,
  getSingleProductReviews,
  deleteReview,
  getAdminProducts,
} = require("../controller/ProductController");
const { createCategory, updateCategory, getAllCategory,SubCatByID, addSubCat } = require("../controller/CategoryController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/products").get(getAllProducts);

router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

router
  .route("/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

router
  .route("/product/update/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), productUpd);
router
  .route("/product/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), createProductConfig)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)
  .get(getSingleProduct);

router
  .route("/product/config/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)
  .get(getSingleProduct);
router.route("/product/review").post(isAuthenticatedUser, createProductReview);

router
  .route("/category/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createCategory);

router.route("/categories").get(getAllCategory);


router
  .route("/category/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCategory)
  //.delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)
  .get(SubCatByID);
   
router
  .route("/subcat/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), addSubCat)
  //.delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)
  .get(getSingleProduct);

router
  .route("/reviews")
  .get(getSingleProductReviews)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);

module.exports = router;
