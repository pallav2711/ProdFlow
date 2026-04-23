/**
 * Task Model
 * Stores individual tasks within sprints
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    required: true
  },
  feature: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  workType: {
    type: String,
    enum: ['Frontend', 'Backend', 'Database', 'UI/UX Design', 'DevOps', 'Testing', 'Full Stack'],
    required: [true, 'Work type is required']
  },
  estimatedHours: {
    type: Number,
    required: [true, 'Estimated hours is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Pending Review', 'Completed', 'Blocked'],
    default: 'To Do'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  isVoided: {
    type: Boolean,
    default: false
  },
  voidedAt: {
    type: Date
  },
  voidReason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Optimised indexes — covers all analytics and task-list queries
taskSchema.index({ sprint: 1, isVoided: 1, status: 1 })
taskSchema.index({ assignedTo: 1, isVoided: 1, status: 1, createdAt: -1 })
taskSchema.index({ isVoided: 1, status: 1, createdAt: -1 })
taskSchema.index({ sprint: 1, createdAt: -1 })
// New: Analytics query optimization
taskSchema.index({ isVoided: 1, createdAt: 1 }) // For date-range analytics queries
taskSchema.index({ sprint: 1, assignedTo: 1, isVoided: 1 }) // For developer performance queries

module.exports = mongoose.model('Task', taskSchema);
