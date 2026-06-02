# Schedule Master API Documentation - Updated

## Overview
The Schedule Master API has been significantly enhanced with new fields for comprehensive schedule planning, workforce analysis, and resource management. This update provides detailed insights into departmental scheduling requirements and workforce optimization.

## New Fields Added

### 1. Department Information
- **department_name**: VARCHAR(255) - Name of the department for redundancy/reporting

### 2. Working Days & Time Management
- **total_working_days**: INT - Total number of working days in the month
- **working_hours_per_person**: DECIMAL(6,2) - Planned working hours per person in this month
- **total_dayoffs**: INT - Total number of day-offs for the month (days not scheduled)
- **total_holidays**: INT - Total number of official holidays in the month

### 3. Workforce Planning
- **total_fte**: DECIMAL(6,2) - Total calculated FTE for the schedule
- **total_shifts_needed**: INT - Total number of shifts needed for the department in the month
- **total_working_hours_required**: DECIMAL(10,2) - Total working hours required for the department in the month

### 4. Staff Analysis
- **total_members**: INT - Total number of assigned staff in the department
- **total_regular_hours_available**: DECIMAL(10,2) - Sum of normal hours all members can contribute
- **total_ot_hours_required**: DECIMAL(10,2) - Estimated overtime hours needed to cover gap
- **additional_members_required**: INT - Estimated number of extra members needed to meet coverage

## Updated API Endpoints

### Create Schedule Master
**POST** `/schedule-master`

**Request Body:**
```json
{
  "department_id": 1,
  "facility_id": 1,
  "date": "2025-01-01",
  "month": 1,
  "year": 2025,
  "status_id": 1,
  "department_name": "Emergency Department",
  "total_working_days": 22,
  "working_hours_per_person": 168.00,
  "total_dayoffs": 8,
  "total_holidays": 1,
  "total_fte": 12.50,
  "total_shifts_needed": 66,
  "total_working_hours_required": 1584.00,
  "total_members": 15,
  "total_regular_hours_available": 1320.00,
  "total_ot_hours_required": 264.00,
  "additional_members_required": 2
}
```

**Response:**
```json
{
  "message": "Schedule master created successfully",
  "scheduleMaster": {
    "id": 1,
    "department_id": 1,
    "facility_id": 1,
    "date": "2025-01-01",
    "month": 1,
    "year": 2025,
    "status_id": 1,
    "department_name": "Emergency Department",
    "total_working_days": 22,
    "working_hours_per_person": 168.00,
    "total_dayoffs": 8,
    "total_holidays": 1,
    "total_fte": 12.50,
    "total_shifts_needed": 66,
    "total_working_hours_required": 1584.00,
    "total_members": 15,
    "total_regular_hours_available": 1320.00,
    "total_ot_hours_required": 264.00,
    "additional_members_required": 2,
    "is_active": true,
    "created_by": 123,
    "updated_by": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### Update Schedule Master
**PUT** `/schedule-master/:id`

**Request Body (all fields optional):**
```json
{
  "department_name": "Updated Emergency Department",
  "total_working_days": 23,
  "working_hours_per_person": 176.00,
  "total_fte": 13.00,
  "total_shifts_needed": 69,
  "total_working_hours_required": 1656.00,
  "total_members": 16,
  "total_regular_hours_available": 1408.00,
  "total_ot_hours_required": 248.00,
  "additional_members_required": 1
}
```

## Validation Rules

### Department Information
- **department_name**: Max 255 characters, optional

### Working Days & Time Management
- **total_working_days**: Integer, 0-31, optional
- **working_hours_per_person**: Decimal(6,2), 0-744 hours, optional
- **total_dayoffs**: Integer, 0-31, optional
- **total_holidays**: Integer, 0-31, optional

### Workforce Planning
- **total_fte**: Decimal(6,2), 0-9999, optional
- **total_shifts_needed**: Integer ≥ 0, optional
- **total_working_hours_required**: Decimal(10,2) ≥ 0, optional

### Staff Analysis
- **total_members**: Integer ≥ 0, optional
- **total_regular_hours_available**: Decimal(10,2) ≥ 0, optional
- **total_ot_hours_required**: Decimal(10,2) ≥ 0, optional
- **additional_members_required**: Integer ≥ 0, optional

## Error Messages

### Validation Errors
```json
{
  "error": "Department name must not exceed 255 characters."
}
```

```json
{
  "error": "Total working days must not exceed 31."
}
```

```json
{
  "error": "Working hours per person must not exceed 744 (24*31)."
}
```

```json
{
  "error": "Total FTE must not exceed 9999."
}
```

```json
{
  "error": "Total members must be at least 0."
}
```

## Database Schema Update

```sql
ALTER TABLE schedule_master
  ADD COLUMN department_name VARCHAR(255) DEFAULT NULL COMMENT 'Name of the department for redundancy/reporting',
  ADD COLUMN total_working_days INT DEFAULT NULL COMMENT 'Total number of working days in the month',
  ADD COLUMN working_hours_per_person DECIMAL(6,2) DEFAULT NULL COMMENT 'Planned working hours per person in this month',
  ADD COLUMN total_dayoffs INT DEFAULT NULL COMMENT 'Total number of day-offs for the month (days not scheduled)',
  ADD COLUMN total_holidays INT DEFAULT NULL COMMENT 'Total number of official holidays in the month',
  ADD COLUMN total_fte DECIMAL(6,2) DEFAULT NULL COMMENT 'Total calculated FTE for the schedule',
  ADD COLUMN total_shifts_needed INT DEFAULT NULL COMMENT 'Total number of shifts needed for the department in the month',
  ADD COLUMN total_working_hours_required DECIMAL(10,2) DEFAULT NULL COMMENT 'Total working hours required for the department in the month',
  ADD COLUMN total_members INT DEFAULT NULL COMMENT 'Total number of assigned staff in the department',
  ADD COLUMN total_regular_hours_available DECIMAL(10,2) DEFAULT NULL COMMENT 'Sum of normal hours all members can contribute',
  ADD COLUMN total_ot_hours_required DECIMAL(10,2) DEFAULT NULL COMMENT 'Estimated overtime hours needed to cover gap',
  ADD COLUMN additional_members_required INT DEFAULT NULL COMMENT 'Estimated number of extra members needed to meet coverage';
