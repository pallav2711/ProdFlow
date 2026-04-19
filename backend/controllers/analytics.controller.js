/**
 * Analytics Controller
 * Provides data aggregation endpoints for AI Performance Analysis Service
 */
const Sprint = require('../models/Sprint')
const Task = require('../models/Task')
const User = require('../models/User')
const asyncHandler = require('../middleware/asyncHandler')
const AppError = require('../utils/appError')

/**
 * Get aggregated sprint data for AI analysis
 * @route GET /api/analytics/sprints
 * @access Private (Product Manager)
 */
exports.getSprintAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  let query = {}
  
  if (startDate || endDate) {
    query.startDate = {}
    if (startDate) query.startDate.$gte = new Date(startDate)
    if (endDate) query.startDate.$lte = new Date(endDate)
  }

  const sprints = await Sprint.find(query)
    .populate('product', 'name')
    .populate('createdBy', 'name email role')
    .populate('features', 'name estimatedEffort')
    .lean()

  // Aggregate sprint data
  const sprintData = sprints.map(sprint => ({
    sprint_id: sprint._id.toString(),
    name: sprint.name,
    start_date: sprint.startDate,
    end_date: sprint.endDate,
    duration: sprint.duration,
    created_by: sprint.createdBy?._id?.toString() || '',
    created_by_name: sprint.createdBy?.name || 'Unknown',
    feature_count: sprint.features?.length || 0,
    team_size: sprint.teamSize,
    status: sprint.status,
    product_name: sprint.product?.name || 'Unknown'
  }))

  res.json({
    success: true,
    count: sprintData.length,
    sprints: sprintData
  })
})

/**
 * Get aggregated task data for AI analysis
 * @route GET /api/analytics/tasks
 * @access Private (Product Manager)
 */
exports.getTaskAnalytics = asyncHandler(async (req, res) => {
  const { sprintIds, developerIds } = req.query

  let query = {}
  
  if (sprintIds) {
    const ids = sprintIds.split(',')
    query.sprint = { $in: ids }
  }
  
  if (developerIds) {
    const ids = developerIds.split(',')
    query.assignedTo = { $in: ids }
  }

  const tasks = await Task.find(query)
    .populate('sprint', 'name startDate endDate')
    .populate('assignedTo', 'name email role')
    .populate('feature', 'name')
    .lean()

  // Aggregate task data with review information
  const taskData = tasks.map(task => {
    const reviewCount = task.reviewHistory?.length || 0
    const lastReview = task.reviewHistory?.[reviewCount - 1]
    
    return {
      task_id: task._id.toString(),
      sprint_id: task.sprint?._id?.toString() || '',
      sprint_name: task.sprint?.name || 'Unknown',
      feature_name: task.feature?.name || task.title,
      title: task.title,
      assigned_developer: task.assignedTo?._id?.toString() || '',
      developer_name: task.assignedTo?.name || 'Unassigned',
      estimated_hours: task.estimatedHours || 0,
      actual_hours: task.actualHours || null,
      review_count: reviewCount,
      status: task.status,
      work_type: task.workType,
      completion_date: task.completedAt,
      created_date: task.createdAt,
      sprint_end_date: task.sprint?.endDate
    }
  })

  res.json({
    success: true,
    count: taskData.length,
    tasks: taskData
  })
})

/**
 * Get review history data for AI analysis
 * @route GET /api/analytics/reviews
 * @access Private (Product Manager)
 */
