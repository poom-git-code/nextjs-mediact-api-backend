# Shift Types API Documentation - Updated

## Overview
The Shift Types API has been updated with extensive new fields for managing shift details, staffing requirements, and scheduling parameters. This enhanced version provides comprehensive shift management capabilities.

## New Fields Added

### 1. Display & Identification Fields
- **short_name**: VARCHAR(50) - Abbreviated name or label (e.g., "M", "E", "N")
- **color_code**: VARCHAR(10) - Color code for UI display (e.g., "#FF5733")

### 2. Hour Management Fields
- **total_hours**: DECIMAL(5,2) - Total working hours of the shift (including OT)
- **normal_hours**: DECIMAL(5,2) - Regular working hours (excluding OT)
- **ot_hours**: DECIMAL(5,2) - Overtime hours for the shift

### 3. Calculation Control Fields
- **count_as_fte**: BOOLEAN DEFAULT TRUE - Whether this shift counts toward FTE calculation
- **count_as_working_hour**: BOOLEAN DEFAULT TRUE - Whether this shift counts toward total working hours

### 4. Staffing Requirement Fields
- **min_staff_weekday**: INT - Minimum staff required on normal weekdays
- **max_staff_weekday**: INT - Maximum staff allowed on normal weekdays
- **min_staff_weekend**: INT - Minimum staff required on weekends/holidays
- **max_staff_weekend**: INT - Maximum staff allowed on weekends/holidays
- **required_senior_count**: INT DEFAULT 0 - Number of senior staff required in this shift

## Updated API Endpoints

### Create Shift Type
**POST** `/shift-types`

**Request Body:**
```json
{
  "name": "Morning Shift",
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "roles_allowed": "nurse,doctor,admin",
  "short_name": "M",
  "color_code": "#4CAF50",
  "total_hours": 9.00,
  "normal_hours": 8.00,
  "ot_hours": 1.00,
  "count_as_fte": true,
  "count_as_working_hour": true,
  "min_staff_weekday": 5,
  "max_staff_weekday": 10,
  "min_staff_weekend": 3,
  "max_staff_weekend": 8,
  "required_senior_count": 2
}
```

**Response:**
```json
{
  "message": "Shift type created successfully",
  "shiftType": {
    "id": 1,
    "name": "Morning Shift",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "roles_allowed": "nurse,doctor,admin",
    "short_name": "M",
    "color_code": "#4CAF50",
    "total_hours": 9.00,
    "normal_hours": 8.00,
    "ot_hours": 1.00,
    "count_as_fte": true,
    "count_as_working_hour": true,
    "min_staff_weekday": 5,
    "max_staff_weekday": 10,
    "min_staff_weekend": 3,
    "max_staff_weekend": 8,
    "required_senior_count": 2,
    "is_active": true,
    "created_by": 123,
    "updated_by": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### Update Shift Type
**PUT** `/shift-types/:id`

**Request Body (all fields optional):**
```json
{
  "name": "Updated Morning Shift",
  "short_name": "AM",
  "color_code": "#2196F3",
  "total_hours": 8.50,
  "normal_hours": 8.00,
  "ot_hours": 0.50,
  "min_staff_weekday": 6,
  "max_staff_weekday": 12,
  "required_senior_count": 3
}
```

## Validation Rules

### Display Fields
- **short_name**: Max 50 characters, optional
- **color_code**: Max 10 characters, must be hex format (#RRGGBB), optional

### Hour Fields
- **total_hours**: 0-24 hours, up to 2 decimal places, optional
- **normal_hours**: 0-24 hours, up to 2 decimal places, optional
- **ot_hours**: 0-24 hours, up to 2 decimal places, optional

### Boolean Fields
- **count_as_fte**: Boolean, default true
- **count_as_working_hour**: Boolean, default true

### Staffing Fields
- **min_staff_weekday**: Integer ≥ 0, optional
- **max_staff_weekday**: Integer ≥ 0, optional
- **min_staff_weekend**: Integer ≥ 0, optional
- **max_staff_weekend**: Integer ≥ 0, optional
- **required_senior_count**: Integer ≥ 0, default 0

## Error Messages

### Validation Errors
```json
{
  "error": "Color code must be in hex format (e.g., #FF5733)."
}
```

```json
{
  "error": "Total hours must not exceed 24."
}
```

```json
{
  "error": "Short name must not exceed 50 characters."
}
```

```json
{
  "error": "Minimum staff weekday must be at least 0."
}
```

## Database Schema Update

```sql
ALTER TABLE shift_types
  ADD COLUMN short_name VARCHAR(50) DEFAULT NULL COMMENT 'Abbreviated name or label of the shift type (e.g., M, E, N)',
  ADD COLUMN color_code VARCHAR(10) DEFAULT NULL COMMENT 'Color code for UI display (e.g., #FF5733)',
  ADD COLUMN total_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Total working hours of the shift (including OT)',
  ADD COLUMN normal_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Regular working hours (excluding OT)',
  ADD COLUMN ot_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Overtime hours for the shift',
  ADD COLUMN count_as_fte BOOLEAN DEFAULT TRUE COMMENT 'Whether this shift counts toward FTE calculation',
  ADD COLUMN count_as_working_hour BOOLEAN DEFAULT TRUE COMMENT 'Whether this shift counts toward total working hours',
  ADD COLUMN min_staff_weekday INT DEFAULT NULL COMMENT 'Minimum number of staff required on normal weekdays',
  ADD COLUMN max_staff_weekday INT DEFAULT NULL COMMENT 'Maximum number of staff allowed on normal weekdays',
  ADD COLUMN min_staff_weekend INT DEFAULT NULL COMMENT 'Minimum number of staff required on weekends/holidays',
  ADD COLUMN max_staff_weekend INT DEFAULT NULL COMMENT 'Maximum number of staff allowed on weekends/holidays',
  ADD COLUMN required_senior_count INT DEFAULT 0 COMMENT 'Number of senior staff required in this shift';
