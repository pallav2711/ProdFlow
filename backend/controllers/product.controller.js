/**
 * Product Controller
 * Handles product and feature management with team-based access control
 */

const Product = require('../models/Product');
const Feature = require('../models/Feature');
const ProjectMember = require('../models/ProjectMember');

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Product Manager only)
exports.createProduct = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all products user has access to
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    // Find all products where user is an active member
    const memberships = await ProjectMember.find({
      user: req.user.id,
      status: 'active'
    }).select('product');

    const productIds = memberships.map(m => m.product);

    const products = await Product.find({
      _id: { $in: productIds }
    })
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    // Check if user has access to this product
    const membership = await ProjectMember.findOne({
      product: req.params.id,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this product'
      });
    }

    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add feature to product
// @route   POST /api/products/:id/features
// @access  Private (Product Manager only)
exports.addFeature = async (req, res) => {
  try {
    // Check if user has Product Manager access to this product
    const membership = await ProjectMember.findOne({
      product: req.params.id,
      user: req.user.id,
      role: 'Product Manager',
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Only Product Managers can add features'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get features for a product
// @route   GET /api/products/:id/features
// @access  Private
exports.getFeatures = async (req, res) => {
  try {
    // Check if user has access to this product
    const membership = await ProjectMember.findOne({
      product: req.params.id,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this product'
      });
    }

    const features = await Feature.find({ product: req.params.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: features.length,
      features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Product Manager only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the creator
    if (product.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only product creator can update the product'
      });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Product Manager only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the creator
    if (product.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only product creator can delete the product'
      });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update feature
// @route   PUT /api/products/features/:id
// @access  Private (Product Manager only)
exports.updateFeature = async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    // Check if user has Product Manager access
    const membership = await ProjectMember.findOne({
      product: feature.product,
      user: req.user.id,
      role: 'Product Manager',
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Only Product Managers can update features'
      });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete feature
// @route   DELETE /api/products/features/:id
// @access  Private (Product Manager only)
exports.deleteFeature = async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    // Check if user has Product Manager access
    const membership = await ProjectMember.findOne({
      product: feature.product,
      user: req.user.id,
      role: 'Product Manager',
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Only Product Managers can delete features'
      });
    }

    await feature.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Feature deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
