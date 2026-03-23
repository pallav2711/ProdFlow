# 🔐 Authentication System

## Persistent Login Implementation

### Features
- JWT access tokens (15 minutes)
- Refresh tokens (7 days)
- Automatic token refresh (every 10 minutes)
- "Remember Me" option
- Secure token storage

### Security
- Short-lived access tokens minimize exposure
- Separate refresh token secrets
- Server-side token validation
- Automatic cleanup on logout
- HTTPS-only in production

### User Experience
- Seamless login across browser sessions
- Silent token refresh
- Graceful error handling
- Cross-tab synchronization

### Configuration
```bash
# Backend Environment
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

### API Endpoints
- `POST /api/auth/login` - User login with remember me option
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Secure logout with cleanup

For detailed authentication information, see the original PERSISTENT_LOGIN_GUIDE.md file.