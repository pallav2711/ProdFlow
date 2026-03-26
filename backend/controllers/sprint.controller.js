/**
 * Sprint Controller
 * Handles sprint and task management with AI predictions
 */

const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Feature = require('../models/Feature');
const ProjectMember = require('../models/ProjectMember');
const axios = require('axios');

// @desc    Create new sprint with AI prediction
// @route   POST /api/sprints
// @access  Private (Team Lead only)
exports.createSprint = async (req, res) => {
  try {
    const { name, product, duration, startDate, endDate, teamSize, features } = req.body;

    // Validate required fields
    if (!name || !product || !duration || !startDate || !endDate || !teamSize) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, product, duration, startDate, endDate, teamSize'
      });
    }

    // Validate data types
    if (isNaN(duration) || isNaN(teamSize)) {
      return res.status(400).json({
        success: false,
        message: 'Duration and team size must be valid numbers'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for startDate or endDate'
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check if user is a member of this product
    const membership = await ProjectMember.findOne({
      product: product,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this product'
      });
    }

    // Calculate total estimated effort from features (handle empty features array)
    let totalEffort = 0;
    let totalTasks = 0;
    
    if (features && features.length > 0) {
      const featureList = await Feature.find({ _id: { $in: features } });
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
      features: features || [],
      createdBy: req.user.id
    });

    // Call AI service for prediction
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/ai/sprint-success`, {
        total_tasks: totalTasks,
        sprint_duration: duration,
        team_size: teamSize,
        estimated_effort: totalEffort
      });

      // Update sprint with AI prediction
      sprint.aiPrediction = {
        successProbability: aiResponse.data.success_probability,
        predictedAt: new Date()
      };
      await sprint.save();
    } catch (aiError) {
      console.error('AI Service Error:', aiError.message);
      // Continue without AI prediction if service is unavailable
    }

    // Update feature status
    await Feature.updateMany(
      { _id: { $in: features } },
      { status: 'In Sprint' }
    );

    const populatedSprint = await Sprint.findById(sprint._id)
      .populate('product', 'name')
      .populate('features')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      sprint: populatedSprint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all sprints
// @route   GET /api/sprints
// @access  Private
exports.getSprints = async (req, res) => {
  try {
    // Get products user is a member of
    const memberships = await ProjectMember.find({
      user: req.user.id,
      status: 'active'
    });

    if (!memberships || memberships.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        sprints: [],
        message: 'No product memberships found'
      });
    }

    const productIds = memberships.map(m => m.product);

    // Get sprints for those products
    const sprints = await Sprint.find({
      product: { $in: productIds }
    })
      .populate('product', 'name')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: sprints.length,
      sprints: sprints || []
    });
  } catch (error) {
    console.error('Error in getSprints:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      sprints: []
    });
  }
};

// @desc    Get single sprint
// @route   GET /api/sprints/:id
// @access  Private
exports.getSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate('product', 'name vision')
      .populate('features')
      .populate('createdBy', 'name email');

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    // Get tasks for this sprint
    const tasks = await Task.find({ sprint: sprint._id })
      .populate('feature', 'name')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      sprint,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add task to sprint
// @route   POST /api/sprints/:id/tasks
// @access  Private (Team Lead only)
exports.addTask = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update task status
// @route   PUT /api/sprints/tasks/:taskId
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    const task = await Task.findById(req.params.taskId)
      .populate('sprint')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check user's role in the product
    const membership = await ProjectMember.findOne({
      product: task.sprint.product,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this task'
      });
    }

    // Role-based status update rules
    const userRole = membership.role;
    const currentStatus = task.status;

    // Developers can only move tasks to: In Progress, Pending Review, Blocked
    if (userRole === 'Developer') {
      if (status === 'Completed') {
        return res.status(403).json({
          success: false,
          message: 'Developers cannot mark tasks as Completed. Please submit for review (Pending Review) instead.'
        });
      }
      
      // Developers can only update their own tasks
      if (task.assignedTo && task.assignedTo._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update tasks assigned to you'
        });
      }
    }

    // Team Lead or Product Manager can approve tasks
    if (status === 'Completed' && currentStatus === 'Pending Review') {
      if (userRole === 'Team Lead' || userRole === 'Product Manager') {
        task.reviewedBy = req.user.id;
        task.reviewedAt = new Date();
        task.reviewNotes = reviewNotes || 'Approved';
      } else {
        return res.status(403).json({
          success: false,
          message: 'Only Team Lead or Product Manager can approve tasks'
        });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject task (Team Lead sends back for revision)
// @route   PUT /api/sprints/tasks/:taskId/reject
// @access  Private (Team Lead or Product Manager)
exports.rejectTask = async (req, res) => {
  try {
    const { reviewNotes } = req.body;

    const task = await Task.findById(req.params.taskId)
      .populate('sprint')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check user's role in the product
    const membership = await ProjectMember.findOne({
      product: task.sprint.product,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this task'
      });
    }

    // Only Team Lead or Product Manager can reject
    if (membership.role !== 'Team Lead' && membership.role !== 'Product Manager') {
      return res.status(403).json({
        success: false,
        message: 'Only Team Lead or Product Manager can reject tasks'
      });
    }

    // Can only reject tasks in Pending Review
    if (task.status !== 'Pending Review') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject tasks that are in Pending Review status'
      });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
// @access  Private (Team Lead or Product Manager)
exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    // Check if user is a member of the product
    const membership = await ProjectMember.findOne({
      product: sprint.product,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this sprint'
      });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:id
// @access  Private (Team Lead or Product Manager)
exports.updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    // Check if user is a member of the product
    const membership = await ProjectMember.findOne({
      product: sprint.product,
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this sprint'
      });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get tasks assigned to current user
// @route   GET /api/sprints/my-tasks
// @access  Private
exports.getMyTasks = async (req, res) => {
  try {
    // Get all tasks assigned to current user
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('feature', 'name')
      .populate('sprint', 'name')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
