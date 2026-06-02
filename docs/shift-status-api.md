# Shift Status API Documentation

## Overview
The Shift Status API manages different statuses that can be assigned to shifts in the scheduling system. This API provides full CRUD operations for managing shift statuses with comprehensive validation and error handling.

## Model Structure

### ShiftStatusModel Properties
- **id**: Primary key, auto-incrementing integer
- **name**: String (max 50 characters, required, unique) - Name of the status
- **description**: Text (optional) - Description of the status
- **is_active**: Boolean (default true) - Status activity flag
- **created_at**: Date - Timestamp when the status was created
- **updated_at**: Date - Timestamp when the status was last updated
- **created_by**: Integer (optional) - User ID of the creator
- **updated_by**: Integer (optional) - User ID of the last updater

## API Endpoints

### 1. Create Shift Status
**POST** `/shift-statuses`

**Request Body:**
```json
{
  "name": "In Progress",
  "description": "Shift is currently in progress",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "message": "Shift Status created successfully",
  "shiftStatus": {
    "id": 1,
    "name": "In Progress",
    "description": "Shift is currently in progress",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "created_by": 123,
    "updated_by": null
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Name is required."
}
```

### 2. Update Shift Status
**PUT** `/shift-statuses/:id`

**Request Body:**
```json
{
  "name": "Active",
  "description": "Shift is currently active and in progress",
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "message": "Shift Status updated successfully",
  "updatedShiftStatus": {
    "id": 1,
    "name": "Active",
    "description": "Shift is currently active and in progress",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T10:30:00.000Z",
    "created_by": 123,
    "updated_by": 456
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Shift Status not found"
}
```

### 3. Delete Shift Status
**DELETE** `/shift-statuses/:id`

**Response (200 OK):**
```json
{
  "message": "Shift Status deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Shift Status not found"
}
```

### 4. Get Shift Status by ID
**GET** `/shift-statuses/:id`

**Response (200 OK):**
```json
{
  "shiftStatus": {
    "id": 1,
    "name": "In Progress",
    "description": "Shift is currently in progress",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "created_by": 123,
    "updated_by": null
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Shift Status not found"
}
```

### 5. Get All Shift Statuses
**GET** `/shift-statuses`

**Response (200 OK):**
```json
{
  "shiftStatuses": [
    {
      "id": 1,
      "name": "Draft",
      "description": "Shift is in draft state",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "created_by": 1,
      "updated_by": null
    },
    {
      "id": 2,
      "name": "Scheduled",
      "description": "Shift is scheduled and confirmed",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "created_by": 1,
      "updated_by": null
    }
  ]
}
```

### 6. Get Active Shift Statuses
**GET** `/shift-statuses/active`

**Response (200 OK):**
```json
{
  "shiftStatuses": [
    {
      "id": 1,
      "name": "Draft",
      "description": "Shift is in draft state",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "created_by": 1,
      "updated_by": null
    },
    {
      "id": 2,
      "name": "Scheduled",
      "description": "Shift is scheduled and confirmed",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "created_by": 1,
      "updated_by": null
    }
  ]
}
```

### 7. Get Shift Status by Name
**GET** `/shift-statuses/name/:name`

**Response (200 OK):**
```json
{
  "shiftStatus": {
    "id": 1,
    "name": "In Progress",
    "description": "Shift is currently in progress",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "created_by": 123,
    "updated_by": null
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Shift Status not found"
}
```

## Validation Rules

### Create Shift Status
- **name**: Required, string, maximum 50 characters, must be unique
- **description**: Optional, string, can be empty
- **is_active**: Optional, boolean, defaults to true

### Update Shift Status
- **name**: Optional, string, maximum 50 characters, must be unique if provided
- **description**: Optional, string, can be empty
- **is_active**: Optional, boolean

## Default Shift Statuses

The system comes with the following default shift statuses:

1. **Draft** - Shift is in draft state
2. **Scheduled** - Shift is scheduled and confirmed
3. **In Progress** - Shift is currently in progress
4. **Completed** - Shift has been completed
5. **Cancelled** - Shift has been cancelled
6. **No Show** - Employee did not show up for shift
7. **Late** - Employee was late for shift
8. **Early Leave** - Employee left early from shift

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "error": "Name must not exceed 50 characters."
}
```

**404 Not Found:**
```json
{
  "error": "Shift Status not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Unknown error occurred"
}
```

### Validation Errors

The API uses Joi validation with detailed error messages:

- **Name validation**: "Name is required.", "Name must not exceed 50 characters."
- **Description validation**: "Description must be a string."
- **Is active validation**: "Is active must be a boolean."

## Database Schema

```sql
CREATE TABLE shift_statuses (
  id INT NOT NULL AUTO_INCREMENT COMMENT 'Primary Key: Unique ID for each schedule status',
  name VARCHAR(50) NOT NULL COMMENT 'Name of the status (e.g., Draft, Published, Edited, Cancelled)',
  description TEXT DEFAULT NULL COMMENT 'Description of the status',
  is_active TINYINT(1) DEFAULT 1 COMMENT 'Department status: true = active, false = inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the status was created',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when the address was last updated',
  created_by INT DEFAULT NULL COMMENT 'User ID of the creator who created this record',
  updated_by INT DEFAULT NULL COMMENT 'User ID of the last updater who updated this record',
  PRIMARY KEY (id),
  UNIQUE KEY name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table for schedule statuses';
```

## Usage Examples

### Creating a Custom Status
```bash
curl -X POST http://localhost:3000/shift-statuses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "On Break",
    "description": "Employee is currently on break during shift",
    "is_active": true
  }'
```

### Updating a Status
```bash
curl -X PUT http://localhost:3000/shift-statuses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "Updated description for the status"
  }'
```

### Getting Active Statuses for Dropdown
```bash
curl -X GET http://localhost:3000/shift-statuses/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Integration with Other Systems

### Shift Management
- Used in `schedule_shifts` table to track shift status
- Referenced when updating shift progress
- Used for filtering and reporting

### Reporting
- Status distribution reports
- Shift completion tracking
- Employee attendance analysis

### Mobile Apps
- Status selection in mobile interfaces
- Real-time status updates
- Push notifications based on status changes

## Security Considerations

- Authentication required for all endpoints
- User ID automatically captured for created_by and updated_by fields
- Proper authorization checks should be implemented
- Input validation prevents SQL injection and XSS attacks

## Performance Considerations

- Indexed fields for fast lookups
- Ordered results for consistent UI display
- Optimized queries for active status filtering
- Caching recommended for frequently accessed statuses
