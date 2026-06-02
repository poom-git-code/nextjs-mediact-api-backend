# Facility Admins API Documentation

## Overview
The Facility Admins API manages the assignment of users as administrators for facilities. This API allows you to create, read, update, and delete facility admin assignments.

## Base URL
All endpoints are relative to: `/api`

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Facility Admin Assignment
**POST** `/facility-admins`

Creates a new facility admin assignment.

#### Request Body
```json
{
  "facility_id": 1,
  "user_id": 5,
  "assigned_at": "2025-01-15T10:00:00Z", // Optional
  "is_active": true // Optional, defaults to true
}
```

#### Response
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

### 2. Update Facility Admin Assignment
**PUT** `/facility-admins/:id`

Updates an existing facility admin assignment.

#### URL Parameters
- `id` (integer): The ID of the facility admin assignment

#### Request Body
```json
{
  "facility_id": 2, // Optional
  "user_id": 6, // Optional
  "assigned_at": "2025-01-16T10:00:00Z", // Optional
  "is_active": false // Optional
}
```

#### Response
```json
{
  "message": "Facility admin assignment updated successfully",
  "facilityAdmin": {
    "id": 1,
    "facility_id": 2,
    "user_id": 6,
    "assigned_at": "2025-01-16T10:00:00Z",
    "is_active": false,
    "created_by": 2,
    "updated_by": 3,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-16T11:00:00Z"
  }
}
```

### 3. Delete Facility Admin Assignment
**DELETE** `/facility-admins/:id`

Deletes a facility admin assignment.

#### URL Parameters
- `id` (integer): The ID of the facility admin assignment

#### Response
```json
{
  "message": "Facility admin assignment deleted successfully"
}
```

### 4. Get Facility Admin Assignment by ID
**GET** `/facility-admins/:id`

Retrieves a specific facility admin assignment with related facility and user information.

#### URL Parameters
- `id` (integer): The ID of the facility admin assignment

#### Response
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

### 5. Get All Facility Admin Assignments
**GET** `/facility-admins`

Retrieves all facility admin assignments with related facility and user information.

#### Response
```json
{
  "facilityAdmins": [
    {
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
  ],
  "total": 1
}
```

### 6. Get Facility Admin Assignments by Facility
**GET** `/facility-admins/facility/:facility_id`

Retrieves all admin assignments for a specific facility.

#### URL Parameters
- `facility_id` (integer): The ID of the facility

#### Response
```json
{
  "facilityAdmins": [
    {
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
  ],
  "total": 1
}
```

### 7. Get Facility Admin Assignments by User
**GET** `/facility-admins/user/:user_id`

Retrieves all facility assignments for a specific user.

#### URL Parameters
- `user_id` (integer): The ID of the user

#### Response
```json
{
  "facilityAdmins": [
    {
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
  ],
  "total": 1
}
```

### 8. Get Active Facility Admin Assignments
**GET** `/facility-admins/active/list`

Retrieves all active facility admin assignments.

#### Response
```json
{
  "facilityAdmins": [
    {
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
  ],
  "total": 1
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Facility ID must be a positive number."
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized: User ID not found in token"
}
```

### 404 Not Found
```json
{
  "error": "Facility admin assignment not found"
}
```

### 409 Conflict
```json
{
  "error": "User is already assigned as admin for this facility"
}
```

## Business Rules

1. **Unique Assignment**: A user can only be assigned as an active admin to a facility once. If you try to assign the same user to the same facility while an active assignment exists, it will return an error.

2. **Facility Validation**: The facility must exist before creating an assignment.

3. **User Validation**: The user must exist before creating an assignment.

4. **Audit Trail**: All create and update operations track who performed the action via `created_by` and `updated_by` fields.

5. **Soft Delete**: The API uses hard delete. If you need to maintain history, set `is_active` to `false` instead of deleting.

## Database Schema

```sql
CREATE TABLE facility_admins (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key',
  facility_id INT NOT NULL COMMENT 'ID ของ Facility',
  user_id INT NOT NULL COMMENT 'ID ของ Partner Admin',
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่เริ่มเป็นผู้ดูแล',
  is_active TINYINT(1) DEFAULT 1 COMMENT 'สถานะการเป็นผู้ดูแล: 1 = ใช้งานอยู่, 0 = ไม่ใช้งาน',
  created_by INT DEFAULT NULL COMMENT 'ผู้สร้างข้อมูล',
  updated_by INT DEFAULT NULL COMMENT 'ผู้แก้ไขล่าสุด',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้างข้อมูล',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันที่แก้ไขล่าสุด'
);
```
