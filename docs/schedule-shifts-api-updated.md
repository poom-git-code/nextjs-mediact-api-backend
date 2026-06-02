# Schedule Shifts API Documentation - Updated

## Overview
The Schedule Shifts API has been enhanced with new fields for comprehensive shift management, attendance tracking, and overtime handling. This update provides detailed shift snapshots, replacement tracking, and actual time monitoring capabilities.

## New Fields Added

### 1. Shift Time Snapshots
- **start_time**: TIME - Start time of the shift (snapshot from shift_types)
- **end_time**: TIME - End time of the shift (snapshot from shift_types)

### 2. Hours Breakdown
- **total_hours**: DECIMAL(5,2) - Total hours of this shift
- **normal_hours**: DECIMAL(5,2) - Normal working hours (excluding OT)
- **ot_hours**: DECIMAL(5,2) - Overtime hours (if any)

### 3. Shift Classification
- **is_overtime**: BOOLEAN - Flag indicating if this is an overtime shift
- **is_replacement**: BOOLEAN - Flag if this shift is assigned as replacement

### 4. Replacement Tracking
- **replaced_employee_id**: INT - Employee ID who was originally assigned this shift

### 5. Attendance Tracking
- **actual_check_in**: DATETIME - Actual check-in time
- **actual_check_out**: DATETIME - Actual check-out time
- **late_minutes**: INT - Number of minutes late to check in
- **early_leave_minutes**: INT - Number of minutes left before shift end

## Updated API Endpoints

### Create Schedule Shift
**POST** `/schedule-shifts`

**Request Body:**
```json
{
  "schedule_master_id": 1,
  "shift_type_id": 1,
  "employee_id": 123,
  "status_id": 1,
  "start_time": "08:00:00",              // NEW
  "end_time": "17:00:00",                // NEW
  "total_hours": 9.00,                   // NEW
  "normal_hours": 8.00,                  // NEW
  "ot_hours": 1.00,                      // NEW
  "is_overtime": false,                  // NEW
  "is_replacement": false,               // NEW
  "replaced_employee_id": null,          // NEW
  "actual_check_in": null,               // NEW
  "actual_check_out": null,              // NEW
  "late_minutes": 0,                     // NEW
  "early_leave_minutes": 0,              // NEW
  "remarks": "Regular shift assignment"
}
```

