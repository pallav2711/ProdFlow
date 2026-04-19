/**
 * Request Validation Middleware
 * Validates and sanitizes incoming requests
 */

const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
        errors: errors.array()
      })
    );
  }
  next();
};

// User registration validation
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    // Avoid changing Gmail dots / sub-address vs what users typed when registering
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false
    })
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 10, max: 128 })
    .withMessage('Password must be between 10 and 128 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must include at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must include at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must include at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-\[\]\\;/+=~`]/)
    .withMessage('Password must include at least one special character'),
  
  body('role')
    .isIn(['Product Manager', 'Team Lead', 'Developer'])
    .withMessage('Invalid role specified'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    // Avoid changing Gmail dots / sub-address vs what users typed when registering
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false
    })
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Product creation validation
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('vision')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Product vision must be between 10 and 500 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  handleValidationErrors
];

// Sprint creation validation
const validateSprint = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Sprint name must be between 2 and 100 characters'),
  
  body('duration')
    .isInt({ min: 1, max: 8 })
    .withMessage('Sprint duration must be between 1 and 8 weeks'),
  
  body('teamSize')
    .isInt({ min: 1, max: 20 })
    .withMessage('Team size must be between 1 and 20 members'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Feature creation validation
const validateFeature = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Feature name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('priority')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority level'),
  
  body('businessValue')
    .isInt({ min: 1, max: 10 })
    .withMessage('Business value must be between 1 and 10'),
  
  body('estimatedEffort')
    .isInt({ min: 1, max: 100 })
    .withMessage('Estimated effort must be between 1 and 100 hours'),
  
  handleValidationErrors
];

// Task creation validation
const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Task title must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('workType')
    .isIn(['Frontend', 'Backend', 'Database', 'UI/UX Design', 'DevOps', 'Testing', 'Full Stack'])
    .withMessage('Invalid work type'),
  
  body('estimatedHours')
    .isInt({ min: 1, max: 40 })
    .withMessage('Estimated hours must be between 1 and 40'),
  
  handleValidationErrors
];

// ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateSprint,
  validateFeature,
  validateTask,
  validateObjectId,
  handleValidationErrors
};