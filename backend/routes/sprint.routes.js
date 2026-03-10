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

// All routes require authentication
router.use(protect);

// Get my tasks
router.get('/my-tasks', getMyTasks);

router.route('/')
  .post(authorize('Team Lead', 'Product Manager'), createSprint)
  .get(getSprints);

router.route('/:id')
  .get(getSprint)
  .put(authorize('Team Lead', 'Product Manager'), updateSprint)
  .delete(authorize('Team Lead', 'Product Manager'), deleteSprint);

router.route('/:id/tasks')
  .post(authorize('Team Lead', 'Product Manager'), addTask);

router.route('/tasks/:taskId')
  .put(updateTaskStatus);

router.route('/tasks/:taskId/reject')
  .put(authorize('Team Lead', 'Product Manager'), rejectTask);

module.exports = router;
