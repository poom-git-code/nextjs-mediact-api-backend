# Department Supervisors API Documentation

## Overview
This API manages department supervisors or leads within the system. It allows you to create, update, delete, and query department supervisors with different roles (head, assistant, secretary).

## Table Structure
```sql
CREATE TABLE department_supervisors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  department_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role ENUM('head', 'assistant', 'secretary') DEFAULT 'head',
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT DEFAULT NULL,
  updated_by BIGINT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. Create Department Supervisor
- **POST** `/department-supervisors`
- **Auth Required**: Yes
- **Description**: Creates a new department supervisor

**Request Body:**
```json
{
  "department_id": 1,
  "user_id": 123,
  "role": "head", // Optional: "head", "assistant", "secretary"
  "is_active": true // Optional: defaults to true
}
```

**Response:**
```json
{
  "message": "Department supervisor created successfully",
  "departmentSupervisor": {
    "id": 1,
    "department_id": 1,
    "user_id": 123,
    "role": "head",
    "is_active": true,
    "created_by": 456,
    "updated_by": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### 2. Update Department Supervisor
- **PUT** `/department-supervisors/:id`
- **Auth Required**: Yes
- **Description**: Updates an existing department supervisor

**Request Body:**
```json
{
  "department_id": 2, // Optional
  "user_id": 124, // Optional
  "role": "assistant", // Optional
  "is_active": false // Optional
}
```

### 3. Delete Department Supervisor (Soft Delete)
- **DELETE** `/department-supervisors/:id`
- **Auth Required**: Yes
- **Description**: Deactivates a department supervisor (sets is_active to false)

**Response:**
```json
{
  "message": "Department supervisor deactivated successfully"
}
```

### 4. Get Department Supervisor by ID
- **GET** `/department-supervisors/:id`
- **Auth Required**: Yes
- **Description**: Retrieves a specific department supervisor with related data

**Response:**
```json
{
  "departmentSupervisor": {
    "id": 1,
    "department_id": 1,
    "user_id": 123,
    "role": "head",
    "is_active": true,
    "created_by": 456,
    "updated_by": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "user": {
      "id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    },
    "department": {
      "id": 1,
      "name": "IT Department"
    },
    "created_by_user": {
      "id": 456,
      "first_name": "Admin",
      "last_name": "User"
    },
    "updated_by_user": null
  }
}
```

### 5. Get All Department Supervisors
- **GET** `/department-supervisors`
- **Auth Required**: Yes
- **Description**: Retrieves all department supervisors with optional filtering

**Query Parameters:**
- `department_id` (optional): Filter by department ID
- `user_id` (optional): Filter by user ID
- `role` (optional): Filter by role (head, assistant, secretary)
- `is_active` (optional): Filter by active status (true/false)

**Example**: `GET /department-supervisors?department_id=1&role=head&is_active=true`

### 6. Get Department Supervisors by Department
- **GET** `/department-supervisors/department/:departmentId`
- **Auth Required**: Yes
- **Description**: Retrieves all active supervisors for a specific department

**Response:**
```json
{
  "departmentSupervisors": [
    {
      "id": 1,
      "department_id": 1,
      "user_id": 123,
      "role": "head",
      "is_active": true,
      "user": {
        "id": 123,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      },
      "department": {
        "id": 1,
        "name": "IT Department"
      }
    }
  ]
}
```

### 7. Get Department Supervisors by User
- **GET** `/department-supervisors/user/:userId`
- **Auth Required**: Yes
- **Description**: Retrieves all active supervisor roles for a specific user

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### Common Error Messages:
- "Department ID is required."
- "User ID is required."
- "Role must be one of: head, assistant, secretary."
- "User not found"
- "Department not found"
- "User is already a supervisor for this department"
- "Department supervisor not found"

## Business Rules

1. **Unique Constraint**: A user can only be assigned as a supervisor to the same department once (when active)
2. **Role Hierarchy**: The system supports three roles: head, assistant, secretary
3. **Soft Delete**: Supervisors are not physically deleted but deactivated (is_active = false)
4. **Audit Trail**: All operations are tracked with created_by and updated_by fields
5. **Foreign Key Validation**: Both user_id and department_id must reference existing records

## Usage Examples

### Create a Department Head
```bash
curl -X POST /department-supervisors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "department_id": 1,
    "user_id": 123,
    "role": "head"
  }'
```

### Get All Supervisors for a Department
```bash
curl -X GET /department-supervisors/department/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Supervisor Role
```bash
curl -X PUT /department-supervisors/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "role": "assistant"
  }'
```

### Deactivate a Supervisor
```bash
curl -X DELETE /department-supervisors/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
