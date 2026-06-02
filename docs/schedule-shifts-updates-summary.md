# Schedule Shifts Model Updates - Summary

## Changes Made

### 1. Database Schema Changes
**File**: `sql/alter_schedule_shifts_table.sql`
- Added `start_time` TIME DEFAULT NULL
- Added `end_time` TIME DEFAULT NULL
- Added `total_hours` DECIMAL(5,2) DEFAULT NULL
- Added `normal_hours` DECIMAL(5,2) DEFAULT NULL
- Added `ot_hours` DECIMAL(5,2) DEFAULT NULL
- Added `is_overtime` BOOLEAN DEFAULT FALSE
- Added `is_replacement` BOOLEAN DEFAULT FALSE
- Added `replaced_employee_id` INT DEFAULT NULL
- Added `actual_check_in` DATETIME DEFAULT NULL
- Added `actual_check_out` DATETIME DEFAULT NULL
- Added `late_minutes` INT DEFAULT 0
- Added `early_leave_minutes` INT DEFAULT 0
- Added comprehensive indexes for performance optimization
- Added foreign key constraint for `replaced_employee_id`

### 2. Model Updates
**File**: `src/models/ScheduleShiftsModel.ts`
- Added 12 new field properties to the TypeScript class
- Added corresponding field definitions in Sequelize model initialization
- All fields have proper types, defaults, and comments

### 3. Validation Updates
**File**: `src/validations/scheduleShiftValidation.ts`

**createScheduleShiftSchema:**
- Added `start_time` validation (HH:mm:ss format)
- Added `end_time` validation (HH:mm:ss format)
- Added `total_hours` validation (0-24, 2 decimal places)
- Added `normal_hours` validation (0-24, 2 decimal places)
- Added `ot_hours` validation (0-24, 2 decimal places)
- Added `is_overtime` validation (boolean)
- Added `is_replacement` validation (boolean)
- Added `replaced_employee_id` validation (positive integer)
- Added `actual_check_in` validation (date format)
- Added `actual_check_out` validation (date format)
- Added `late_minutes` validation (integer ≥ 0)
- Added `early_leave_minutes` validation (integer ≥ 0)

**updateScheduleShiftSchema:**
- Added optional validation for all 12 new fields

### 4. Documentation
**Files Created:**
- `docs/schedule-shifts-api-updated.md` - Complete API documentation with new fields
- `sql/alter_schedule_shifts_table.sql` - Database migration script

## Field Categories

### Shift Time Snapshots
- **start_time**: Start time of the shift (snapshot from shift_types)
- **end_time**: End time of the shift (snapshot from shift_types)

### Hours Breakdown
- **total_hours**: Total hours of this shift
- **normal_hours**: Normal working hours (excluding OT)
- **ot_hours**: Overtime hours (if any)

### Shift Classification
- **is_overtime**: Flag indicating if this is an overtime shift
- **is_replacement**: Flag if this shift is assigned as replacement

### Replacement Tracking
- **replaced_employee_id**: Employee ID who was originally assigned this shift

### Attendance Tracking
- **actual_check_in**: Actual check-in time
- **actual_check_out**: Actual check-out time
- **late_minutes**: Number of minutes late to check in
- **early_leave_minutes**: Number of minutes left before shift end

## API Changes

### Create Schedule Shift Request
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

