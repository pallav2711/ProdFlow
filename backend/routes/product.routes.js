/**
 * Product Routes
 */

const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  addFeature,
  getFeatures,
  updateProduct,
  deleteProduct,
  updateFeature,
  deleteFeature
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .post(authorize('Product Manager'), createProduct)
  .get(getProducts);

router.route('/:id')
  .get(getProduct)
  .put(authorize('Product Manager'), updateProduct)
  .delete(authorize('Product Manager'), deleteProduct);

router.route('/:id/features')
  .post(authorize('Product Manager'), addFeature)
  .get(getFeatures);

router.route('/features/:id')
  .put(authorize('Product Manager'), updateFeature)
  .delete(authorize('Product Manager'), deleteFeature);

module.exports = router;
