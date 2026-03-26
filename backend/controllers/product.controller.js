/**
 * Product Controller
 * Handles product and feature management with team-based access control
 */

const Product = require('../models/Product');
const Feature = require('../models/Feature');
const ProjectMember = require('../models/ProjectMember');
const { forbiddenError, notFoundError } = require('../utils/errorFactory');
const { parsePagination } = require('../utils/pagination');

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Product Manager only)
exports.createProduct = async (req, res, next) => {
  try {
    const { name, vision, description } = req.body;

    const product = await Product.create({
      name,
      vision,
      description,
      createdBy: req.user.id,
      isPrivate: true
    });

    // Automatically add creator as active member
    await ProjectMember.create({
      product: product._id,
      user: req.user.id,
      role: 'Product Manager',
      invitedBy: req.user.id,
      status: 'active',
      joinedAt: new Date()
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get all products user has access to
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);

    // Find all products where user is an active member
    const memberships = await ProjectMember.find({
      user: req.user.id,
      status: 'active'
    }).select('product').lean();

    const productIds = memberships.map(m => m.product);

    const filter = {
      _id: { $in: productIds }
    };

    let productQuery = Product.find(filter)
      .select('name vision description createdBy isPrivate createdAt')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    if (pagination) {
      productQuery = productQuery.skip(pagination.skip).limit(pagination.limit);
    }

    const products = await productQuery.lean();
    const totalCount = pagination ? await Product.countDocuments(filter) : products.length;

    res.status(200).json({
      success: true,
      count: products.length,
      ...(pagination ? {
        totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit) || 1
      } : {}),
      products
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res, next) => {
  try {
    // Check if user has access to this product
    const membership = await ProjectMember.findOne({
      product: req.params.id,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return next(forbiddenError('You do not have access to this product', 'PRODUCT_ACCESS_FORBIDDEN'));
    }

    const product = await Product.findById(req.params.id)
      .select('name vision description createdBy isPrivate createdAt')
      .populate('createdBy', 'name email')
      .lean();

    if (!product) {
      return next(notFoundError('Product not found', 'PRODUCT_NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Add feature to product
// @route   POST /api/products/:id/features
// @access  Private (Product Manager only)
exports.addFeature = async (req, res, next) => {
  try {
    // Check if user has Product Manager access to this product
    const membership = await ProjectMember.findOne({
      product: req.params.id,
      user: req.user.id,
      role: 'Product Manager',
      status: 'active'
    });

    if (!membership) {
      return next(forbiddenError('Only Product Managers can add features', 'FEATURE_CREATE_FORBIDDEN'));
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(notFoundError('Product not found', 'PRODUCT_NOT_FOUND'));
    }

    const { name, description, priority, businessValue, estimatedEffort } = req.body;

    const feature = await Feature.create({
      product: product._id,
      name,
      description,
      priority,
      businessValue,
      estimatedEffort
    });

    res.status(201).json({
      success: true,
      feature
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get features for a product
// @route   GET /api/products/:id/features
// @access  Private
exports.getFeatures = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);

    // Check if user has access to this product
    const membership = await ProjectMember.findOne({
      product: req.params.id,
      user: req.user.id,
      status: 'active'
    }).select('_id').lean();

    if (!membership) {
      return next(forbiddenError('You do not have access to this product', 'PRODUCT_ACCESS_FORBIDDEN'));
    }

    const filter = { product: req.params.id };

    let featureQuery = Feature.find(filter)
      .select('product name description priority businessValue estimatedEffort status createdAt')
      .sort('-createdAt');

    if (pagination) {
      featureQuery = featureQuery.skip(pagination.skip).limit(pagination.limit);
    }

    const features = await featureQuery.lean();
    const totalCount = pagination ? await Feature.countDocuments(filter) : features.length;

    res.status(200).json({
      success: true,
      count: features.length,
      ...(pagination ? {
        totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit) || 1
      } : {}),
      features
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Product Manager only)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(notFoundError('Product not found', 'PRODUCT_NOT_FOUND'));
    }

    // Check if user is the creator
    if (product.createdBy.toString() !== req.user.id) {
      return next(forbiddenError('Only product creator can update the product', 'PRODUCT_UPDATE_FORBIDDEN'));
    }

    const { name, vision, description } = req.body;

    product.name = name || product.name;
    product.vision = vision || product.vision;
    product.description = description || product.description;

    await product.save();

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Product Manager only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(notFoundError('Product not found', 'PRODUCT_NOT_FOUND'));
    }

    // Check if user is the creator
    if (product.createdBy.toString() !== req.user.id) {
      return next(forbiddenError('Only product creator can delete the product', 'PRODUCT_DELETE_FORBIDDEN'));
    }

    // Delete all features
    await Feature.deleteMany({ product: product._id });

    // Delete all project members
    await ProjectMember.deleteMany({ product: product._id });

    // Delete the product
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product and all associated data deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update feature
// @route   PUT /api/products/features/:id
// @access  Private (Product Manager only)
exports.updateFeature = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);

    if (!feature) {
      return next(notFoundError('Feature not found', 'FEATURE_NOT_FOUND'));
    }

    // Check if user has Product Manager access
    const membership = await ProjectMember.findOne({
      product: feature.product,
      user: req.user.id,
      role: 'Product Manager',
      status: 'active'
    });

    if (!membership) {
      return next(forbiddenError('Only Product Managers can update features', 'FEATURE_UPDATE_FORBIDDEN'));
    }

    const { name, description, priority, businessValue, estimatedEffort } = req.body;

    feature.name = name || feature.name;
    feature.description = description || feature.description;
    feature.priority = priority || feature.priority;
    feature.businessValue = businessValue !== undefined ? businessValue : feature.businessValue;
    feature.estimatedEffort = estimatedEffort !== undefined ? estimatedEffort : feature.estimatedEffort;

    await feature.save();

    res.status(200).json({
      success: true,
      feature
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete feature
// @route   DELETE /api/products/features/:id
// @access  Private (Product Manager only)
exports.deleteFeature = async (req, res, next) => {
  try {
    const feature = await Feature.findById(req.params.id);

    if (!feature) {
      return next(notFoundError('Feature not found', 'FEATURE_NOT_FOUND'));
    }

    // Check if user has Product Manager access
    const membership = await ProjectMember.findOne({
      product: feature.product,
      user: req.user.id,
      role: 'Product Manager',
      status: 'active'
    });

    if (!membership) {
      return next(forbiddenError('Only Product Managers can delete features', 'FEATURE_DELETE_FORBIDDEN'));
    }

    await feature.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Feature deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};
