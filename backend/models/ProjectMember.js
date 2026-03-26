/**
 * Project Member Model
 * Manages team members and their roles within projects
 */

const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Product Manager', 'Team Lead', 'Developer'],
    required: true
  },
  specialization: {
    type: String,
    enum: ['Frontend', 'Backend', 'Database', 'UI/UX Design', 'DevOps', 'Testing', 'Full Stack', 'None'],
    default: 'None'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'removed'],
    default: 'pending'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date
  }
});

// Compound index to ensure a user can only have one role per product
projectMemberSchema.index({ product: 1, user: 1 }, { unique: true });
projectMemberSchema.index({ user: 1, status: 1, invitedAt: -1 });
projectMemberSchema.index({ product: 1, status: 1, invitedAt: -1 });
projectMemberSchema.index({ product: 1, role: 1, status: 1 });

module.exports = mongoose.model('ProjectMember', projectMemberSchema);
