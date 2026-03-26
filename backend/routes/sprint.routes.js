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
  getMyTasks
} = require('../controllers/sprint.controller');
const { protect, authorize } = require('../middleware/auth');
const { validateSprint, validateTask, validateObjectId } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Get my tasks
router.get('/my-tasks', getMyTasks);

router.route('/')
  .post(authorize('Team Lead', 'Product Manager'), createSprint)
  .get(getSprints);

router.route('/:id')
  .get(validateObjectId('id'), getSprint)
  .put(authorize('Team Lead', 'Product Manager'), validateObjectId('id'), validateSprint, updateSprint)
  .delete(authorize('Team Lead', 'Product Manager'), validateObjectId('id'), deleteSprint);

router.route('/:id/tasks')
  .post(authorize('Team Lead', 'Product Manager'), validateObjectId('id'), validateTask, addTask);

router.route('/tasks/:taskId')
  .put(validateObjectId('taskId'), updateTaskStatus);

router.route('/tasks/:taskId/reject')
  .put(authorize('Team Lead', 'Product Manager'), validateObjectId('taskId'), rejectTask);

module.exports = router;
