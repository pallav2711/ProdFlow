/**
 * Team Controller
 * Handles project team invitations and member management
 */

const ProjectMember = require('../models/ProjectMember');
const Product = require('../models/Product');
const User = require('../models/User');
const { validationError, forbiddenError, notFoundError } = require('../utils/errorFactory');
const { parsePagination } = require('../utils/pagination');

// @desc    Invite user to project
// @route   POST /api/teams/invite
// @access  Private (Product Manager only)
exports.inviteUser = async (req, res, next) => {
  try {
    const { productId, email, userEmail, role, specialization } = req.body;
    const emailToUse = email || userEmail; // Support both field names

    // Check if product exists and user is the creator
    const product = await Product.findById(productId);
    if (!product) {
      return next(notFoundError('Product not found', 'PRODUCT_NOT_FOUND'));
    }

    if (product.createdBy.toString() !== req.user.id) {
      return next(forbiddenError('Only product creator can invite members', 'INVITE_FORBIDDEN'));
    }

    // Find user by email
    const userToInvite = await User.findOne({ email: emailToUse });
    if (!userToInvite) {
      return next(notFoundError('User not found with this email', 'INVITE_USER_NOT_FOUND'));
    }

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      product: productId,
      user: userToInvite._id
    });

    if (existingMember) {
      return next(validationError('User is already a member of this project', 'ALREADY_PROJECT_MEMBER'));
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
    return next(error);
  }
};

// @desc    Get pending invitations for current user
// @route   GET /api/teams/invitations
// @access  Private
exports.getMyInvitations = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);

    const filter = {
      user: req.user.id,
      status: 'pending'
    };

    let invitationQuery = ProjectMember.find(filter)
      .select('product user role specialization status invitedBy invitedAt joinedAt')
      .populate('product', 'name vision')
      .populate('invitedBy', 'name email')
      .sort('-invitedAt');

    if (pagination) {
      invitationQuery = invitationQuery.skip(pagination.skip).limit(pagination.limit);
    }

    const invitations = await invitationQuery.lean();
    const totalCount = pagination ? await ProjectMember.countDocuments(filter) : invitations.length;

    res.status(200).json({
      success: true,
      count: invitations.length,
      ...(pagination ? {
        totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit) || 1
      } : {}),
      invitations
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Accept invitation
// @route   PUT /api/teams/invitations/:id/accept
// @access  Private
exports.acceptInvitation = async (req, res, next) => {
  try {
    const invitation = await ProjectMember.findById(req.params.id);

    if (!invitation) {
      return next(notFoundError('Invitation not found', 'INVITATION_NOT_FOUND'));
    }

    if (invitation.user.toString() !== req.user.id) {
      return next(forbiddenError('Not authorized', 'INVITATION_ACTION_FORBIDDEN'));
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
    return next(error);
  }
};

// @desc    Reject invitation
// @route   PUT /api/teams/invitations/:id/reject
// @access  Private
exports.rejectInvitation = async (req, res, next) => {
  try {
    const invitation = await ProjectMember.findById(req.params.id);

    if (!invitation) {
      return next(notFoundError('Invitation not found', 'INVITATION_NOT_FOUND'));
    }

    if (invitation.user.toString() !== req.user.id) {
      return next(forbiddenError('Not authorized', 'INVITATION_ACTION_FORBIDDEN'));
    }

    await invitation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invitation rejected'
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get team members for a product
// @route   GET /api/teams/product/:productId
// @access  Private
exports.getProductTeam = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);

    const filter = {
      product: req.params.productId
    };

    let memberQuery = ProjectMember.find(filter)
      .select('product user role specialization status invitedBy invitedAt joinedAt')
      .populate('user', 'name email role')
      .sort('-invitedAt');

    if (pagination) {
      memberQuery = memberQuery.skip(pagination.skip).limit(pagination.limit);
    }

    const members = await memberQuery.lean();
    const totalCount = pagination ? await ProjectMember.countDocuments(filter) : members.length;

    res.status(200).json({
      success: true,
      count: members.length,
      ...(pagination ? {
        totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit) || 1
      } : {}),
      members
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/teams/:memberId
// @access  Private (Product Manager only)
exports.removeMember = async (req, res, next) => {
  try {
    const member = await ProjectMember.findById(req.params.memberId).populate('product');

    if (!member) {
      return next(notFoundError('Member not found', 'MEMBER_NOT_FOUND'));
    }

    // Check if requester is the product creator
    if (member.product.createdBy.toString() !== req.user.id) {
      return next(forbiddenError('Only product creator can remove members', 'MEMBER_REMOVE_FORBIDDEN'));
    }

    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Member removed from project'
    });
  } catch (error) {
    return next(error);
  }
};
