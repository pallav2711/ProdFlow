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
const asyncHandler = require('../middleware/asyncHandler');

// All routes require authentication
router.use(protect);

router.route('/')
  .post(authorize('Product Manager'), asyncHandler(createProduct))
  .get(asyncHandler(getProducts));

router.route('/:id')
  .get(asyncHandler(getProduct))
  .put(authorize('Product Manager'), asyncHandler(updateProduct))
  .delete(authorize('Product Manager'), asyncHandler(deleteProduct));

router.route('/:id/features')
  .post(authorize('Product Manager'), asyncHandler(addFeature))
  .get(asyncHandler(getFeatures));

router.route('/features/:id')
  .put(authorize('Product Manager'), asyncHandler(updateFeature))
  .delete(authorize('Product Manager'), asyncHandler(deleteFeature));

module.exports = router;
