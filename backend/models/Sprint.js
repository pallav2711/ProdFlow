/**
 * Sprint Model
 * Stores sprint information and AI predictions
 */

const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sprint name is required'],
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  duration: {
    type: Number,
    required: [true, 'Sprint duration is required'],
    min: 1
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  teamSize: {
    type: Number,
    required: [true, 'Team size is required'],
    min: 1
  },
  features: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature'
  }],
  aiPrediction: {
    successProbability: {
      type: Number,
      min: 0,
      max: 100
    },
    predictedAt: Date
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Completed'],
    default: 'Planning'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Common read/query paths
sprintSchema.index({ product: 1, createdAt: -1 });
sprintSchema.index({ createdBy: 1, createdAt: -1 });
sprintSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Sprint', sprintSchema);