```

## Usage Examples

### Create a Complete Shift Type
```bash
curl -X POST /shift-types \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Night Shift",
    "start_time": "22:00:00",
    "end_time": "06:00:00",
    "roles_allowed": "nurse,security",
    "short_name": "N",
    "color_code": "#9C27B0",
    "total_hours": 8.00,
    "normal_hours": 8.00,
    "ot_hours": 0.00,
    "count_as_fte": true,
    "count_as_working_hour": true,
    "min_staff_weekday": 3,
    "max_staff_weekday": 6,
    "min_staff_weekend": 2,
    "max_staff_weekend": 4,
    "required_senior_count": 1
  }'
```

### Update Staffing Requirements
```bash
curl -X PUT /shift-types/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "min_staff_weekday": 7,
    "max_staff_weekday": 15,
    "min_staff_weekend": 5,
    "max_staff_weekend": 10,
    "required_senior_count": 3
  }'
```

### Update Display Properties
```bash
curl -X PUT /shift-types/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "short_name": "Day",
    "color_code": "#FF9800"
  }'
```

## Business Logic & Use Cases

### Display & UI
- **short_name**: Used for compact displays in schedules, calendars, and mobile apps
- **color_code**: Provides visual distinction in scheduling interfaces and reports

### Hour Management
- **total_hours**: Complete shift duration including breaks and overtime
- **normal_hours**: Standard work hours for payroll calculations
- **ot_hours**: Overtime portion for premium pay calculations

### FTE & Reporting
- **count_as_fte**: Controls whether shift is included in Full-Time Equivalent calculations
- **count_as_working_hour**: Determines inclusion in total working hours reports

### Staffing Control
- **min_staff_weekday/weekend**: Ensures adequate coverage during different periods
- **max_staff_weekday/weekend**: Prevents overstaffing and controls labor costs
- **required_senior_count**: Ensures experienced staff presence for supervision

## Migration Notes

1. **Backward Compatibility**: All new fields are optional with appropriate defaults
2. **Data Integrity**: Existing shift types will continue to function normally
3. **Performance**: Indexes added for commonly queried fields
4. **Validation**: New fields have comprehensive validation rules

## Example Shift Type Configurations

### Standard Day Shift
```json
{
  "name": "Day Shift",
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "short_name": "D",
  "color_code": "#4CAF50",
  "total_hours": 8.00,
  "normal_hours": 8.00,
  "ot_hours": 0.00,
  "min_staff_weekday": 8,
  "max_staff_weekday": 15,
  "min_staff_weekend": 5,
  "max_staff_weekend": 10,
  "required_senior_count": 2
}
```

### On-Call Shift
```json
{
  "name": "On-Call",
  "start_time": "00:00:00",
  "end_time": "23:59:59",
  "short_name": "OC",
  "color_code": "#FF5722",
  "total_hours": 0.00,
  "normal_hours": 0.00,
  "ot_hours": 0.00,
  "count_as_fte": false,
  "count_as_working_hour": false,
  "min_staff_weekday": 1,
  "max_staff_weekday": 3,
  "min_staff_weekend": 2,
  "max_staff_weekend": 4,
  "required_senior_count": 1
}
```

### Extended Shift with Overtime
```json
{
  "name": "Extended Shift",
  "start_time": "07:00:00",
  "end_time": "19:00:00",
  "short_name": "EX",
  "color_code": "#FF9800",
  "total_hours": 12.00,
  "normal_hours": 8.00,
  "ot_hours": 4.00,
  "min_staff_weekday": 4,
  "max_staff_weekday": 8,
  "min_staff_weekend": 3,
  "max_staff_weekend": 6,
  "required_senior_count": 2
}
```
