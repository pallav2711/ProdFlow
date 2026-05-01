/**
 * Sprint Controller
 * Handles sprint and task management with AI predictions
 */

const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Feature = require('../models/Feature');
const ProjectMember = require('../models/ProjectMember');
const { validationError, forbiddenError, notFoundError } = require('../utils/errorFactory');
const { parsePagination } = require('../utils/pagination');
const { fetchSprintPrediction } = require('../utils/aiClient');

// @desc    Create new sprint with AI prediction
// @route   POST /api/sprints
// @access  Private (Team Lead only)
exports.createSprint = async (req, res, next) => {
  try {
    const { name, product, duration, startDate, endDate, teamSize, features } = req.body;

    console.log('Sprint creation request:', {
      name,
      product,
      duration,
      startDate,
      endDate,
      teamSize,
      features,
      featuresType: typeof features,
      featuresIsArray: Array.isArray(features)
    });

    // Validate required fields
    if (!name || !product || !duration || !startDate || !endDate || !teamSize) {
      return next(validationError(
        'Missing required fields: name, product, duration, startDate, endDate, teamSize',
        'MISSING_REQUIRED_FIELDS'
      ));
    }

    // Validate data types
    if (isNaN(duration) || isNaN(teamSize)) {
      return next(validationError('Duration and team size must be valid numbers', 'INVALID_NUMERIC_FIELDS'));
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(validationError('Invalid date format for startDate or endDate', 'INVALID_DATE_FORMAT'));
    }

    if (end <= start) {
      return next(validationError('End date must be after start date', 'INVALID_DATE_RANGE'));
    }

    // Handle features array - fix the parsing issue
    let featuresArray = [];
    if (features) {
      if (Array.isArray(features)) {
        featuresArray = features;
      } else if (typeof features === 'string') {
        try {
          // Try to parse if it's a stringified array
          featuresArray = JSON.parse(features);
        } catch (e) {
          console.error('Failed to parse features string:', features);
          return next(validationError('Invalid features format', 'INVALID_FEATURES_FORMAT'));
        }
      } else if (typeof features === 'object') {
        // Convert object to array if needed
        featuresArray = Object.values(features);
      }
    }

    console.log('Processed features array:', featuresArray);

    // Check if user is a member of this product
    const membership = await ProjectMember.findOne({
      product: product,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return next(forbiddenError('You are not a member of this product', 'PRODUCT_MEMBERSHIP_REQUIRED'));
    }

    // Calculate total estimated effort from features (handle empty features array)
    let totalEffort = 0;
    let totalTasks = 0;
    
    if (featuresArray && featuresArray.length > 0) {
      const featureList = await Feature.find({ _id: { $in: featuresArray } });
      totalEffort = featureList.reduce((sum, f) => sum + (f.estimatedEffort || 0), 0);
      totalTasks = featureList.length;
    }

    // Create sprint
    const sprint = await Sprint.create({
      name,
      product,
      duration: parseInt(duration),
      startDate: start,
      endDate: end,
      teamSize: parseInt(teamSize),
      features: featuresArray,
      createdBy: req.user.id
    });

    // Call AI service for prediction
    try {
      const prediction = await fetchSprintPrediction({
        totalTasks,
        duration,
        teamSize,
        totalEffort,
        requestId: req.requestId
      });

      // Update sprint with AI prediction
      sprint.aiPrediction = {
        successProbability: prediction.successProbability,
        predictedAt: new Date()
      };
      await sprint.save();
    } catch (aiError) {
      console.error(
        JSON.stringify({
          level: 'warn',
          event: 'ai_prediction_unavailable',
          requestId: req.requestId,
          sprintId: sprint._id?.toString?.(),
          message: aiError.message
        })
      );
      // Continue without AI prediction if service is unavailable
    }

    // Update feature status
    if (featuresArray && featuresArray.length > 0) {
      await Feature.updateMany(
        { _id: { $in: featuresArray } },
        { status: 'In Sprint' }
      );
    }

    const populatedSprint = await Sprint.findById(sprint._id)
      .populate('product', 'name')
      .populate('features')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      sprint: populatedSprint
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get all sprints
// @route   GET /api/sprints
// @access  Private
exports.getSprints = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);

    // Get products user is a member of
    const memberships = await ProjectMember.find({
      user: req.user.id,
      status: 'active'
    }).select('product').lean();

    if (!memberships || memberships.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        ...(pagination ? {
          totalCount: 0,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: 1
        } : {}),
        sprints: [],
        message: 'No product memberships found'
      });
    }

    const productIds = memberships.map((m) => m.product);

    // Get sprints for those products
    const filter = {
      product: { $in: productIds }
    };

    let sprintQuery = Sprint.find(filter)
      .select('name product duration startDate endDate teamSize aiPrediction status createdBy createdAt')
      .populate('product', 'name')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    if (pagination) {
      sprintQuery = sprintQuery.skip(pagination.skip).limit(pagination.limit);
    }

    const sprints = await sprintQuery.lean();
    const totalCount = pagination ? await Sprint.countDocuments(filter) : sprints.length;

    res.status(200).json({
      success: true,
      count: sprints.length,
      ...(pagination ? {
        totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit) || 1
      } : {}),
      sprints: sprints || []
    });
  } catch (error) {
    console.error('Error in getSprints:', error);
    return next(error);
  }
};

