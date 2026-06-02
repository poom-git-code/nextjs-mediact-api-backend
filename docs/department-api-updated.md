# Department API Documentation - Updated

## Overview
The Department API has been updated to include new fields for managing day-off request deadlines and schedule settings for weekends and holidays.

## New Fields Added

### 1. dayoff_duedate
- **Type**: Integer
- **Default**: 5
- **Description**: Number of days in advance required for day-off request deadline
- **Validation**: Must be between 1 and 30 days
- **Comment**: Controls how many days in advance employees must submit day-off requests

### 2. include_weekend
- **Type**: Boolean (TINYINT(1))
- **Default**: true (1)
- **Description**: Indicates whether weekends are included in the department schedule
- **Values**: 
  - `true` (1) = Weekends are included in department schedule
  - `false` (0) = Weekends are not included in department schedule

### 3. include_holiday
- **Type**: Boolean (TINYINT(1))
- **Default**: true (1)
- **Description**: Indicates whether holidays are included in the department schedule
- **Values**: 
  - `true` (1) = Holidays are included in department schedule
  - `false` (0) = Holidays are not included in department schedule

## Updated API Endpoints

### Create Department
**POST** `/departments`

**Request Body:**
```json
{
  "name": "IT Department",
  "type_id": 1,
  "dayoff_duedate": 7,
  "include_weekend": true,
  "include_holiday": false
}
```

**Response:**
```json
{
  "message": "Department created successfully",
  "department": {
    "id": 1,
    "name": "IT Department",
    "type_id": 1,
    "facility_id": 1,
    "parent_department_id": null,
    "dayoff_duedate": 7,
    "include_weekend": true,
    "include_holiday": false,
    "is_active": true,
    "created_by": 123,
    "updated_by": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### Update Department
**PUT** `/departments/:id`

**Request Body (all fields optional):**
```json
{
  "name": "Updated IT Department",
  "type_id": 2,
  "dayoff_duedate": 10,
  "include_weekend": false,
  "include_holiday": true,
  "is_active": true
}
```

### Get Department by ID
**GET** `/departments/:id`

**Response:**
```json
{
  "department": {
    "id": 1,
    "name": "IT Department",
    "type_id": 1,
    "facility_id": 1,
    "parent_department_id": null,
    "dayoff_duedate": 7,
    "include_weekend": true,
    "include_holiday": false,
    "is_active": true,
    "created_by": 123,
    "updated_by": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "department_type": {
      "id": 1,
      "name": "Technical",
      "description": "Technical department"
    }
  }
}
```

## Validation Rules

### dayoff_duedate
- Must be an integer
- Minimum value: 1
- Maximum value: 30
- Default: 5

### include_weekend
- Must be a boolean value
- Default: true

### include_holiday
- Must be a boolean value
- Default: true

## Error Messages

### Validation Errors
```json
{
  "error": "Day-off due date must be at least 1 day."
}
```

```json
{
  "error": "Day-off due date must not exceed 30 days."
}
```

```json
{
  "error": "Include weekend must be a boolean."
}
```

```json
{
  "error": "Include holiday must be a boolean."
}
```

## Database Schema Update

```sql
ALTER TABLE departments
  ADD COLUMN dayoff_duedate INT DEFAULT 5 COMMENT 'Number of days in advance required for day-off request deadline',
  ADD COLUMN include_weekend TINYINT(1) DEFAULT 1 COMMENT 'Indicates whether weekends are included in the department schedule (1 = yes, 0 = no)',
  ADD COLUMN include_holiday TINYINT(1) DEFAULT 1 COMMENT 'Indicates whether holidays are included in the department schedule (1 = yes, 0 = no)';
```

## Usage Examples

### Create Department with Custom Settings
```bash
curl -X POST /departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "HR Department",
    "type_id": 2,
    "dayoff_duedate": 14,
    "include_weekend": false,
    "include_holiday": true
  }'
```

### Update Department Schedule Settings
```bash
curl -X PUT /departments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "dayoff_duedate": 3,
    "include_weekend": true,
    "include_holiday": false
  }'
```

## Business Logic

### Day-off Request Deadline
- The `dayoff_duedate` field determines how many days in advance employees must submit their day-off requests
- For example, if set to 7, employees must submit requests at least 7 days before the requested day off
- This helps managers plan staffing and approve requests in advance

### Weekend Schedule
- `include_weekend = true`: Department operates on weekends, employees can work/request time off on weekends
- `include_weekend = false`: Department doesn't operate on weekends, weekend scheduling is not applicable

### Holiday Schedule
- `include_holiday = true`: Department operates on holidays, employees can work/request time off on holidays
- `include_holiday = false`: Department doesn't operate on holidays, holiday scheduling is not applicable

## Migration Notes

1. **Backward Compatibility**: All new fields have default values, so existing records will automatically get:
   - `dayoff_duedate = 5`
   - `include_weekend = true`
   - `include_holiday = true`

2. **Database Indexes**: New indexes have been added for performance optimization on the new fields

3. **Application Updates**: The following components have been updated:
   - `DepartmentModel.ts` - Added new field definitions
   - `departmentValidation.ts` - Added validation for new fields
   - Documentation and SQL migration files
