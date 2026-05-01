/**
 * Sprint Routes
 */

const express = require('express');
const router = express.Router();
const {
  createSprint,
  getSprints,
  getSprint,
  addTask,
  updateTaskStatus,
  rejectTask,
  deleteSprint,
  updateSprint,
  getMyTasks,
  getAllTeamTasks
} = require('../controllers/sprint.controller');
const { protect, authorize } = require('../middleware/auth');
const { validateSprint, validateTask, validateObjectId } = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');

// All routes require authentication
router.use(protect);

// Get my tasks
router.get('/my-tasks', getMyTasks);

// Get all team tasks
router.get('/all-tasks', getAllTeamTasks);

router.route('/')
  .post(authorize('Team Lead', 'Product Manager'), asyncHandler(createSprint))
  .get(asyncHandler(getSprints));

router.route('/:id')
  .get(validateObjectId('id'), asyncHandler(getSprint))
  .put(authorize('Team Lead', 'Product Manager'), validateObjectId('id'), validateSprint, asyncHandler(updateSprint))
  .delete(authorize('Team Lead', 'Product Manager'), validateObjectId('id'), asyncHandler(deleteSprint));

router.route('/:id/tasks')
  .post(authorize('Team Lead', 'Product Manager'), validateObjectId('id'), validateTask, asyncHandler(addTask));

router.route('/tasks/:taskId')
  .put(validateObjectId('taskId'), asyncHandler(updateTaskStatus));

router.route('/tasks/:taskId/reject')
  .put(authorize('Team Lead', 'Product Manager'), validateObjectId('taskId'), asyncHandler(rejectTask));

module.exports = router;
