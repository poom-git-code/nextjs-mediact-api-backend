# User Duty API Documentation

## Overview
The User Duty API provides RESTful endpoints for managing user duty records in the MediAct system. This API allows you to track daily duty activities for users, including shifts, leaves, overtime, and other duty types. The API provides comprehensive CRUD operations, filtering, statistics, and calendar views.

## Base URL
```
/user-duties
```

## Authentication
All endpoints require authentication using JWT Bearer token.

## Endpoints

### 1. Create User Duty
**POST** `/user-duties`

Creates a new user duty record.

**Request Body:**
```json
{
  "user_id": "number (required)",
  "duty_date": "date (required, YYYY-MM-DD format)",
  "duty_type_id": "number (required)",
  "reference_id": "number (optional)",
  "shift_type_id": "number (optional)",
  "start_time": "string (optional, HH:MM:SS format)",
  "end_time": "string (optional, HH:MM:SS format)",
  "total_hours": "number (optional, decimal with 2 places)",
  "status": "string (optional, max 50 chars)",
  "department_id": "number (optional)",
  "schedule_master_id": "number (optional)",
  "is_active": "boolean (optional, default: true)"
}
```

**Response:**
```json
{
  "message": "User duty created successfully",
  "userDuty": {
    "id": 1,
    "user_id": 1,
    "duty_date": "2025-01-16",
    "duty_type_id": 1,
    "reference_id": 1001,
    "shift_type_id": 1,
    "start_time": "08:00:00",
    "end_time": "16:00:00",
    "total_hours": 8.00,
    "status": "completed",
    "department_id": 1,
    "schedule_master_id": 1,
    "is_active": true,
    "created_at": "2025-01-16T10:00:00Z",
    "updated_at": "2025-01-16T10:00:00Z",
    "created_by": 1,
    "updated_by": 1
  }
}
```

### 2. Get All User Duties
**GET** `/user-duties`

Retrieves all user duty records with filtering and pagination.

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `duty_date` (optional): Filter by specific date (YYYY-MM-DD)
- `duty_date_from` (optional): Filter from date (YYYY-MM-DD)
- `duty_date_to` (optional): Filter to date (YYYY-MM-DD)
- `duty_type_id` (optional): Filter by duty type ID
- `status` (optional): Filter by status
- `department_id` (optional): Filter by department ID
- `schedule_master_id` (optional): Filter by schedule master ID
- `is_active` (optional): Filter by active status (true/false)
- `limit` (optional): Number of records per page (default: 100, max: 1000)
- `offset` (optional): Number of records to skip (default: 0)

**Response:**
```json
{
  "userDuties": [
    {
      "id": 1,
      "user_id": 1,
      "duty_date": "2025-01-16",
      "duty_type_id": 1,
      "reference_id": 1001,
      "shift_type_id": 1,
      "start_time": "08:00:00",
      "end_time": "16:00:00",
      "total_hours": 8.00,
      "status": "completed",
      "department_id": 1,
      "schedule_master_id": 1,
      "is_active": true,
      "created_at": "2025-01-16T10:00:00Z",
      "updated_at": "2025-01-16T10:00:00Z"
    }
  ],
  "totalCount": 1,
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 1
  }
}
```

### 3. Get User Duty by ID
**GET** `/user-duties/:id`

Retrieves a specific user duty record by ID.

**Response:**
```json
{
  "userDuty": {
    "id": 1,
    "user_id": 1,
    "duty_date": "2025-01-16",
    "duty_type_id": 1,
    "reference_id": 1001,
    "shift_type_id": 1,
    "start_time": "08:00:00",
    "end_time": "16:00:00",
    "total_hours": 8.00,
    "status": "completed",
    "department_id": 1,
    "schedule_master_id": 1,
    "is_active": true,
    "created_at": "2025-01-16T10:00:00Z",
    "updated_at": "2025-01-16T10:00:00Z",
    "created_by": 1,
    "updated_by": 1
  }
}
```