// @desc    Get single sprint
// @route   GET /api/sprints/:id
// @access  Private
exports.getSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .select('name product duration startDate endDate teamSize features aiPrediction status createdBy createdAt')
      .populate('product', 'name vision')
      .populate('features')
      .populate('createdBy', 'name email')
      .lean();

    if (!sprint) {
      return next(notFoundError('Sprint not found', 'SPRINT_NOT_FOUND'));
    }

    // Get tasks for this sprint
    const tasks = await Task.find({ sprint: sprint._id })
      .select('sprint feature title description assignedTo workType estimatedHours status reviewedBy reviewedAt reviewNotes createdAt')
      .populate('feature', 'name')
      .populate('assignedTo', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      sprint,
      tasks
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Add task to sprint
// @route   POST /api/sprints/:id/tasks
// @access  Private (Team Lead only)
exports.addTask = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return next(notFoundError('Sprint not found', 'SPRINT_NOT_FOUND'));
    }

    const { feature, title, description, assignedTo, estimatedHours, workType } = req.body;

    const task = await Task.create({
      sprint: sprint._id,
      feature,
      title,
      description,
      assignedTo,
      workType,
      estimatedHours
    });

    const populatedTask = await Task.findById(task._id)
      .populate('feature', 'name')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      task: populatedTask
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update task status
// @route   PUT /api/sprints/tasks/:taskId
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;

    const task = await Task.findById(req.params.taskId)
      .populate('sprint')
      .populate('assignedTo', 'name email');

    if (!task) {
      return next(notFoundError('Task not found', 'TASK_NOT_FOUND'));
    }

    // Check user's role in the product
    const membership = await ProjectMember.findOne({
      product: task.sprint.product,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return next(forbiddenError('You are not authorized to update this task', 'TASK_UPDATE_FORBIDDEN'));
    }

    // Role-based status update rules
    const userRole = membership.role;
    const currentStatus = task.status;

    // Developers can only move tasks to: In Progress, Pending Review, Blocked
    if (userRole === 'Developer') {
      if (status === 'Completed') {
        return next(forbiddenError(
          'Developers cannot mark tasks as Completed. Please submit for review (Pending Review) instead.',
          'INVALID_STATUS_TRANSITION'
        ));
      }
      
      // Developers can only update their own tasks
      if (task.assignedTo && task.assignedTo._id.toString() !== req.user.id) {
        return next(forbiddenError('You can only update tasks assigned to you', 'TASK_OWNERSHIP_REQUIRED'));
      }
    }

    // Team Lead or Product Manager can approve tasks
    if (status === 'Completed' && currentStatus === 'Pending Review') {
      if (userRole === 'Team Lead' || userRole === 'Product Manager') {
        task.reviewedBy = req.user.id;
        task.reviewedAt = new Date();
        task.reviewNotes = reviewNotes || 'Approved';
      } else {
        return next(forbiddenError('Only Team Lead or Product Manager can approve tasks', 'TASK_APPROVAL_FORBIDDEN'));
      }
    }

    // Update task status
    task.status = status;
    await task.save();

    // Check if all tasks in sprint are completed
    const allTasks = await Task.find({ sprint: task.sprint._id });
    const allCompleted = allTasks.every(t => t.status === 'Completed');

    // Auto-complete sprint if all tasks are done
    if (allCompleted && allTasks.length > 0) {
      const sprint = await Sprint.findById(task.sprint._id);
      if (sprint.status !== 'Completed') {
        sprint.status = 'Completed';
        await sprint.save();
      }
    }

    const updatedTask = await Task.findById(task._id)
      .populate('feature', 'name')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      task: updatedTask,
      sprintCompleted: allCompleted && allTasks.length > 0
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Reject task (Team Lead sends back for revision)
// @route   PUT /api/sprints/tasks/:taskId/reject
// @access  Private (Team Lead or Product Manager)
exports.rejectTask = async (req, res, next) => {
  try {
    const { reviewNotes } = req.body;

    const task = await Task.findById(req.params.taskId)
      .populate('sprint')
      .populate('assignedTo', 'name email');

    if (!task) {
      return next(notFoundError('Task not found', 'TASK_NOT_FOUND'));
    }

    // Check user's role in the product
    const membership = await ProjectMember.findOne({
      product: task.sprint.product,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return next(forbiddenError('You are not authorized to reject this task', 'TASK_REJECT_FORBIDDEN'));
    }

    // Only Team Lead or Product Manager can reject
    if (membership.role !== 'Team Lead' && membership.role !== 'Product Manager') {
      return next(forbiddenError('Only Team Lead or Product Manager can reject tasks', 'TASK_REJECT_ROLE_FORBIDDEN'));
    }

    // Can only reject tasks in Pending Review
    if (task.status !== 'Pending Review') {
      return next(validationError(
        'Can only reject tasks that are in Pending Review status',
        'INVALID_TASK_REJECT_STATE'
      ));
    }

    // Send back to In Progress with review notes
    task.status = 'In Progress';
    task.reviewedBy = req.user.id;
    task.reviewedAt = new Date();
    task.reviewNotes = reviewNotes || 'Needs revision';
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('feature', 'name')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      task: updatedTask,
      message: 'Task sent back for revision'
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
// @access  Private (Team Lead or Product Manager)
exports.deleteSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return next(notFoundError('Sprint not found', 'SPRINT_NOT_FOUND'));
    }

    // Check if user is a member of the product
    const membership = await ProjectMember.findOne({
      product: sprint.product,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return next(forbiddenError('You are not authorized to delete this sprint', 'SPRINT_DELETE_FORBIDDEN'));
    }

    // Delete all tasks associated with this sprint
    await Task.deleteMany({ sprint: sprint._id });

    // Update features back to Backlog status
    await Feature.updateMany(
      { _id: { $in: sprint.features } },
      { status: 'Backlog' }
    );

    // Delete the sprint
    await sprint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sprint and associated tasks deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:id
// @access  Private (Team Lead or Product Manager)
exports.updateSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return next(notFoundError('Sprint not found', 'SPRINT_NOT_FOUND'));
    }

    // Check if user is a member of the product
    const membership = await ProjectMember.findOne({
      product: sprint.product,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return next(forbiddenError('You are not authorized to update this sprint', 'SPRINT_UPDATE_FORBIDDEN'));
    }

    const { name, duration, startDate, endDate, teamSize, status } = req.body;

    sprint.name = name || sprint.name;
    sprint.duration = duration || sprint.duration;
    sprint.startDate = startDate || sprint.startDate;
    sprint.endDate = endDate || sprint.endDate;
    sprint.teamSize = teamSize || sprint.teamSize;
    sprint.status = status || sprint.status;

    await sprint.save();

    const updatedSprint = await Sprint.findById(sprint._id)
      .populate('product', 'name')
      .populate('features')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      sprint: updatedSprint
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get tasks assigned to current user
// @route   GET /api/sprints/my-tasks
// @access  Private
exports.getMyTasks = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);

    // Get all tasks assigned to current user
    const filter = { assignedTo: req.user.id };

    let taskQuery = Task.find(filter)
      .select('sprint feature title description assignedTo workType estimatedHours status reviewedBy reviewedAt reviewNotes createdAt')
      .populate('feature', 'name')
      .populate('sprint', 'name')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    if (pagination) {
      taskQuery = taskQuery.skip(pagination.skip).limit(pagination.limit);
    }

    const tasks = await taskQuery.lean();
    const totalCount = pagination ? await Task.countDocuments(filter) : tasks.length;

    res.status(200).json({
      success: true,
      count: tasks.length,
      ...(pagination ? {
        totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit) || 1
      } : {}),
      tasks
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get all tasks from team (all products user is member of)
// @route   GET /api/sprints/all-tasks
// @access  Private
exports.getAllTeamTasks = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);

    // Get products user is a member of
    const memberships = await ProjectMember.find({
      user: req.user.id,
      status: 'active'
    }).select('product').lean();

    if (!memberships || memberships.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        ...(pagination ? {
          totalCount: 0,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: 1
        } : {}),
        tasks: [],
        message: 'No product memberships found'
      });
    }

    const productIds = memberships.map((m) => m.product);

    // Get all sprints for those products
    const sprints = await Sprint.find({
      product: { $in: productIds }
    }).select('_id').lean();

    const sprintIds = sprints.map(s => s._id);

    // Get all tasks from those sprints
    const filter = { sprint: { $in: sprintIds } };

    let taskQuery = Task.find(filter)
      .select('sprint feature title description assignedTo workType estimatedHours status reviewedBy reviewedAt reviewNotes createdAt')
      .populate('feature', 'name')
      .populate('sprint', 'name')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email')
      .sort('-createdAt');

    if (pagination) {
      taskQuery = taskQuery.skip(pagination.skip).limit(pagination.limit);
    }

    const tasks = await taskQuery.lean();
    const totalCount = pagination ? await Task.countDocuments(filter) : tasks.length;

    res.status(200).json({
      success: true,
      count: tasks.length,
      ...(pagination ? {
        totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit) || 1
      } : {}),
      tasks
    });
  } catch (error) {
    return next(error);
  }
};
