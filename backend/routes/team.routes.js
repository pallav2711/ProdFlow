/**
 * Team Routes
 */

const express = require('express');
const router = express.Router();
const {
  inviteUser,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  getProductTeam,
  removeMember
} = require('../controllers/team.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Invite user to project (Product Manager only)
router.post('/invite', authorize('Product Manager'), inviteUser);

// Get my pending invitations
router.get('/invitations', getMyInvitations);

// Accept/Reject invitations
router.put('/invitations/:id/accept', acceptInvitation);
router.put('/invitations/:id/reject', rejectInvitation);

// Get team members for a product
router.get('/product/:productId', getProductTeam);

// Remove member (Product Manager only)
router.delete('/:memberId', authorize('Product Manager'), removeMember);

module.exports = router;
