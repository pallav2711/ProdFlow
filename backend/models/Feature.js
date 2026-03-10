/**
 * Feature Model (Epic)
 * Stores product features/epics with priority and business value
 */

const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Feature name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Feature description is required']
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  businessValue: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Business value is required']
  },
  estimatedEffort: {
    type: Number,
    required: [true, 'Estimated effort is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['Backlog', 'In Sprint', 'Completed'],
    default: 'Backlog'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feature', featureSchema);
