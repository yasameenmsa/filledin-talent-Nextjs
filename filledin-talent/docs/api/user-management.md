# User Management API Documentation

## Overview

This document describes the User Management APIs for the FilledIn Talent platform. These APIs provide comprehensive user management functionality including user creation, profile management, role assignment, and session management.

## Authentication

All API endpoints require authentication unless otherwise specified. Include the session token in your requests:

```
Cookie: next-auth.session-token=<session_token>
```

## Base URL

```
/api/users
```

## Endpoints

### 1. User Management

#### GET /api/users
Get all users (Admin only)

**Authorization:** Admin only

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `role` (optional): Filter by role (`jobseeker`, `admin`)
- `search` (optional): Search by email or name

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "role": "jobseeker",
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### POST /api/users
Create a new user (Admin only)

**Authorization:** Admin only

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "role": "jobseeker",
  "profile": {
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "new_user_id",
    "email": "newuser@example.com",
    "role": "jobseeker"
  }
}
```

### 2. Individual User Management

#### GET /api/users/[id]
Get user by ID

**Authorization:** Admin or own profile

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "jobseeker",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "position": "Software Engineer",
    "company": "Tech Corp",
    "location": "New York, NY",
    "bio": "Experienced software engineer...",
    "skills": ["JavaScript", "React", "Node.js"]
  },
  "preferences": {
    "jobCategories": ["technology"],
    "locations": ["New York", "Remote"],
    "workingTypes": ["full-time", "remote"]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /api/users/[id]
Update user information

**Authorization:** Admin or own profile

**Request Body:**
```json
{
  "email": "updated@example.com",
  "role": "admin",
  "profile": {
    "firstName": "John",
    "lastName": "Doe Updated",
    "phone": "+1234567890",
    "bio": "Updated bio..."
  }
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "user_id",
    "email": "updated@example.com",
    "role": "admin"
  }
}
```

#### DELETE /api/users/[id]
Soft delete user

**Authorization:** Admin only

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### 3. Role Management

#### PUT /api/users/[id]/role
Update user role (Admin only)

**Authorization:** Admin only

**Request Body:**
```json
{
  "role": "admin",
  "reason": "Promoted to administrator"
}
```

**Response:**
```json
{
  "message": "User role updated successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin",
    "roleUpdatedAt": "2024-01-01T00:00:00.000Z",
    "roleUpdatedBy": "admin_user_id"
  }
}
```

#### GET /api/users/[id]/role
Get user role information (Admin only)

**Authorization:** Admin only

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin"
  },
  "roleHistory": [
    {
      "role": "admin",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": "admin_user_id",
      "reason": "Promoted to administrator"
    }
  ]
}
```

### 4. Profile Management

#### GET /api/users/profile
Get current user's profile

**Authorization:** Authenticated user

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "position": "Software Engineer",
    "company": "Tech Corp",
    "location": "New York, NY",
    "bio": "Experienced software engineer...",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": [
      {
        "company": "Previous Corp",
        "position": "Junior Developer",
        "startDate": "2020-01-01",
        "endDate": "2023-12-31",
        "description": "Worked on web applications..."
      }
    ],
    "education": [
      {
        "institution": "University of Technology",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "year": "2020"
      }
    ]
  },
  "preferences": {
    "jobCategories": ["technology"],
    "locations": ["New York", "Remote"],
    "workingTypes": ["full-time", "remote"],
    "salaryExpectation": {
      "min": 80000,
      "max": 120000,
      "currency": "USD"
    }
  }
}
```

#### PUT /api/users/profile
Update current user's profile

**Authorization:** Authenticated user

**Request Body:**
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "bio": "Updated bio...",
    "skills": ["JavaScript", "React", "Node.js", "TypeScript"]
  },
  "preferences": {
    "jobCategories": ["technology", "startup"],
    "locations": ["New York", "Remote", "San Francisco"],
    "workingTypes": ["full-time", "remote"]
  }
}
```

#### DELETE /api/users/profile
Delete current user's profile (soft delete)

**Authorization:** Authenticated user

**Response:**
```json
{
  "message": "Profile deleted successfully"
}
```

### 5. Session Management

#### GET /api/users/sessions
Get current user's session information

**Authorization:** Authenticated user

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "jobseeker",
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "loginCount": 25,
    "memberSince": "2023-01-01T00:00:00.000Z"
  },
  "session": {
    "issuedAt": "2024-01-01T08:00:00.000Z",
    "lastActivity": "2024-01-01T10:30:00.000Z",
    "sessionAge": 9000,
    "idleTime": 1800,
    "maxAge": 28800,
    "idleTimeout": 7200,
    "timeRemaining": 19800,
    "idleTimeRemaining": 5400,
    "isExpiringSoon": false,
    "isIdleExpiringSoon": false
  }
}
```

#### DELETE /api/users/sessions
Logout current user (invalidate session)

**Authorization:** Authenticated user

**Response:**
```json
{
  "message": "Session invalidated successfully",
  "redirectTo": "/login"
}
```

#### POST /api/users/sessions/all
Get all active sessions (Admin only)

**Authorization:** Admin only

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role

**Response:**
```json
{
  "sessions": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "role": "jobseeker",
      "name": "John Doe",
      "lastLogin": "2024-01-01T08:00:00.000Z",
      "lastLogout": "2024-01-01T07:00:00.000Z",
      "loginCount": 25,
      "memberSince": "2023-01-01T00:00:00.000Z",
      "sessionStatus": "active",
      "sessionAge": 9000
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "summary": {
    "totalUsers": 50,
    "activeSessions": 35,
    "inactiveSessions": 15
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **User management endpoints**: 100 requests per minute per user
- **Profile endpoints**: 50 requests per minute per user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Security Considerations

1. **Authentication**: All endpoints require valid session tokens
2. **Authorization**: Role-based access control is enforced
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Prevents abuse and brute force attacks
5. **CORS**: Configured for secure cross-origin requests
6. **HTTPS**: All production traffic must use HTTPS
7. **Session Security**: Secure cookie configuration with HttpOnly and Secure flags

## Examples

### Creating a New User (Admin)

```bash
curl -X POST /api/users \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<admin_session_token>" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword123",
    "role": "jobseeker",
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith"
    }
  }'
```

### Updating User Profile

```bash
curl -X PUT /api/users/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<user_session_token>" \
  -d '{
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "bio": "Updated bio...",
      "skills": ["JavaScript", "React", "Node.js"]
    }
  }'
```

### Changing User Role (Admin)

```bash
curl -X PUT /api/users/user123/role \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<admin_session_token>" \
  -d '{
    "role": "admin",
    "reason": "Promoted to administrator"
  }'
```

## Changelog

### Version 1.0.0 (Current)
- Initial release with comprehensive user management APIs
- Role-based access control
- Session management
- Profile management
- Security hardening features