### Get Schedule Shift Response
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
    "status_id": 1,
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
    "remarks": "Regular shift assignment",
    "is_active": true,
    "created_by": 456,
    "updated_by": 456,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T10:30:00.000Z"
  }
}
```

## Validation Rules Summary

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

## Backward Compatibility

✅ **Fully Backward Compatible**
- All new fields are optional with appropriate defaults
- Existing API calls will continue to work without modification
- Existing database records will automatically get default values
- No breaking changes to existing functionality

## Files Modified

1. `src/models/ScheduleShiftsModel.ts` - Added 12 new field definitions
2. `src/validations/scheduleShiftValidation.ts` - Added comprehensive validation for new fields
3. `sql/alter_schedule_shifts_table.sql` - Database migration script
4. `docs/schedule-shifts-api-updated.md` - Updated API documentation

## Files Not Modified (No Changes Needed)

- `src/services/scheduleShiftService.ts` - Works with new fields automatically
- `src/controllers/scheduleShiftController.ts` - Works with new fields automatically
- `src/routes/scheduleShiftRoutes.ts` - No changes needed
- Other services that use ScheduleShiftModel - Work automatically through associations

## Business Impact

### Enhanced Shift Management
- Complete shift snapshots independent of shift type changes
- Support for overtime and replacement shift tracking
- Flexible shift hour management for various scenarios

### Improved Attendance Tracking
- Real-time attendance monitoring capabilities
- Automated lateness and early leave calculations
- Comprehensive attendance audit trail

### Better Payroll Integration
- Accurate overtime hour tracking for premium pay
- Detailed attendance data for payroll calculations
- Support for various pay calculation scenarios

### Historical Data Integrity
- Shift time snapshots maintain historical accuracy
- Replacement tracking provides complete audit trail
- Changes to shift types don't affect historical shift records

## Use Cases

### 1. Regular Shift Assignment
```json
{
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "total_hours": 9.00,
  "normal_hours": 8.00,
  "ot_hours": 1.00,
  "is_overtime": false,
  "is_replacement": false
}
```

### 2. Overtime Shift
```json
{
  "start_time": "18:00:00",
  "end_time": "22:00:00",
  "total_hours": 4.00,
  "normal_hours": 0.00,
  "ot_hours": 4.00,
  "is_overtime": true,
  "is_replacement": false
}
```

### 3. Replacement Shift
```json
{
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "total_hours": 9.00,
  "normal_hours": 8.00,
  "ot_hours": 1.00,
  "is_overtime": false,
  "is_replacement": true,
  "replaced_employee_id": 123
}
```

### 4. Attendance Tracking
```json
{
  "actual_check_in": "2025-01-15T08:15:00.000Z",
  "actual_check_out": "2025-01-15T16:45:00.000Z",
  "late_minutes": 15,
  "early_leave_minutes": 15
}
```

## Reporting Capabilities

### Overtime Analysis
- Track overtime hours by employee, department, and period
- Identify patterns in overtime usage
- Calculate overtime costs and budget impact

### Attendance Monitoring
- Real-time attendance tracking
- Lateness and early leave statistics
- Attendance compliance reporting

### Replacement Tracking
- Track shift replacements and reasons
- Identify frequently replaced employees
- Analyze replacement patterns and costs

### Payroll Integration
- Accurate hour calculations for pay
- Overtime premium calculations
- Attendance-based deductions

## Integration Points

### Time Clock Systems
- `actual_check_in` and `actual_check_out` integration
- Real-time attendance data sync
- Automated calculation of work hours

### Payroll Systems
- `normal_hours` and `ot_hours` for pay calculations
- Attendance data for payroll verification
- Overtime premium calculations

### Mobile Applications
- Check-in/check-out functionality
- Shift details with actual times
- Overtime and replacement notifications

### Reporting Dashboards
- Overtime analysis and trends
- Attendance compliance monitoring
- Replacement shift analytics

## Testing Recommendations

1. **Database Migration**: Run the SQL script to add the new columns
2. **API Testing**: Test create and update endpoints with new fields
3. **Validation Testing**: Test all field validations (especially time formats and ranges)
4. **Backward Compatibility**: Ensure existing API calls still work
5. **Default Values**: Verify that default values are applied correctly
6. **Time Zone Handling**: Test datetime fields with different time zones
7. **Foreign Key Constraints**: Test replaced_employee_id references
8. **Attendance Calculations**: Test late_minutes and early_leave_minutes calculations

## Security Considerations

1. **Data Privacy**: Ensure attendance data is properly secured
2. **Access Control**: Implement proper permissions for attendance modification
3. **Audit Trail**: Log all changes to attendance and shift data
4. **Data Validation**: Validate all time-related inputs thoroughly

## Performance Considerations

1. **Indexes**: Added indexes on frequently queried fields
2. **Query Optimization**: Consider query patterns for attendance reporting
3. **Data Archiving**: Plan for archiving old attendance data
4. **Caching**: Consider caching frequently accessed shift data

## Next Steps

1. Run the database migration script
2. Test the updated API endpoints
3. Update any frontend applications to use the new fields
4. Update any payroll systems to use the new hour calculations
5. Update any time tracking systems to use the new attendance fields
6. Update mobile applications for check-in/check-out functionality
7. Update reporting dashboards to display new shift metrics
8. Consider implementing automated attendance calculations
9. Update any third-party integrations that use shift data
10. Train users on new attendance tracking features