```

## Usage Examples

### Create a Comprehensive Schedule Master
```bash
curl -X POST /schedule-master \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "department_id": 2,
    "facility_id": 1,
    "date": "2025-02-01",
    "month": 2,
    "year": 2025,
    "status_id": 1,
    "department_name": "Intensive Care Unit",
    "total_working_days": 20,
    "working_hours_per_person": 160.00,
    "total_dayoffs": 8,
    "total_holidays": 0,
    "total_fte": 18.75,
    "total_shifts_needed": 90,
    "total_working_hours_required": 2160.00,
    "total_members": 20,
    "total_regular_hours_available": 1600.00,
    "total_ot_hours_required": 560.00,
    "additional_members_required": 3
  }'
```

### Update Workforce Planning Data
```bash
curl -X PUT /schedule-master/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "total_fte": 14.00,
    "total_shifts_needed": 72,
    "total_working_hours_required": 1728.00,
    "total_members": 17,
    "total_regular_hours_available": 1496.00,
    "total_ot_hours_required": 232.00,
    "additional_members_required": 1
  }'
```

### Update Working Days and Hours
```bash
curl -X PUT /schedule-master/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "total_working_days": 21,
    "working_hours_per_person": 168.00,
    "total_dayoffs": 9,
    "total_holidays": 1
  }'
```

## Business Logic & Use Cases

### Department Information
- **department_name**: Provides redundancy and quick identification without joins

### Working Days & Time Management
- **total_working_days**: Excludes weekends and holidays based on department settings
- **working_hours_per_person**: Target hours each staff member should work
- **total_dayoffs**: Approved time off that reduces available working days
- **total_holidays**: Official holidays that affect scheduling

### Workforce Planning
- **total_fte**: Full-Time Equivalent calculation for budgeting and planning
- **total_shifts_needed**: Total shift slots that need to be filled
- **total_working_hours_required**: Total hours needed to maintain department operations

### Staff Analysis
- **total_members**: Current assigned staff count
- **total_regular_hours_available**: Normal hours available without overtime
- **total_ot_hours_required**: Overtime needed to bridge the gap
- **additional_members_required**: New hires needed to meet requirements

## Calculation Examples

### FTE Calculation
```
total_fte = total_working_hours_required / (working_hours_per_person)
```

### Overtime Requirement
```
total_ot_hours_required = total_working_hours_required - total_regular_hours_available
```

### Additional Staff Needed
```
additional_members_required = Math.ceil(total_ot_hours_required / working_hours_per_person)
```

## Report Generation Use Cases

### Workforce Gap Analysis
```json
{
  "department_name": "Emergency Department",
  "total_members": 15,
  "additional_members_required": 2,
  "total_ot_hours_required": 264.00,
  "coverage_percentage": 83.33
}
```

### Budget Planning
```json
{
  "department_name": "Emergency Department",
  "total_fte": 12.50,
  "total_regular_hours_available": 1320.00,
  "total_ot_hours_required": 264.00,
  "regular_cost": 52800.00,
  "overtime_cost": 15840.00,
  "total_cost": 68640.00
}
```

### Staffing Efficiency
```json
{
  "department_name": "Emergency Department",
  "total_working_days": 22,
  "total_dayoffs": 8,
  "total_holidays": 1,
  "effective_working_days": 21,
  "utilization_rate": 95.45
}
```

## Migration Notes

1. **Backward Compatibility**: All new fields are optional with NULL defaults
2. **Performance**: Comprehensive indexes added for reporting and analytics
3. **Data Integrity**: Validation ensures realistic values for all fields
4. **Reporting Ready**: Fields designed for common workforce analytics queries

## Integration Points

### HR Systems
- FTE calculations for budgeting
- Overtime tracking and approval
- Staff requirement planning

### Payroll Systems
- Regular hours vs overtime hours
- Department-wise cost allocation
- Monthly workforce cost analysis

### Scheduling Systems
- Gap identification and filling
- Overtime optimization
- Staff allocation planning

### Reporting Systems
- Workforce analytics dashboards
- Department performance metrics
- Resource utilization reports
