# Department Operating Hours API Documentation

## Overview
This API manages operating hours for departments by weekday and time range.

## Base URL
```
/department-operating-hours
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Create Department Operating Hours
**POST** `/department-operating-hours`

Creates new operating hours for a department on a specific weekday.

**Request Body:**
```json
{
  "department_id": 1,
  "weekday": "mon",
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "message": "Department operating hours created successfully",
  "departmentOperatingHours": {
    "id": 1,
    "department_id": 1,
    "weekday": "mon",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "is_active": true,
    "created_by": 1,
    "updated_by": null,
    "created_at": "2025-01-16T10:00:00.000Z",
    "updated_at": "2025-01-16T10:00:00.000Z"
  }
}
```

### 2. Get All Department Operating Hours
**GET** `/department-operating-hours`

Retrieves all department operating hours with optional filtering.

**Query Parameters:**
- `department_id` (optional) - Filter by department ID
- `weekday` (optional) - Filter by weekday (mon, tue, wed, thu, fri, sat, sun)
- `is_active` (optional) - Filter by active status (true/false)

**Response (200 OK):**
```json
{
  "departmentOperatingHours": [
    {
      "id": 1,
      "department_id": 1,
      "weekday": "mon",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "is_active": true,
      "created_by": 1,
      "updated_by": null,
      "created_at": "2025-01-16T10:00:00.000Z",
      "updated_at": "2025-01-16T10:00:00.000Z",
      "department": {
        "id": 1,
        "name": "IT Department"
      },
      "created_by_user": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      },
      "updated_by_user": null
    }
  ]
}
```

### 3. Get Department Operating Hours by ID
**GET** `/department-operating-hours/:id`

Retrieves a specific department operating hours record by ID.

**Response (200 OK):**
```json
{
  "departmentOperatingHours": {
    "id": 1,
    "department_id": 1,
    "weekday": "mon",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "is_active": true,
    "created_by": 1,
    "updated_by": null,
    "created_at": "2025-01-16T10:00:00.000Z",
    "updated_at": "2025-01-16T10:00:00.000Z",
    "department": {
      "id": 1,
      "name": "IT Department"
    },
    "created_by_user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe"
    },
    "updated_by_user": null
  }
}
```

### 4. Update Department Operating Hours
**PUT** `/department-operating-hours/:id`

Updates an existing department operating hours record.

**Request Body:**
```json
{
  "start_time": "09:00:00",
  "end_time": "18:00:00",
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "message": "Department operating hours updated successfully",
  "departmentOperatingHours": {
    "id": 1,
    "department_id": 1,
    "weekday": "mon",
    "start_time": "09:00:00",
    "end_time": "18:00:00",
    "is_active": true,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2025-01-16T10:00:00.000Z",
    "updated_at": "2025-01-16T10:30:00.000Z"
  }
}
```

### 5. Delete Department Operating Hours
**DELETE** `/department-operating-hours/:id`

Soft deletes a department operating hours record by setting `is_active` to false.

**Response (200 OK):**
```json
{
  "message": "Department operating hours deactivated successfully"
}
```

### 6. Get Department Operating Hours by Department
**GET** `/department-operating-hours/department/:departmentId`

Retrieves all operating hours for a specific department.

**Response (200 OK):**
```json
{
  "departmentOperatingHours": [
    {
      "id": 1,
      "department_id": 1,
      "weekday": "mon",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "is_active": true,
      "created_by": 1,
      "updated_by": null,
      "created_at": "2025-01-16T10:00:00.000Z",
      "updated_at": "2025-01-16T10:00:00.000Z",
      "department": {
        "id": 1,
        "name": "IT Department"
      },
      "created_by_user": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      },
      "updated_by_user": null
    }
  ]
}
```

### 7. Get Department Operating Hours by Weekday
**GET** `/department-operating-hours/weekday/:weekday`

Retrieves all operating hours for a specific weekday across all departments.

**Valid weekdays:** mon, tue, wed, thu, fri, sat, sun

**Response (200 OK):**
```json
{
  "departmentOperatingHours": [
    {
      "id": 1,
      "department_id": 1,
      "weekday": "mon",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "is_active": true,
      "created_by": 1,
      "updated_by": null,
      "created_at": "2025-01-16T10:00:00.000Z",
      "updated_at": "2025-01-16T10:00:00.000Z",
      "department": {
        "id": 1,
        "name": "IT Department"
      },
      "created_by_user": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      },
      "updated_by_user": null
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Start time must be before end time"
}
```

### 404 Not Found
```json
{
  "error": "Department operating hours not found"
}
```

### 409 Conflict
```json
{
  "error": "Operating hours for this department and weekday already exist"
}
```

## Validation Rules

### Create/Update Validation
- `department_id`: Required (create only), must be a positive integer, department must exist
- `weekday`: Required (create only), must be one of: mon, tue, wed, thu, fri, sat, sun
- `start_time`: Required (create only), must be in HH:MM:SS format
- `end_time`: Required (create only), must be in HH:MM:SS format
- `is_active`: Optional, boolean, defaults to true
- `start_time` must be before `end_time`
- Cannot create duplicate operating hours for the same department and weekday

## Business Rules

1. **Unique Constraint**: Each department can have only one set of operating hours per weekday
2. **Time Validation**: Start time must be before end time
3. **Soft Delete**: Delete operations set `is_active` to false instead of hard deletion
4. **Audit Trail**: All operations track who created and last updated the record
5. **Department Validation**: Department must exist before creating operating hours
6. **Weekday Validation**: Only valid weekday abbreviations are accepted

## Example Usage

### Create Monday to Friday operating hours for a department
```bash
# Monday
curl -X POST /department-operating-hours \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "department_id": 1,
    "weekday": "mon",
    "start_time": "08:00:00",
    "end_time": "17:00:00"
  }'

# Tuesday
curl -X POST /department-operating-hours \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "department_id": 1,
    "weekday": "tue",
    "start_time": "08:00:00",
    "end_time": "17:00:00"
  }'
```

### Get all operating hours for a specific department
```bash
curl -X GET /department-operating-hours/department/1 \
  -H "Authorization: Bearer <token>"
```

### Get all Monday operating hours across all departments
```bash
curl -X GET /department-operating-hours/weekday/mon \
  -H "Authorization: Bearer <token>"
```