### 4. Get User Duties by User
**GET** `/user-duties/user/:userId`

Retrieves all duty records for a specific user.

**Query Parameters:**
- `duty_date_from` (optional): Filter from date
- `duty_date_to` (optional): Filter to date
- `duty_type_id` (optional): Filter by duty type
- `status` (optional): Filter by status
- `limit` (optional): Number of records (default: 100)
- `offset` (optional): Number of records to skip

**Response:**
```json
{
  "userDuties": [
    {
      "id": 1,
      "user_id": 1,
      "duty_date": "2025-01-16",
      "duty_type_id": 1,
      "start_time": "08:00:00",
      "end_time": "16:00:00",
      "total_hours": 8.00,
      "status": "completed"
    }
  ]
}
```

### 5. Get User Duty by User and Date
**GET** `/user-duties/user/:userId/date/:dutyDate`

Retrieves all duty records for a specific user on a specific date.

**Response:**
```json
{
  "userDuties": [
    {
      "id": 1,
      "user_id": 1,
      "duty_date": "2025-01-16",
      "duty_type_id": 1,
      "start_time": "08:00:00",
      "end_time": "16:00:00",
      "total_hours": 8.00,
      "status": "completed"
    }
  ]
}
```

### 6. Get User Duty Calendar
**GET** `/user-duties/calendar/:userId/:year/:month`

Retrieves calendar view of user duties for a specific month.

**Response:**
```json
{
  "calendar": [
    {
      "id": 1,
      "user_id": 1,
      "duty_date": "2025-01-16",
      "duty_type_id": 1,
      "start_time": "08:00:00",
      "end_time": "16:00:00",
      "total_hours": 8.00,
      "status": "completed"
    }
  ]
}
```

### 7. Get User Duty Statistics
**GET** `/user-duties/stats/summary`

Retrieves statistical summary of user duties.

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year
- `department_id` (optional): Filter by department ID

**Response:**
```json
{
  "stats": [
    {
      "duty_type_id": 1,
      "status": "completed",
      "count": 5,
      "total_hours": 40.00,
      "avg_hours": 8.00
    }
  ]
}
```

### 8. Update User Duty
**PUT** `/user-duties/:id`

Updates an existing user duty record.

**Request Body:**
```json
{
  "duty_date": "date (optional)",
  "duty_type_id": "number (optional)",
  "reference_id": "number (optional)",
  "shift_type_id": "number (optional)",
  "start_time": "string (optional, HH:MM:SS format)",
  "end_time": "string (optional, HH:MM:SS format)",
  "total_hours": "number (optional)",
  "status": "string (optional)",
  "department_id": "number (optional)",
  "schedule_master_id": "number (optional)",
  "is_active": "boolean (optional)"
}
```

**Response:**
```json
{
  "message": "User duty updated successfully",
  "userDuty": {
    "id": 1,
    "user_id": 1,
    "duty_date": "2025-01-16",
    "duty_type_id": 1,
    "status": "approved",
    "updated_at": "2025-01-16T11:00:00Z"
  }
}
```

### 9. Delete User Duty (Soft Delete)
**DELETE** `/user-duties/:id`

Soft deletes a user duty record by setting `is_active` to `false`.

**Response:**
```json
{
  "message": "User duty deleted successfully"
}
```

### 10. Bulk Update User Duties
**PUT** `/user-duties/bulk/update`

Updates multiple user duty records at once.

**Request Body:**
```json
{
  "user_duty_ids": [1, 2, 3],
  "updates": {
    "status": "approved",
    "total_hours": 8.00
  }
}
```

**Response:**
```json
{
  "message": "User duties updated successfully",
  "affectedRows": 3
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "error": "Error message describing what went wrong"
}
```

## Database Schema

The `user_duty` table includes:

- `id` (BIGINT, Primary Key, Auto-increment)
- `user_id` (INT, Not Null, Foreign Key to users table)
- `duty_date` (DATE, Not Null)
- `duty_type_id` (INT, Not Null, Reference to duty_types table - no FK constraint)
- `reference_id` (BIGINT, Nullable)
- `shift_type_id` (INT, Nullable, Foreign Key to shift_types table)
- `start_time` (TIME, Nullable)
- `end_time` (TIME, Nullable)
- `total_hours` (DECIMAL(6,2), Nullable)
- `status` (VARCHAR(50), Nullable)
- `department_id` (INT, Nullable, Foreign Key to departments table)
- `schedule_master_id` (INT, Nullable, Foreign Key to schedule_master table)
- `is_active` (BOOLEAN, Default: TRUE)
- `created_at` (DATETIME, Auto-generated)
- `updated_at` (DATETIME, Auto-updated)
- `created_by` (INT, Foreign Key to users table)
- `updated_by` (INT, Foreign Key to users table)

## Usage Examples

### Create a new user duty record
```bash
curl -X POST https://api.mediact.com/user-duties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "duty_date": "2025-01-16",
    "duty_type_id": 1,
    "start_time": "08:00:00",
    "end_time": "16:00:00",
    "total_hours": 8.00,
    "status": "completed"
  }'
```

### Get user duties for a specific user
```bash
curl -X GET "https://api.mediact.com/user-duties/user/1?duty_date_from=2025-01-01&duty_date_to=2025-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get calendar view for a user
```bash
curl -X GET https://api.mediact.com/user-duties/calendar/1/2025/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get duty statistics
```bash
curl -X GET "https://api.mediact.com/user-duties/stats/summary?user_id=1&month=1&year=2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update duty status
```bash
curl -X PUT https://api.mediact.com/user-duties/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved"
  }'
```

### Bulk update multiple duties
```bash
curl -X PUT https://api.mediact.com/user-duties/bulk/update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_duty_ids": [1, 2, 3],
    "updates": {
      "status": "approved"
    }
  }'
```

## Key Features

- **Comprehensive CRUD Operations**: Full create, read, update, delete functionality
- **Advanced Filtering**: Filter by user, date ranges, duty types, status, department
- **Calendar View**: Monthly calendar view for user duties
- **Statistics**: Statistical summaries with counts and hours
- **Bulk Operations**: Bulk update multiple records
- **Soft Delete**: Deactivate records instead of hard deletion
- **Audit Trail**: Track who created and updated records
- **Validation**: Comprehensive request validation with detailed error messages
- **Pagination**: Efficient pagination for large datasets
- **Date Range Queries**: Flexible date filtering options
- **Conflict Detection**: Prevent duplicate duty entries for same user/date/type

## Business Logic

- **Duplicate Prevention**: System prevents creating duplicate duties for the same user, date, and duty type
- **Flexible References**: `duty_type_id` has no foreign key constraint for flexibility
- **Time Tracking**: Support for start/end times and total hours calculation
- **Status Management**: Track duty status (pending, approved, completed, etc.)
- **Department Association**: Link duties to departments for reporting
- **Schedule Integration**: Connect duties to schedule masters for planning

## Implementation Details

### Files Created/Modified:
1. `sql/create_user_duty_table.sql` - Database migration with indexes and constraints
2. `src/models/UserDutyModel.ts` - Sequelize model with proper field definitions
3. `src/validations/userDutyValidation.ts` - Joi validation schemas for all operations
4. `src/services/userDutyService.ts` - Business logic layer with comprehensive operations
5. `src/controllers/userDutyController.ts` - Request/response handling with validation
6. `src/routes/userDutyRoutes.ts` - RESTful route definitions
7. `src/app.ts` - Route registration in main application

### Architecture Pattern:
- **Model-Service-Controller (MSC)** pattern
- **Validation** layer with Joi schemas
- **Authentication** middleware for all routes
- **Error handling** with proper HTTP status codes
- **Database indexes** for performance optimization
- **Soft delete** implementation for data integrity

The User Duty API is now fully implemented and ready for use! You can run the SQL migration to create the table, and then use the API endpoints to manage user duty records in your application.
