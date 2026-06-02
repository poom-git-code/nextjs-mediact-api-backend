# Schedule Shift Summary API Documentation

## Overview
The Schedule Shift Summary API provides endpoints for managing monthly summaries of shifts by shift type per department. This API allows you to perform CRUD operations, view statistics, and manage bulk operations for schedule shift summaries.

## Base URL
All endpoints are relative to the base API URL: `/api/v1`

## Authentication
All endpoints require authentication. Include the bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Create Schedule Shift Summary
**POST** `/schedule-shift-summaries`

Creates a new schedule shift summary record.

**Request Body:**
```json
{
  "schedule_master_id": 1, // Required
  "department_id": 1, // Required
  "shift_type_id": 1, // Required
  "total_shifts": 30, // Optional, default 0
  "total_hours": 240.00, // Optional, default 0
  "total_normal_hours": 240.00, // Optional, default 0
  "total_ot_hours": 0.00, // Optional, default 0
  "total_employees": 10, // Optional, default 0
  "is_active": true // Optional, default true
}
```

**Response:**
```json
{
  "message": "Schedule Shift Summary created successfully",
  "data": {
    "id": 1,
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": 30,
    "total_hours": "240.00",
    "total_normal_hours": "240.00",
    "total_ot_hours": "0.00",
    "total_employees": 10,
    "is_active": true,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `201`: Success - Summary created
- `400`: Bad Request - Validation error
- `401`: Unauthorized - Invalid or missing token
- `409`: Conflict - Duplicate combination of schedule_master_id and shift_type_id

### 2. Update Schedule Shift Summary
**PUT** `/schedule-shift-summaries/:id`

Updates an existing schedule shift summary record.

**Path Parameters:**
- `id`: BigInt - The summary ID

**Request Body:**
```json
{
  "total_shifts": 35, // Optional
  "total_hours": 280.00, // Optional
  "total_normal_hours": 240.00, // Optional
  "total_ot_hours": 40.00, // Optional
  "total_employees": 12, // Optional
  "is_active": true // Optional
}
```

**Response:**
```json
{
  "message": "Schedule Shift Summary updated successfully",
  "data": {
    "id": 1,
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": 35,
    "total_hours": "280.00",
    "total_normal_hours": "240.00",
    "total_ot_hours": "40.00",
    "total_employees": 12,
    "is_active": true,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200`: Success - Summary updated
- `400`: Bad Request - Validation error
- `401`: Unauthorized - Invalid or missing token
- `404`: Not Found - Summary not found

### 3. Delete Schedule Shift Summary
**DELETE** `/schedule-shift-summaries/:id`

Permanently deletes a schedule shift summary record.

**Path Parameters:**
- `id`: BigInt - The summary ID

**Response:**
```json
{
  "message": "Schedule Shift Summary deleted successfully"
}
```

**Status Codes:**
- `200`: Success - Summary deleted
- `400`: Bad Request - Error occurred
- `401`: Unauthorized - Invalid or missing token
- `404`: Not Found - Summary not found

### 4. Get Schedule Shift Summary by ID
**GET** `/schedule-shift-summaries/:id`

Retrieves a specific schedule shift summary by ID.

**Path Parameters:**
- `id`: BigInt - The summary ID

**Query Parameters:**
- `include_relations`: Boolean - Include related entities (ScheduleMaster, Department, ShiftType, etc.)

**Response:**
```json
{
  "message": "Schedule Shift Summary retrieved successfully",
  "data": {
    "id": 1,
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": 30,
    "total_hours": "240.00",
    "total_normal_hours": "240.00",
    "total_ot_hours": "0.00",
    "total_employees": 10,
    "is_active": true,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200`: Success - Summary retrieved
- `401`: Unauthorized - Invalid or missing token
- `404`: Not Found - Summary not found

### 5. Get All Schedule Shift Summaries
**GET** `/schedule-shift-summaries`

Retrieves all schedule shift summaries with optional filtering and pagination.

**Query Parameters:**
- `schedule_master_id`: Integer - Filter by schedule master ID
- `department_id`: Integer - Filter by department ID
- `shift_type_id`: Integer - Filter by shift type ID
- `is_active`: Boolean - Filter by active status
- `include_relations`: Boolean - Include related entities
- `limit`: Integer - Number of records per page (default: 100, max: 1000)
- `offset`: Integer - Number of records to skip (default: 0)

**Response:**
```json
{
  "message": "Schedule Shift Summaries retrieved successfully",
  "data": [
    {
      "id": 1,
      "schedule_master_id": 1,
      "department_id": 1,
      "shift_type_id": 1,
      "total_shifts": 30,
      "total_hours": "240.00",
      "total_normal_hours": "240.00",
      "total_ot_hours": "0.00",
      "total_employees": 10,
      "is_active": true,
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "totalPages": 1,
    "limit": 100,
    "offset": 0
  }
}
```

**Status Codes:**
- `200`: Success - Summaries retrieved
- `400`: Bad Request - Invalid query parameters
- `401`: Unauthorized - Invalid or missing token

### 6. Get Active Schedule Shift Summaries
**GET** `/schedule-shift-summaries/active/list`

Retrieves only active schedule shift summaries.

**Response:**
```json
{
  "message": "Active Schedule Shift Summaries retrieved successfully",
  "data": [
    {
      "id": 1,
      "schedule_master_id": 1,
      "department_id": 1,
      "shift_type_id": 1,
      "total_shifts": 30,
      "total_hours": "240.00",
      "total_normal_hours": "240.00",
      "total_ot_hours": "0.00",
      "total_employees": 10,
      "is_active": true,
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200`: Success - Active summaries retrieved
- `401`: Unauthorized - Invalid or missing token

### 7. Get Schedule Shift Summaries by Schedule Master
**GET** `/schedule-shift-summaries/schedule-master/:scheduleId`

Retrieves all summaries for a specific schedule master.

**Path Parameters:**
- `scheduleId`: Integer - The schedule master ID

**Response:**
```json
{
  "message": "Schedule Shift Summaries retrieved successfully",
  "data": [
    {
      "id": 1,
      "schedule_master_id": 1,
      "department_id": 1,
      "shift_type_id": 1,
      "total_shifts": 30,
      "total_hours": "240.00",
      "total_normal_hours": "240.00",
      "total_ot_hours": "0.00",
      "total_employees": 10,
      "is_active": true,
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200`: Success - Summaries retrieved
- `401`: Unauthorized - Invalid or missing token

### 8. Get Schedule Shift Summaries by Department
**GET** `/schedule-shift-summaries/department/:departmentId`

Retrieves all summaries for a specific department.

**Path Parameters:**
- `departmentId`: Integer - The department ID

**Response:**
```json
{
  "message": "Schedule Shift Summaries retrieved successfully",
  "data": [
    {
      "id": 1,
      "schedule_master_id": 1,
      "department_id": 1,
      "shift_type_id": 1,
      "total_shifts": 30,
      "total_hours": "240.00",
      "total_normal_hours": "240.00",
      "total_ot_hours": "0.00",
      "total_employees": 10,
      "is_active": true,
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200`: Success - Summaries retrieved
- `401`: Unauthorized - Invalid or missing token

### 9. Get Schedule Shift Summaries by Shift Type
**GET** `/schedule-shift-summaries/shift-type/:shiftTypeId`

Retrieves all summaries for a specific shift type.

**Path Parameters:**
- `shiftTypeId`: Integer - The shift type ID

**Response:**
```json
{
  "message": "Schedule Shift Summaries retrieved successfully",
  "data": [
    {
      "id": 1,
      "schedule_master_id": 1,
      "department_id": 1,
      "shift_type_id": 1,
      "total_shifts": 30,
      "total_hours": "240.00",
      "total_normal_hours": "240.00",
      "total_ot_hours": "0.00",
      "total_employees": 10,
      "is_active": true,
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200`: Success - Summaries retrieved
- `401`: Unauthorized - Invalid or missing token

### 10. Get Schedule Shift Summary Statistics
**GET** `/schedule-shift-summaries/stats/overview`

Retrieves aggregated statistics for schedule shift summaries.

**Query Parameters:**
- `schedule_master_id`: Integer - Filter by schedule master ID
- `department_id`: Integer - Filter by department ID
- `is_active`: Boolean - Filter by active status

**Response:**
```json
{
  "message": "Schedule Shift Summary statistics retrieved successfully",
  "data": {
    "totalShifts": 120,
    "totalHours": 960.00,
    "totalNormalHours": 800.00,
    "totalOtHours": 160.00,
    "totalEmployees": 45,
    "recordCount": 4
  }
}
```

**Status Codes:**
- `200`: Success - Statistics retrieved
- `401`: Unauthorized - Invalid or missing token

### 11. Bulk Update Schedule Shift Summaries
**PATCH** `/schedule-shift-summaries/bulk-update`

Updates multiple schedule shift summaries at once.

**Request Body:**
```json
{
  "summary_ids": [1, 2, 3],
  "updates": {
    "is_active": false,
    "total_shifts": 25
  }
}
```

**Response:**
```json
{
  "message": "3 schedule shift summaries updated successfully"
}
```

**Status Codes:**
- `200`: Success - Summaries updated
- `400`: Bad Request - Validation error or no records found
- `401`: Unauthorized - Invalid or missing token

### 12. Soft Delete Schedule Shift Summary
**PATCH** `/schedule-shift-summaries/:id/soft-delete`

Deactivates a schedule shift summary (sets is_active to false).

**Path Parameters:**
- `id`: BigInt - The summary ID

**Response:**
```json
{
  "message": "Schedule Shift Summary deactivated successfully"
}
```

**Status Codes:**
- `200`: Success - Summary deactivated
- `400`: Bad Request - Error occurred
- `401`: Unauthorized - Invalid or missing token
- `404`: Not Found - Summary not found

### 13. Upsert Schedule Shift Summary
**POST** `/schedule-shift-summaries/upsert`

Creates a new summary or updates an existing one based on schedule_master_id and shift_type_id combination.

**Request Body:**
```json
{
  "schedule_master_id": 1,
  "department_id": 1,
  "shift_type_id": 1,
  "total_shifts": 30,
  "total_hours": 240.00,
  "total_normal_hours": 240.00,
  "total_ot_hours": 0.00,
  "total_employees": 10,
  "is_active": true
}
```

**Response:**
```json
{
  "message": "Schedule Shift Summary created successfully",
  "data": {
    "id": 1,
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": 30,
    "total_hours": "240.00",
    "total_normal_hours": "240.00",
    "total_ot_hours": "0.00",
    "total_employees": 10,
    "is_active": true,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "created": true
}
```

**Status Codes:**
- `201`: Success - Summary created
- `200`: Success - Summary updated
- `400`: Bad Request - Validation error
- `401`: Unauthorized - Invalid or missing token

## Validation Rules

### Create/Update Validation
- **schedule_master_id**: Required for creation, positive integer
- **department_id**: Required for creation, positive integer
- **shift_type_id**: Required for creation, positive integer
- **total_shifts**: Optional, integer >= 0, default 0
- **total_hours**: Optional, decimal >= 0, default 0
- **total_normal_hours**: Optional, decimal >= 0, default 0
- **total_ot_hours**: Optional, decimal >= 0, default 0
- **total_employees**: Optional, integer >= 0, default 0
- **is_active**: Optional boolean, default true

### Business Rules
- **Unique Constraint**: Combination of schedule_master_id and shift_type_id must be unique
- **Hour Validation**: total_hours must equal total_normal_hours + total_ot_hours
- **Foreign Key Constraints**: schedule_master_id, department_id, shift_type_id must reference valid records

## Error Responses
All endpoints may return these common error responses:

```json
{
  "error": "Error message description"
}
```

## Usage Examples

### Creating a Summary
```bash
curl -X POST /api/v1/schedule-shift-summaries \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": 30,
    "total_hours": 240.00,
    "total_normal_hours": 240.00,
    "total_ot_hours": 0.00,
    "total_employees": 10
  }'
```

### Getting Department Summaries
```bash
curl -X GET /api/v1/schedule-shift-summaries/department/1 \
  -H "Authorization: Bearer <token>"
```

### Updating Multiple Summaries
```bash
curl -X PATCH /api/v1/schedule-shift-summaries/bulk-update \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "summary_ids": [1, 2, 3],
    "updates": {
      "is_active": false
    }
  }'
```

### Getting Statistics
```bash
curl -X GET /api/v1/schedule-shift-summaries/stats/overview?department_id=1 \
  -H "Authorization: Bearer <token>"
```

## Business Logic
- Summaries provide monthly aggregations of shift data by department and shift type
- Unique constraint prevents duplicate summaries for the same schedule and shift type
- Soft delete functionality allows deactivating summaries without losing data
- Statistics endpoint provides quick overview of shift metrics
- Upsert operation allows efficient creation or updating of summaries
- All operations maintain audit trail with created_by and updated_by fields

## Integration Points
- Integrates with schedule_master, departments, and shift_types tables
- Supports authentication and authorization middleware
- Provides data for reporting and analytics systems
- Can be used for shift planning and resource allocation