exports.getReviewAnalytics = asyncHandler(async (req, res) => {
  const { taskIds, teamLeadIds } = req.query

  let query = {}
  
  if (taskIds) {
    const ids = taskIds.split(',')
    query._id = { $in: ids }
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email')
    .lean()

  // Extract all review history
  const reviews = []
  
  tasks.forEach(task => {
    if (task.reviewHistory && task.reviewHistory.length > 0) {
      task.reviewHistory.forEach((review, index) => {
        // Filter by team lead if specified
        if (teamLeadIds) {
          const leadIds = teamLeadIds.split(',')
          if (!leadIds.includes(review.reviewedBy?.toString())) {
            return
          }
        }

        reviews.push({
          review_id: `${task._id}_${index}`,
          task_id: task._id.toString(),
          submitted_by: task.assignedTo?._id?.toString() || '',
          submitted_by_name: task.assignedTo?.name || 'Unknown',
          reviewed_by: review.reviewedBy?.toString() || '',
          submission_time: review.submittedAt,
          review_time: review.reviewedAt,
          review_result: review.status,
          review_notes: review.reviewNotes
        })
      })
    }
  })

  res.json({
    success: true,
    count: reviews.length,
    reviews
  })
})

/**
 * Get user data for AI analysis
 * @route GET /api/analytics/users
 * @access Private (Product Manager)
 */
exports.getUserAnalytics = asyncHandler(async (req, res) => {
  const { roles } = req.query

  let query = {}
  
  if (roles) {
    const roleList = roles.split(',')
    query.role = { $in: roleList }
  }

  const users = await User.find(query)
    .select('name email role')
    .lean()

  const userData = users.map(user => ({
    user_id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  }))

  res.json({
    success: true,
    count: userData.length,
    users: userData
  })
})

/**
 * Get complete analytics dataset for AI service
 * @route GET /api/analytics/complete
 * @access Private (Product Manager)
 */
exports.getCompleteAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  // Build sprint query
  let sprintQuery = {}
  if (startDate || endDate) {
    sprintQuery.startDate = {}
    if (startDate) sprintQuery.startDate.$gte = new Date(startDate)
    if (endDate) sprintQuery.startDate.$lte = new Date(endDate)
  }

  // Fetch all data in parallel
  const [sprints, tasks, users] = await Promise.all([
    Sprint.find(sprintQuery)
      .populate('createdBy', 'name email role')
      .populate('features', 'name estimatedEffort')
      .lean(),
    Task.find({})
      .populate('sprint', 'name startDate endDate')
      .populate('assignedTo', 'name email role')
      .populate('feature', 'name')
      .lean(),
    User.find({})
      .select('name email role')
      .lean()
  ])

  // Format sprint data
  const sprintData = sprints.map(sprint => ({
    sprint_id: sprint._id.toString(),
    name: sprint.name,
    start_date: sprint.startDate,
    end_date: sprint.endDate,
    duration: sprint.duration,
    created_by: sprint.createdBy?._id?.toString() || '',
    created_by_name: sprint.createdBy?.name || 'Unknown',
    feature_count: sprint.features?.length || 0,
    team_size: sprint.teamSize,
    status: sprint.status
  }))

  // Format task data
  const taskData = tasks.map(task => ({
    task_id: task._id.toString(),
    sprint_id: task.sprint?._id?.toString() || '',
    feature_name: task.feature?.name || task.title,
    assigned_developer: task.assignedTo?._id?.toString() || '',
    developer_name: task.assignedTo?.name || 'Unassigned',
    estimated_hours: task.estimatedHours || 0,
    actual_hours: task.actualHours || null,
    review_count: task.reviewHistory?.length || 0,
    status: task.status,
    work_type: task.workType,
    completion_date: task.completedAt,
    created_date: task.createdAt,
    sprint_end_date: task.sprint?.endDate
  }))

  // Extract review data
  const reviews = []
  tasks.forEach(task => {
    if (task.reviewHistory && task.reviewHistory.length > 0) {
      task.reviewHistory.forEach((review, index) => {
        reviews.push({
          review_id: `${task._id}_${index}`,
          task_id: task._id.toString(),
          submitted_by: task.assignedTo?._id?.toString() || '',
          reviewed_by: review.reviewedBy?.toString() || '',
          submission_time: review.submittedAt,
          review_time: review.reviewedAt,
          review_result: review.status
        })
      })
    }
  })

  // Format user data
  const userData = users.map(user => ({
    user_id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  }))

  res.json({
    success: true,
    data: {
      sprints: sprintData,
      tasks: taskData,
      reviews: reviews,
      users: userData
    },
    counts: {
      sprints: sprintData.length,
      tasks: taskData.length,
      reviews: reviews.length,
      users: userData.length
    },
    generated_at: new Date()
  })
})

/**
 * Get performance summary statistics
 * @route GET /api/analytics/summary
 * @access Private (Product Manager)
 */
exports.getAnalyticsSummary = asyncHandler(async (req, res) => {
  const [
    totalSprints,
    totalTasks,
    totalUsers,
    completedTasks,
    activeSprints
  ] = await Promise.all([
    Sprint.countDocuments(),
    Task.countDocuments(),
    User.countDocuments(),
    Task.countDocuments({ status: 'Completed' }),
    Sprint.countDocuments({ status: 'Active' })
  ])

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0

  res.json({
    success: true,
    summary: {
      total_sprints: totalSprints,
      total_tasks: totalTasks,
      total_users: totalUsers,
      completed_tasks: completedTasks,
      active_sprints: activeSprints,
      completion_rate: completionRate,
      developers: await User.countDocuments({ role: 'Developer' }),
      team_leads: await User.countDocuments({ role: 'Team Lead' }),
      product_managers: await User.countDocuments({ role: 'Product Manager' })
    }
  })
})
