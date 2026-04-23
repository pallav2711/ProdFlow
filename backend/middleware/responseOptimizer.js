/**
 * Response Optimization Middleware
 * Reduces payload size and improves API response times
 */

/**
 * Slim response mode - returns minimal fields for list views
 * Usage: Add ?slim=true to any GET request
 */
const slimResponse = (req, res, next) => {
  if (req.query.slim !== 'true') {
    return next()
  }

  // Override res.json to filter response
  const originalJson = res.json.bind(res)
  res.json = (data) => {
    if (data && typeof data === 'object') {
      // Apply slim mode to arrays
      if (Array.isArray(data)) {
        data = data.map(item => slimifyObject(item))
      } else if (data.sprints && Array.isArray(data.sprints)) {
        data.sprints = data.sprints.map(item => slimifyObject(item))
      } else if (data.tasks && Array.isArray(data.tasks)) {
        data.tasks = data.tasks.map(item => slimifyObject(item))
      } else if (data.products && Array.isArray(data.products)) {
        data.products = data.products.map(item => slimifyObject(item))
      }
    }
    return originalJson(data)
  }

  next()
}

/**
 * Remove unnecessary fields from objects
 */
function slimifyObject(obj) {
  if (!obj || typeof obj !== 'object') return obj

  const slim = { ...obj }
  
  // Remove verbose fields
  delete slim.__v
  delete slim.updatedAt
  delete slim.description
  delete slim.reviewNotes
  delete slim.vision
  
  // Simplify populated objects to just ID and name
  if (slim.createdBy && typeof slim.createdBy === 'object') {
    slim.createdBy = { _id: slim.createdBy._id, name: slim.createdBy.name }
  }
  if (slim.assignedTo && typeof slim.assignedTo === 'object') {
    slim.assignedTo = { _id: slim.assignedTo._id, name: slim.assignedTo.name }
  }
  if (slim.product && typeof slim.product === 'object') {
    slim.product = { _id: slim.product._id, name: slim.product.name }
  }

  return slim
}

/**
 * Add ETag support for conditional requests
 * Reduces bandwidth by returning 304 Not Modified when content hasn't changed
 */
const etag = require('crypto')

const etagMiddleware = (req, res, next) => {
  // Only for GET requests
  if (req.method !== 'GET') {
    return next()
  }

  const originalJson = res.json.bind(res)
  res.json = (data) => {
    // Generate ETag from response data
    const hash = etag.createHash('md5').update(JSON.stringify(data)).digest('hex')
    const etagValue = `"${hash}"`

    // Check if client has cached version
    const clientEtag = req.headers['if-none-match']
    if (clientEtag === etagValue) {
      return res.status(304).end()
    }

    // Set ETag header
    res.setHeader('ETag', etagValue)
    res.setHeader('Cache-Control', 'private, max-age=60') // Cache for 1 minute
    
    return originalJson(data)
  }

  next()
}

/**
 * Remove null/undefined fields from response
 * Reduces payload size
 */
const removeNullFields = (req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = (data) => {
    if (data && typeof data === 'object') {
      data = cleanObject(data)
    }
    return originalJson(data)
  }
  next()
}

function cleanObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item))
  }

  if (obj && typeof obj === 'object') {
    const cleaned = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        cleaned[key] = typeof value === 'object' ? cleanObject(value) : value
      }
    }
    return cleaned
  }

  return obj
}

/**
 * Add response timing header
 */
const responseTime = (req, res, next) => {
  const start = process.hrtime.bigint()
  
  res.on('finish', () => {
    const elapsed = Number(process.hrtime.bigint() - start) / 1000000
    res.setHeader('X-Response-Time', `${elapsed.toFixed(2)}ms`)
  })
  
  next()
}

module.exports = {
  slimResponse,
  etagMiddleware,
  removeNullFields,
  responseTime
}
