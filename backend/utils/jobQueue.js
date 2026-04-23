/**
 * Simple In-Memory Job Queue for Background Processing
 * 
 * For production with multiple servers, use:
 * - BullMQ (Redis-based): npm install bullmq
 * - Agenda (MongoDB-based): npm install agenda
 * 
 * This implementation handles:
 * - Async job processing
 * - Retry logic
 * - Concurrency control
 * - Job status tracking
 */

const EventEmitter = require('events')

class JobQueue extends EventEmitter {
  constructor(options = {}) {
    super()
    this.concurrency = options.concurrency || 5
    this.retryAttempts = options.retryAttempts || 3
    this.retryDelay = options.retryDelay || 1000
    
    this.queue = []
    this.processing = new Map()
    this.completed = []
    this.failed = []
    this.running = 0
    this.handlers = new Map()
  }

  /**
   * Register a job handler
   * @param {string} jobType - Type of job
   * @param {Function} handler - Async function to process job
   */
  registerHandler(jobType, handler) {
    this.handlers.set(jobType, handler)
  }

  /**
   * Add job to queue
   * @param {string} jobType - Type of job
   * @param {object} data - Job data
   * @param {object} options - Job options (priority, delay, etc.)
   * @returns {string} Job ID
   */
  async add(jobType, data, options = {}) {
    const job = {
      id: `${jobType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: jobType,
      data,
      priority: options.priority || 0,
      attempts: 0,
      maxAttempts: options.retryAttempts || this.retryAttempts,
      delay: options.delay || 0,
      createdAt: Date.now(),
      status: 'queued'
    }

    if (job.delay > 0) {
      setTimeout(() => {
        this.queue.push(job)
        this.queue.sort((a, b) => b.priority - a.priority)
        this.process()
      }, job.delay)
    } else {
      this.queue.push(job)
      this.queue.sort((a, b) => b.priority - a.priority)
      this.process()
    }

    return job.id
  }

  /**
   * Process jobs from queue
   */
  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return
    }

    const job = this.queue.shift()
    if (!job) return

    this.running++
    this.processing.set(job.id, job)
    job.status = 'processing'
    job.startedAt = Date.now()

    const handler = this.handlers.get(job.type)
    if (!handler) {
      this.failJob(job, new Error(`No handler registered for job type: ${job.type}`))
      return
    }

    try {
      const result = await handler(job.data)
      this.completeJob(job, result)
    } catch (error) {
      job.attempts++
      
      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff
        const delay = this.retryDelay * Math.pow(2, job.attempts - 1)
        console.log(`Job ${job.id} failed, retrying in ${delay}ms (attempt ${job.attempts}/${job.maxAttempts})`)
        
        setTimeout(() => {
          job.status = 'queued'
          this.queue.unshift(job)
          this.processing.delete(job.id)
          this.running--
          this.process()
        }, delay)
      } else {
        this.failJob(job, error)
      }
    }
  }

  /**
   * Mark job as completed
   */
  completeJob(job, result) {
    job.status = 'completed'
    job.completedAt = Date.now()
    job.result = result
    job.duration = job.completedAt - job.startedAt

    this.processing.delete(job.id)
    this.completed.push(job)
    this.running--

    // Keep only last 100 completed jobs
    if (this.completed.length > 100) {
      this.completed.shift()
    }

    this.emit('completed', job)
    this.process() // Process next job
  }

  /**
   * Mark job as failed
   */
  failJob(job, error) {
    job.status = 'failed'
    job.failedAt = Date.now()
    job.error = error.message
    job.duration = job.failedAt - job.startedAt

    this.processing.delete(job.id)
    this.failed.push(job)
    this.running--

    // Keep only last 100 failed jobs
    if (this.failed.length > 100) {
      this.failed.shift()
    }

    this.emit('failed', job, error)
    console.error(`Job ${job.id} failed:`, error.message)
    this.process() // Process next job
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queued: this.queue.length,
      processing: this.processing.size,
      completed: this.completed.length,
      failed: this.failed.length,
      running: this.running,
      concurrency: this.concurrency
    }
  }

  /**
   * Get job status
   */
  getJob(jobId) {
    // Check processing
    if (this.processing.has(jobId)) {
      return this.processing.get(jobId)
    }

    // Check queue
    const queued = this.queue.find(j => j.id === jobId)
    if (queued) return queued

    // Check completed
    const completed = this.completed.find(j => j.id === jobId)
    if (completed) return completed

    // Check failed
    const failed = this.failed.find(j => j.id === jobId)
    if (failed) return failed

    return null
  }

  /**
   * Clear all jobs
   */
  clear() {
    this.queue = []
    this.completed = []
    this.failed = []
  }
}

// Singleton instance
const jobQueue = new JobQueue({
  concurrency: parseInt(process.env.JOB_QUEUE_CONCURRENCY || '5', 10),
  retryAttempts: 3,
  retryDelay: 1000
})

// Example: Register AI prediction job handler
jobQueue.registerHandler('ai-prediction', async (data) => {
  const { fetchSprintPrediction } = require('./aiClient')
  return await fetchSprintPrediction(data)
})

// Example: Register analytics computation job
jobQueue.registerHandler('compute-analytics', async (data) => {
  // Heavy analytics computation here
  console.log('Computing analytics for:', data)
  return { success: true }
})

module.exports = {
  jobQueue
}
