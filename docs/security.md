# 🔒 Security Documentation

## Overview

Security is a top priority for ProdFlow AI. This document outlines security measures and best practices.

## Authentication & Authorization

### JWT-Based Authentication

**Access Tokens**:
- Short-lived (15 minutes)
- Stored in localStorage or sessionStorage
- Sent in Authorization header

**Refresh Tokens**:
- Long-lived (7 days)
- Stored as httpOnly cookies
- Used to obtain new access tokens
- Rotated on each refresh

### Password Security

- **Hashing**: Bcrypt with 12 rounds
- **Minimum Length**: 6 characters (recommend 12+)
- **No Plain Text**: Passwords never stored in plain text
- **Validation**: Server-side validation

```javascript
// Password hashing
const salt = await bcrypt.genSalt(12)
const hashedPassword = await bcrypt.hash(password, salt)

// Password verification
const isMatch = await bcrypt.compare(enteredPassword, hashedPassword)
```

### Role-Based Access Control (RBAC)

Three roles with different permissions:

**Product Manager**:
- Create/manage products
- Invite team members
- View all analytics
- Full access to their products

**Team Lead**:
- Create/manage sprints
- Assign tasks
- Review and approve work
- View team analytics

**Developer**:
- View assigned tasks
- Update task status
- Submit work for review
- View personal metrics

## API Security

### Rate Limiting

```javascript
// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 500,                   // 500 requests per window
  message: 'Too many requests'
})

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                    // 10 login attempts per window
  message: 'Too many login attempts'
})
```

### CORS Configuration

```javascript
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'https://your-frontend-domain.com'
])

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS: origin not allowed'))
    }
  },
  credentials: true
}
```

### Input Validation

**Server-Side Validation**:
```javascript
const { body, validationResult } = require('express-validator')

router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    // Process registration
  }
)
```

### Input Sanitization

```javascript
// XSS prevention
function sanitizeString(str) {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>'"]/g, m => ({
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }[m]))
}

// Prototype pollution prevention
function sanitizeObject(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (['__proto__', 'prototype', 'constructor'].includes(k)) continue
    out[k] = typeof v === 'object' ? sanitizeObject(v) : v
  }
  return out
}
```

## Security Headers

### Helmet.js Configuration

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// Additional headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})
```

## Database Security

### MongoDB Security

**Authentication**:
```javascript
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prodflow
```

**Connection Security**:
- Use TLS/SSL for connections
- Whitelist IP addresses
- Use strong passwords
- Enable MongoDB authentication

**Query Security**:
- Mongoose prevents NoSQL injection
- Use parameterized queries
- Validate all inputs

### Data Encryption

**At Rest**:
- MongoDB encryption at rest (Atlas)
- Encrypted backups

**In Transit**:
- HTTPS/TLS for all connections
- Encrypted database connections

## Environment Variables

### Security Best Practices

**Never Commit**:
- `.env` files
- `.env.production` files
- Any file with secrets

**Use .gitignore**:
```gitignore
.env
.env.local
.env.production.*
*.env
!.env.example
!.env.example.*
```

**Generate Secure Secrets**:
```bash
# Generate 32-byte random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Environment Variable Validation**:
```javascript
// validateEnv.js
function validateEnv() {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ]
  
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing required environment variable: ${key}`)
      process.exit(1)
    }
  }
}
```

## HTTPS/SSL

### Production Requirements

- **Always use HTTPS** in production
- **Redirect HTTP to HTTPS**
- **Use valid SSL certificates** (Let's Encrypt)
- **Enable HSTS** (HTTP Strict Transport Security)

### Nginx HTTPS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Logging & Monitoring

### Security Logging

```javascript
// Log security events
logger.warn('failed_login_attempt', {
  email: req.body.email,
  ip: req.ip,
  timestamp: new Date()
})

logger.error('unauthorized_access', {
  user: req.user?.id,
  resource: req.originalUrl,
  ip: req.ip
})
```

### Monitor for:
- Failed login attempts
- Unauthorized access attempts
- Rate limit violations
- Unusual API usage patterns
- Database query errors

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Use Dependabot

Enable GitHub Dependabot for automatic security updates.

## Security Checklist

### Development
- [ ] Use environment variables for secrets
- [ ] Never commit .env files
- [ ] Validate all user inputs
- [ ] Sanitize all outputs
- [ ] Use parameterized queries
- [ ] Implement rate limiting
- [ ] Use HTTPS in development

### Production
- [ ] Change all default secrets
- [ ] Use strong, unique passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Implement logging and monitoring
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Backup data regularly

## Incident Response

### If Security Breach Occurs

1. **Immediate Actions**:
   - Isolate affected systems
   - Change all passwords and secrets
   - Revoke all active tokens
   - Review access logs

2. **Investigation**:
   - Identify breach source
   - Assess damage
   - Document findings

3. **Recovery**:
   - Patch vulnerabilities
   - Restore from backups if needed
   - Notify affected users

4. **Prevention**:
   - Implement additional security measures
   - Update security policies
   - Conduct security training

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated**: 2026
**Security Contact**: security@prodflow.ai