**Response:**
```json
{
  "message": "Schedule Shift created successfully",
  "shift": {
    "id": 1,
    "schedule_master_id": 1,
    "shift_type_id": 1,
    "employee_id": 123,
    "facility_id": 1,
    "department_id": 1,
    "shift_date": "2025-01-15",
    "status_id": 1,
    "start_time": "08:00:00",              // NEW
    "end_time": "17:00:00",                // NEW
    "total_hours": 9.00,                   // NEW
    "normal_hours": 8.00,                  // NEW
    "ot_hours": 1.00,                      // NEW
    "is_overtime": false,                  // NEW
    "is_replacement": false,               // NEW
    "replaced_employee_id": null,          // NEW
    "actual_check_in": null,               // NEW
    "actual_check_out": null,              // NEW
    "late_minutes": 0,                     // NEW
    "early_leave_minutes": 0,              // NEW
    "remarks": "Regular shift assignment",
    "is_active": true,
    "created_by": 456,
    "updated_by": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### Update Schedule Shift
**PUT** `/schedule-shifts/:id`

**Request Body:**
```json
{
  "actual_check_in": "2025-01-15T08:05:00.000Z",
  "actual_check_out": "2025-01-15T17:10:00.000Z",
  "late_minutes": 5,
  "early_leave_minutes": 0,
  "status_id": 2,
  "remarks": "Completed shift with minor delay"
}
```

**Response:**
```json
{
  "message": "Schedule Shift updated successfully",
  "updatedShift": {
    "id": 1,
    "schedule_master_id": 1,
    "shift_type_id": 1,
    "employee_id": 123,
    "facility_id": 1,
    "department_id": 1,
    "shift_date": "2025-01-15",
    "status_id": 2,
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "total_hours": 9.00,
    "normal_hours": 8.00,
    "ot_hours": 1.00,
    "is_overtime": false,
    "is_replacement": false,
    "replaced_employee_id": null,
    "actual_check_in": "2025-01-15T08:05:00.000Z",    // UPDATED
    "actual_check_out": "2025-01-15T17:10:00.000Z",   // UPDATED
    "late_minutes": 5,                                // UPDATED
    "early_leave_minutes": 0,                         // UPDATED
    "remarks": "Completed shift with minor delay",     // UPDATED
    "is_active": true,
    "created_by": 456,
    "updated_by": 456,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T10:30:00.000Z"
  }
}
```

### Get Schedule Shift
**GET** `/schedule-shifts/:id`

**Response:**
```json
{
  "shift": {
    "id": 1,
    "schedule_master_id": 1,
    "shift_type_id": 1,
    "employee_id": 123,
    "facility_id": 1,
    "department_id": 1,
    "shift_date": "2025-01-15",
    "status_id": 2,
    "start_time": "08:00:00",              // NEW
    "end_time": "17:00:00",                // NEW
    "total_hours": 9.00,                   // NEW
    "normal_hours": 8.00,                  // NEW
    "ot_hours": 1.00,                      // NEW
    "is_overtime": false,                  // NEW
    "is_replacement": false,               // NEW
    "replaced_employee_id": null,          // NEW
    "actual_check_in": "2025-01-15T08:05:00.000Z",    // NEW
    "actual_check_out": "2025-01-15T17:10:00.000Z",   // NEW
    "late_minutes": 5,                     // NEW
    "early_leave_minutes": 0,              // NEW
    "remarks": "Completed shift with minor delay",
    "is_active": true,
    "created_by": 456,
    "updated_by": 456,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T10:30:00.000Z",
    "employee": {
      "id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    },
    "shiftType": {
      "id": 1,
      "name": "Morning Shift",
      "start_time": "08:00:00",
      "end_time": "17:00:00"
    }
  }
}
```

## Use Cases

### 1. Overtime Shift Assignment
```json
{
  "schedule_master_id": 1,
  "shift_type_id": 2,
  "employee_id": 123,
  "status_id": 1,
  "start_time": "18:00:00",
  "end_time": "22:00:00",
  "total_hours": 4.00,
  "normal_hours": 0.00,
  "ot_hours": 4.00,
  "is_overtime": true,
  "is_replacement": false,
  "remarks": "Overtime shift to cover additional workload"
}
```

### 2. Replacement Shift
```json
{
  "schedule_master_id": 1,
  "shift_type_id": 1,
  "employee_id": 456,
  "status_id": 1,
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "total_hours": 9.00,
  "normal_hours": 8.00,
  "ot_hours": 1.00,
  "is_overtime": false,
  "is_replacement": true,
  "replaced_employee_id": 123,
  "remarks": "Replacement for sick employee"
}
```

### 3. Attendance Tracking Update
```json
{
  "actual_check_in": "2025-01-15T08:15:00.000Z",
  "actual_check_out": "2025-01-15T16:45:00.000Z",
  "late_minutes": 15,
  "early_leave_minutes": 15,
  "status_id": 2,
  "remarks": "Late arrival due to traffic, early leave approved by supervisor"
}
```

## Validation Rules

| Field | Type | Range/Format | Default | Required |
|-------|------|--------------|---------|----------|
| start_time | String | HH:mm:ss format | NULL | No |
| end_time | String | HH:mm:ss format | NULL | No |
| total_hours | Decimal | 0-24, 2 decimal places | NULL | No |
| normal_hours | Decimal | 0-24, 2 decimal places | NULL | No |
| ot_hours | Decimal | 0-24, 2 decimal places | NULL | No |
| is_overtime | Boolean | true/false | FALSE | No |
| is_replacement | Boolean | true/false | FALSE | No |
| replaced_employee_id | Integer | Valid employee ID | NULL | No |
| actual_check_in | DateTime | ISO 8601 format | NULL | No |
| actual_check_out | DateTime | ISO 8601 format | NULL | No |
| late_minutes | Integer | ≥ 0 | 0 | No |
| early_leave_minutes | Integer | ≥ 0 | 0 | No |

## Business Logic

### Shift Snapshot Concept
- `start_time` and `end_time` are snapshots from `shift_types` table at the time of assignment
- This ensures historical accuracy even if shift type definitions change later
- Allows for individual shift time adjustments without affecting the master shift type

### Hours Calculation
- `total_hours` = `normal_hours` + `ot_hours`
- `normal_hours` should not exceed the standard working hours
- `ot_hours` represents any overtime portion of the shift

### Replacement Tracking
- When `is_replacement` is true, `replaced_employee_id` should reference the original assignee
- This maintains audit trail for shift changes and replacements

### Attendance Monitoring
- `actual_check_in` and `actual_check_out` capture real attendance times
- `late_minutes` and `early_leave_minutes` automatically calculated or manually entered
- These fields support payroll calculations and attendance reporting

## Database Schema Update

```sql
ALTER TABLE schedule_shifts
  ADD COLUMN start_time TIME DEFAULT NULL COMMENT 'Start time of the shift (snapshot from shift_types)',
  ADD COLUMN end_time TIME DEFAULT NULL COMMENT 'End time of the shift (snapshot from shift_types)',
  ADD COLUMN total_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Total hours of this shift',
  ADD COLUMN normal_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Normal working hours (excluding OT)',
  ADD COLUMN ot_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Overtime hours (if any)',
  ADD COLUMN is_overtime BOOLEAN DEFAULT FALSE COMMENT 'Flag indicating if this is an overtime shift',
  ADD COLUMN is_replacement BOOLEAN DEFAULT FALSE COMMENT 'Flag if this shift is assigned as replacement',
  ADD COLUMN replaced_employee_id INT DEFAULT NULL COMMENT 'Employee ID who was originally assigned this shift',
  ADD COLUMN actual_check_in DATETIME DEFAULT NULL COMMENT 'Actual check-in time',
  ADD COLUMN actual_check_out DATETIME DEFAULT NULL COMMENT 'Actual check-out time',
  ADD COLUMN late_minutes INT DEFAULT 0 COMMENT 'Number of minutes late to check in',
  ADD COLUMN early_leave_minutes INT DEFAULT 0 COMMENT 'Number of minutes left before shift end';
```

## Benefits

### Enhanced Shift Management
- Complete shift information stored independently of shift types
- Support for overtime and replacement shift tracking
- Flexible shift hour management

### Improved Attendance Tracking
- Real-time attendance monitoring
- Automated lateness and early leave calculations
- Comprehensive attendance audit trail

### Better Payroll Integration
- Accurate overtime hour tracking
- Detailed attendance data for payroll calculations
- Support for various pay calculation scenarios

### Historical Accuracy
- Shift time snapshots maintain historical records
- Replacement tracking provides complete audit trail
- Changes to shift types don't affect historical data

## Integration Points

### Payroll System
- Use `normal_hours` and `ot_hours` for pay calculations
- `actual_check_in` and `actual_check_out` for attendance verification
- `late_minutes` and `early_leave_minutes` for deductions

### Time Tracking System
- `actual_check_in` and `actual_check_out` integration
- Real-time attendance monitoring
- Automated calculation of work hours

### Reporting Dashboard
- Overtime analysis using `is_overtime` and `ot_hours`
- Replacement shift tracking using `is_replacement`
- Attendance compliance monitoring

### Mobile App
- Check-in/check-out functionality
- Shift details display with actual times
- Overtime and replacement notifications
