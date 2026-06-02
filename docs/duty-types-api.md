# Duty Types API Documentation

## Overview
The Duty Types API provides RESTful endpoints for managing duty type master data in the MediAct system. This API allows you to create, read, update, and delete duty types, as well as perform bulk operations and validation.

## Base URL
```
/duty-types
```

## Authentication
All endpoints require authentication using JWT Bearer token.

## Endpoints

### 1. Create Duty Type
**POST** `/duty-types`

Creates a new duty type.

**Request Body:**
```json
{
  "code": "string (required, max 50 chars, unique)",
  "name": "string (required, max 100 chars)",
  "description": "string (optional)",
  "is_active": "boolean (optional, default: true)"
}
```

**Response:**
```json
{
  "message": "Duty type created successfully",
  "dutyType": {
    "id": 1,
    "code": "shift",
    "name": "เข้าเวร",
    "description": "เข้าเวรทำงานปกติ",
    "is_active": true,
    "created_at": "2025-01-16T10:00:00Z",
    "updated_at": "2025-01-16T10:00:00Z",
    "created_by": 1,
    "updated_by": 1
  }
}
```

### 2. Get All Duty Types
**GET** `/duty-types`

Retrieves all duty types with filtering and pagination.

**Query Parameters:**
- `code` (optional): Filter by code (partial match)
- `name` (optional): Filter by name (partial match)
- `is_active` (optional): Filter by active status (true/false)
- `search` (optional): Global search across code, name, and description
- `limit` (optional): Number of records per page (default: 100, max: 1000)
- `offset` (optional): Number of records to skip (default: 0)

**Response:**
```json
{
  "dutyTypes": [
    {
      "id": 1,
      "code": "shift",
      "name": "เข้าเวร",
      "description": "เข้าเวรทำงานปกติ",
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

### 3. Get Duty Type by ID
**GET** `/duty-types/:id`

Retrieves a specific duty type by ID.

**Response:**
```json
{
  "dutyType": {
    "id": 1,
    "code": "shift",
    "name": "เข้าเวร",
    "description": "เข้าเวรทำงานปกติ",
    "is_active": true,
    "created_at": "2025-01-16T10:00:00Z",
    "updated_at": "2025-01-16T10:00:00Z",
    "created_by": 1,
    "updated_by": 1
  }
}
```

### 4. Get Duty Type by Code
**GET** `/duty-types/code/:code`

Retrieves a specific duty type by code.

**Response:**
```json
{
  "dutyType": {
    "id": 1,
    "code": "shift",
    "name": "เข้าเวร",
    "description": "เข้าเวรทำงานปกติ",
    "is_active": true,
    "created_at": "2025-01-16T10:00:00Z",
    "updated_at": "2025-01-16T10:00:00Z",
    "created_by": 1,
    "updated_by": 1
  }
}
```

### 5. Get Active Duty Types
**GET** `/duty-types/active/list`

Retrieves all active duty types (simplified response).

**Response:**
```json
{
  "dutyTypes": [
    {
      "id": 1,
      "code": "shift",
      "name": "เข้าเวร",
      "description": "เข้าเวรทำงานปกติ"
    }
  ]
}
```

### 6. Update Duty Type
**PUT** `/duty-types/:id`

Updates an existing duty type.

**Request Body:**
```json
{
  "code": "string (optional, max 50 chars)",
  "name": "string (optional, max 100 chars)",
  "description": "string (optional)",
  "is_active": "boolean (optional)"
}
```

**Response:**
```json
{
  "message": "Duty type updated successfully",
  "dutyType": {
    "id": 1,
    "code": "shift",
    "name": "เข้าเวร",
    "description": "เข้าเวรทำงานปกติ",
    "is_active": true,
    "created_at": "2025-01-16T10:00:00Z",
    "updated_at": "2025-01-16T10:00:00Z",
    "created_by": 1,
    "updated_by": 1
  }
}
```

### 7. Delete Duty Type (Soft Delete)
**DELETE** `/duty-types/:id`

Soft deletes a duty type by setting `is_active` to `false`.

**Response:**
```json
{
  "message": "Duty type deleted successfully"
}
```

### 8. Bulk Update Duty Types
**PUT** `/duty-types/bulk/update`

Updates multiple duty types at once.

**Request Body:**
```json
{
  "duty_type_ids": [1, 2, 3],
  "updates": {
    "is_active": false,
    "description": "Updated description"
  }
}
```

**Response:**
```json
{
  "message": "Duty types updated successfully",
  "affectedRows": 3
}
```

### 9. Validate Duty Type Exists
**POST** `/duty-types/validate/exists`

Validates if duty types with given codes exist.

**Request Body:**
```json
{
  "codes": ["shift", "leave", "overtime"]
}
```

**Response:**
```json
{
  "valid": true,
  "found": [
    {
      "id": 1,
      "code": "shift",
      "name": "เข้าเวร"
    }
  ],
  "missing": ["leave", "overtime"]
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

## Pre-installed Duty Types

The system comes with the following pre-installed duty types:

1. **shift** - เข้าเวร (Regular shift work)
2. **leave** - ลา (Leave of absence)
3. **overtime** - ทำงานล่วงเวลา (Overtime work)
4. **holiday** - วันหยุด (Holiday)
5. **sick_leave** - ลาป่วย (Sick leave)
6. **vacation** - ลาพักร้อน (Vacation leave)
7. **business_trip** - เดินทางธุรกิจ (Business trip)
8. **training** - อบรม (Training)
9. **meeting** - ประชุม (Meeting)
10. **standby** - เตรียมพร้อม (Standby mode)

## Database Schema

The `duty_types` table includes:

- `id` (INT, Primary Key, Auto-increment)
- `code` (VARCHAR(50), Unique, Not Null)
- `name` (VARCHAR(100), Not Null)
- `description` (TEXT, Nullable)
- `is_active` (BOOLEAN, Default: TRUE)
- `created_at` (DATETIME, Auto-generated)
- `updated_at` (DATETIME, Auto-updated)
- `created_by` (INT, Foreign Key to users table)
- `updated_by` (INT, Foreign Key to users table)

## Usage Examples

### Create a new duty type
```bash
curl -X POST https://api.mediact.com/duty-types \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "emergency",
    "name": "เข้าเวรฉุกเฉิน",
    "description": "เข้าเวรกรณีฉุกเฉิน"
  }'
```

### Get all active duty types
```bash
curl -X GET https://api.mediact.com/duty-types/active/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Search duty types
```bash
curl -X GET "https://api.mediact.com/duty-types?search=เวร&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update a duty type
```bash
curl -X PUT https://api.mediact.com/duty-types/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }'
```

## Implementation Details

### Files Created/Modified:
1. `sql/create_duty_types_table.sql` - Database migration
2. `src/models/DutyTypeModel.ts` - Sequelize model
3. `src/validations/dutyTypeValidation.ts` - Joi validation schemas
4. `src/services/dutyTypeService.ts` - Business logic layer
5. `src/controllers/dutyTypeController.ts` - Request/response handling
6. `src/routes/dutyTypeRoutes.ts` - Route definitions
7. `src/app.ts` - Route registration

### Architecture Pattern:
- **Model-Service-Controller (MSC)** pattern
- **Validation** layer with Joi schemas
- **Authentication** middleware for all routes
- **Error handling** with proper HTTP status codes
- **Pagination** and filtering support
- **Soft delete** implementation
