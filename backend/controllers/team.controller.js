/**
 * Team Controller
 * Handles project team invitations and member management
 */

const ProjectMember = require('../models/ProjectMember');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Invite user to project
// @route   POST /api/teams/invite
// @access  Private (Product Manager only)
exports.inviteUser = async (req, res) => {
  try {
    const { productId, email, userEmail, role, specialization } = req.body;
    const emailToUse = email || userEmail; // Support both field names

    // Check if product exists and user is the creator
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only product creator can invite members'
      });
    }

    // Find user by email
    const userToInvite = await User.findOne({ email: emailToUse });
    if (!userToInvite) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      product: productId,
      user: userToInvite._id
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    // Create invitation
    const invitation = await ProjectMember.create({
      product: productId,
      user: userToInvite._id,
      role,
      specialization: specialization || 'None',
      invitedBy: req.user.id,
      status: 'pending'
    });

    const populatedInvitation = await ProjectMember.findById(invitation._id)
      .populate('user', 'name email')
      .populate('product', 'name');

    res.status(201).json({
      success: true,
      invitation: populatedInvitation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get pending invitations for current user
// @route   GET /api/teams/invitations
// @access  Private
exports.getMyInvitations = async (req, res) => {
  try {
    const invitations = await ProjectMember.find({
      user: req.user.id,
      status: 'pending'
    })
      .populate('product', 'name vision')
      .populate('invitedBy', 'name email')
      .sort('-invitedAt');

    res.status(200).json({
      success: true,
      count: invitations.length,
      invitations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept invitation
// @route   PUT /api/teams/invitations/:id/accept
// @access  Private
exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await ProjectMember.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (invitation.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    invitation.status = 'active';
    invitation.joinedAt = new Date();
    await invitation.save();

    const populatedInvitation = await ProjectMember.findById(invitation._id)
      .populate('product', 'name vision')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Invitation accepted',
      invitation: populatedInvitation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject invitation
// @route   PUT /api/teams/invitations/:id/reject
// @access  Private
exports.rejectInvitation = async (req, res) => {
  try {
    const invitation = await ProjectMember.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (invitation.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await invitation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invitation rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get team members for a product
// @route   GET /api/teams/product/:productId
// @access  Private
exports.getProductTeam = async (req, res) => {
  try {
    const members = await ProjectMember.find({
      product: req.params.productId
    })
      .populate('user', 'name email role')
      .sort('-invitedAt');

    res.status(200).json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/teams/:memberId
// @access  Private (Product Manager only)
exports.removeMember = async (req, res) => {
  try {
    const member = await ProjectMember.findById(req.params.memberId).populate('product');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if requester is the product creator
    if (member.product.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only product creator can remove members'
      });
    }

    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Member removed from project'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
