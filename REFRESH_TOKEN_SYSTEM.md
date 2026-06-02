# Refresh Token System Documentation

## Overview
This implementation provides a secure refresh token system alongside the existing JWT access tokens. The system uses short-lived access tokens (15 minutes) and long-lived refresh tokens (7 days) to enhance security.

## Architecture

### Token Types
1. **Access Token**: Short-lived (15 minutes) - Used for API authentication
2. **Refresh Token**: Long-lived (7 days) - Used to obtain new access tokens

### Security Features
- Refresh tokens are stored in the database
- Tokens can be revoked individually or all at once
- Device and IP tracking for security auditing
- Automatic cleanup of expired tokens
- Single-use refresh tokens (old token is revoked when new one is issued)

## API Endpoints

### 1. Login (Updated)
**POST** `/auth/login` or `/partner/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Access token (15 min)
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Refresh token (7 days)
  "expiresAt": "2025-01-23T10:15:00.000Z",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com",
    // ... other user fields
  }
}
```

### 2. Refresh Token
**POST** `/auth/refresh-token` or `/partner/auth/refresh-token`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "Tokens refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // New access token
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // New refresh token
  "expiresAt": "2025-01-23T10:15:00.000Z",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### 3. Revoke Refresh Token
**POST** `/auth/revoke-refresh-token`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "Refresh token revoked successfully"
}
```

### 4. Logout
**POST** `/auth/logout` or `/partner/auth/logout`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Optional
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Database Schema

### refresh_tokens Table
```sql
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  device_info VARCHAR(500) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_token (token(255)),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_revoked (is_revoked),
  UNIQUE KEY uk_token (token(255)),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Client-Side Implementation

### 1. Store Tokens
```javascript
// After login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token, refreshToken, expiresAt } = await loginResponse.json();

// Store tokens (localStorage, sessionStorage, or secure storage)
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('tokenExpiry', expiresAt);
```

### 2. Automatic Token Refresh
```javascript
// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh-token', {
          refreshToken
        });
        
        const { token, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 3. Check Token Expiry
```javascript
function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// Before making requests
const token = localStorage.getItem('accessToken');
if (isTokenExpired(token)) {
  // Refresh token automatically
  await refreshTokens();
}
```

## Security Considerations

1. **Token Storage**: Store refresh tokens securely (HttpOnly cookies preferred for web apps)
2. **Token Rotation**: Old refresh tokens are automatically revoked when new ones are issued
3. **Expiry Management**: Tokens have appropriate expiry times
4. **Revocation**: Tokens can be revoked individually or all at once
5. **Device Tracking**: Track device and IP for security auditing
6. **Cleanup**: Expired tokens are automatically cleaned up

## Error Handling

### 401 Unauthorized
- Invalid or expired access token
- Missing access token

### 400 Bad Request
- Invalid refresh token format
- Missing refresh token

### 403 Forbidden
- Insufficient permissions (for backend login)

## Migration from Old System

The system maintains backward compatibility with the existing JWT tokens. Existing tokens will continue to work, but new logins will receive both access and refresh tokens.

## Maintenance

### Cleanup Expired Tokens
```javascript
// Run this periodically (e.g., daily cron job)
await RefreshTokenService.cleanupExpiredTokens();
```

### Revoke All User Tokens
```javascript
// When user changes password or security breach
await RefreshTokenService.revokeAllUserTokens(userId);
```
