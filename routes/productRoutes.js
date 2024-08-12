const router = require('express').Router();
const productController = require('../controllers/productControllers');

// router.post('/create_product', authGuardAdmin,productController.createProduct)
router.post('/create_product',productController.createProduct)

// get all products
router.get('/get_products',productController.getProducts)

// singleProduct
router.get("/get_product/:id",productController.getSingleProduct)

// update product
// router.put("/update_product/:id",authGuardAdmin,productController.updateProduct)
router.put("/update_product/:id",productController.updateProduct)

// delete product
// router.delete("/delete_product/:id",authGuardAdmin,productController.deleteProduct)
router.delete("/delete_product/:id",productController.deleteProduct)

module.exports = router;