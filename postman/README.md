# Facility Admins API - Postman Collection

## Overview
This folder contains Postman collection and environment files for testing the Facility Admins API endpoints.

## Files Included
1. `facility-admins-api.postman_collection.json` - Main collection with all API endpoints
2. `facility-admins.postman_environment.json` - Environment variables for easy configuration

## How to Import

### Import Collection
1. Open Postman
2. Click **Import** button
3. Select **Upload Files** tab
4. Choose `facility-admins-api.postman_collection.json`
5. Click **Import**

### Import Environment
1. In Postman, click the gear icon (⚙️) in the top right
2. Click **Import**
3. Select **Upload Files** tab
4. Choose `facility-admins.postman_environment.json`
5. Click **Import**

## Setup Environment Variables

After importing, update the environment variables:

1. Select "Facility Admins Environment" from the environment dropdown
2. Click the eye icon (👁️) next to the environment name
3. Click **Edit** and update the following variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:3000/api` |
| `auth_token` | JWT authentication token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `facility_id` | Test facility ID | `1` |
| `user_id` | Test user ID | `5` |
| `admin_id` | Test admin assignment ID | `1` |

## Collection Structure

### 1. Regular Endpoints
Standard API endpoints for facility admin management:
- **POST** `/facility-admins` - Create new assignment
- **PUT** `/facility-admins/:id` - Update assignment
- **DELETE** `/facility-admins/:id` - Delete assignment
- **GET** `/facility-admins/:id` - Get specific assignment
- **GET** `/facility-admins` - Get all assignments
- **GET** `/facility-admins/facility/:facility_id` - Get by facility
- **GET** `/facility-admins/user/:user_id` - Get by user
- **GET** `/facility-admins/active/list` - Get active assignments

### 2. Partner Endpoints
Partner-specific endpoints (same functionality, different routes):
- **POST** `/partner/facility-admins` - Partner create
- **PUT** `/partner/facility-admins/:id` - Partner update
- **DELETE** `/partner/facility-admins/:id` - Partner delete
- **GET** `/partner/facility-admins/:id` - Partner get by ID
- **GET** `/partner/facility-admins` - Partner get all
- **GET** `/partner/facility-admins/facility/:facility_id` - Partner get by facility
- **GET** `/partner/facility-admins/user/:user_id` - Partner get by user
- **GET** `/partner/facility-admins/active/list` - Partner get active

### 3. Test Examples
Sample requests for common scenarios:
- Create with minimal data
- Deactivate admin
- Reactivate admin

## Sample Request Bodies

### Create Facility Admin (Full Data)
```json
{
  "facility_id": 1,
  "user_id": 5,
  "assigned_at": "2025-01-15T10:00:00Z",
  "is_active": true
}
```

### Create Facility Admin (Minimal Data)
```json
{
  "facility_id": 1,
  "user_id": 5
}
```

### Update Facility Admin
```json
{
  "facility_id": 2,
  "user_id": 6,
  "is_active": false
}
```

### Deactivate Admin
```json
{
  "is_active": false
}
```

## Testing Workflow

### 1. Authentication Setup
1. First, obtain a JWT token from your authentication endpoint
2. Copy the token to the `auth_token` environment variable
3. The collection is configured to automatically use this token in all requests

### 2. Basic CRUD Testing
1. **Create**: Use "Create Facility Admin" request
2. **Read**: Use "Get Facility Admin by ID" request
3. **Update**: Use "Update Facility Admin" request
4. **Delete**: Use "Delete Facility Admin" request

### 3. Specialized Query Testing
1. Test getting admins by facility using "Get Facility Admins by Facility"
2. Test getting admins by user using "Get Facility Admins by User"
3. Test filtering active admins using "Get Active Facility Admins"

### 4. Partner Endpoint Testing
1. Test all partner endpoints to ensure they work identically to regular endpoints
2. Useful for testing different access levels or permissions

## Expected Responses

### Success Response (Create/Update)
```json
{
  "message": "Facility admin assignment created successfully",
  "facilityAdmin": {
    "id": 1,
    "facility_id": 1,
    "user_id": 5,
    "assigned_at": "2025-01-15T10:00:00Z",
    "is_active": true,
    "created_by": 2,
    "updated_by": 2,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

### Success Response (Get with Relations)
```json
{
  "facilityAdmin": {
    "id": 1,
    "facility_id": 1,
    "user_id": 5,
    "assigned_at": "2025-01-15T10:00:00Z",
    "is_active": true,
    "created_by": 2,
    "updated_by": 2,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z",
    "facility": {
      "id": 1,
      "name": "Bangkok Hospital",
      "address": "123 Sukhumvit Road, Bangkok",
      "is_active": true
    },
    "user": {
      "id": 5,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    }
  }
}
```

### Error Response Examples
```json
// Validation Error
{
  "error": "Facility ID must be a positive number."
}

// Authentication Error
{
  "error": "Unauthorized: User ID not found in token"
}

// Business Logic Error
{
  "error": "User is already assigned as admin for this facility"
}

// Not Found Error
{
  "error": "Facility admin assignment not found"
}
```

## Tips for Testing

1. **Start with Authentication**: Make sure your `auth_token` is valid
2. **Check Prerequisites**: Ensure facilities and users exist before creating assignments
3. **Test Edge Cases**: Try duplicate assignments, invalid IDs, etc.
4. **Use Environment Variables**: Leverage the environment variables for easy ID management
5. **Check Relationships**: Verify that related facility and user data is properly loaded
6. **Test Both Routes**: Compare regular and partner endpoints for consistency

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check if `auth_token` is set and valid
2. **400 Bad Request**: Verify request body format and required fields
3. **404 Not Found**: Ensure the resource ID exists
4. **409 Conflict**: Check for duplicate assignments

### Debug Steps
1. Check environment variables are properly set
2. Verify the server is running on the correct port
3. Confirm database connections and table existence
4. Review API logs for detailed error messages
