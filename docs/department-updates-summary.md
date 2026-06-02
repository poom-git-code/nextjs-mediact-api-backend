# Department, Shift Types, Schedule Master & Schedule Shifts Model Updates - Summary

## Changes Made

### 1. Department Table Updates
**File**: `sql/alter_departments_table.sql`
- Added `dayoff_duedate` INT DEFAULT 5
- Added `include_weekend` TINYINT(1) DEFAULT 1
- Added `include_holiday` TINYINT(1) DEFAULT 1
- Added indexes for performance optimization

### 2. Shift Types Table Updates
**File**: `sql/alter_shift_types_table.sql`
- Added `short_name` VARCHAR(50) DEFAULT NULL
- Added `color_code` VARCHAR(10) DEFAULT NULL
- Added `total_hours` DECIMAL(5,2) DEFAULT NULL
- Added `normal_hours` DECIMAL(5,2) DEFAULT NULL
- Added `ot_hours` DECIMAL(5,2) DEFAULT NULL
- Added `count_as_fte` BOOLEAN DEFAULT TRUE
- Added `count_as_working_hour` BOOLEAN DEFAULT TRUE
- Added `min_staff_weekday` INT DEFAULT NULL
- Added `max_staff_weekday` INT DEFAULT NULL
- Added `min_staff_weekend` INT DEFAULT NULL
- Added `max_staff_weekend` INT DEFAULT NULL
- Added `required_senior_count` INT DEFAULT 0
- Added comprehensive indexes for performance optimization

### 3. Schedule Master Table Updates
**File**: `sql/alter_schedule_master_table.sql`
- Added `department_name` VARCHAR(255) DEFAULT NULL
- Added `total_working_days` INT DEFAULT NULL
- Added `working_hours_per_person` DECIMAL(6,2) DEFAULT NULL
- Added `total_dayoffs` INT DEFAULT NULL
- Added `total_holidays` INT DEFAULT NULL
- Added `total_fte` DECIMAL(6,2) DEFAULT NULL
- Added `total_shifts_needed` INT DEFAULT NULL
- Added `total_working_hours_required` DECIMAL(10,2) DEFAULT NULL
- Added `total_members` INT DEFAULT NULL
- Added `total_regular_hours_available` DECIMAL(10,2) DEFAULT NULL
- Added `total_ot_hours_required` DECIMAL(10,2) DEFAULT NULL
- Added `additional_members_required` INT DEFAULT NULL
- Added comprehensive indexes for performance optimization

### 4. Schedule Shifts Table Updates
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

### 5. Model Updates
**Department Model** (`src/models/DepartmentModel.ts`):
- Added `dayoff_duedate!: number` property
- Added `include_weekend!: boolean` property 
- Added `include_holiday!: boolean` property
- Added corresponding field definitions in the Sequelize model initialization

**Shift Types Model** (`src/models/ShiftTypesModel.ts`):
- Added 12 new field properties to the TypeScript class
- Added corresponding field definitions in Sequelize model initialization
- All fields have proper types, defaults, and comments

**Schedule Master Model** (`src/models/ScheduleMasterModel.ts`):
- Added 12 new field properties to the TypeScript class
- Added corresponding field definitions in Sequelize model initialization
- All fields have proper types, defaults, and comments

**Schedule Shifts Model** (`src/models/ScheduleShiftsModel.ts`):
- Added 12 new field properties to the TypeScript class
- Added corresponding field definitions in Sequelize model initialization
- All fields have proper types, defaults, and comments

### 6. Validation Updates
**Department Validation** (`src/validations/departmentValidation.ts`):
- Added `dayoff_duedate` validation (integer, 1-30 days, default 5)
- Added `include_weekend` validation (boolean, default true)
- Added `include_holiday` validation (boolean, default true)
- Updated both create and update schemas

**Shift Types Validation** (`src/validations/shiftTypeValidation.ts`):
- Added comprehensive validation for all 12 new fields
- Added color code hex format validation
- Added hour range validations (0-24)

**Schedule Master Validation** (`src/validations/scheduleMasterValidation.ts`):
- Added comprehensive validation for all 12 new fields
- Added range validations for working days, hours, and FTE
- Added decimal precision validations

**Schedule Shifts Validation** (`src/validations/scheduleShiftValidation.ts`):
- Added comprehensive validation for all 12 new fields
- Added time format validations (HH:mm:ss)
- Added hour range validations (0-24)
- Added datetime validations for check-in/out times
- Added staffing requirement validations
- Updated both create and update schemas

### 7. Documentation
**Files Created:**
- `docs/department-api-updated.md` - Complete department API documentation
- `docs/shift-types-api-updated.md` - Complete shift types API documentation
- `docs/shift-types-updates-summary.md` - Detailed shift types changes summary
- `docs/schedule-master-api-updated.md` - Complete schedule master API documentation
- `docs/schedule-master-updates-summary.md` - Detailed schedule master changes summary
- `docs/schedule-shifts-api-updated.md` - Complete schedule shifts API documentation
- `docs/schedule-shifts-updates-summary.md` - Detailed schedule shifts changes summary
- `sql/alter_departments_table.sql` - Department database migration script
- `sql/alter_shift_types_table.sql` - Shift types database migration script
- `sql/alter_schedule_master_table.sql` - Schedule master database migration script
- `sql/alter_schedule_shifts_table.sql` - Schedule shifts database migration script

## Field Specifications

### Department Fields

#### dayoff_duedate
- **Purpose**: Controls how many days in advance employees must submit day-off requests
- **Type**: Integer
- **Range**: 1-30 days
- **Default**: 5 days
- **Usage**: Used by HR and scheduling systems to enforce request deadlines

#### include_weekend
- **Purpose**: Indicates whether the department operates on weekends
- **Type**: Boolean
- **Default**: true (department operates on weekends)
- **Usage**: Used by scheduling systems to determine if weekend shifts are applicable

#### include_holiday
- **Purpose**: Indicates whether the department operates on holidays
- **Type**: Boolean  
- **Default**: true (department operates on holidays)
- **Usage**: Used by scheduling systems to determine if holiday shifts are applicable

### Shift Types Fields

#### Display & UI Fields
- **short_name**: VARCHAR(50) - Abbreviated name or label (e.g., "M", "E", "N")
- **color_code**: VARCHAR(10) - Color code for UI display (e.g., "#FF5733")

#### Hour Management Fields
- **total_hours**: DECIMAL(5,2) - Total working hours of the shift (including OT)
- **normal_hours**: DECIMAL(5,2) - Regular working hours (excluding OT)
- **ot_hours**: DECIMAL(5,2) - Overtime hours for the shift

#### Calculation Control Fields
- **count_as_fte**: BOOLEAN DEFAULT TRUE - Whether this shift counts toward FTE calculation
- **count_as_working_hour**: BOOLEAN DEFAULT TRUE - Whether this shift counts toward total working hours

#### Staffing Requirement Fields
- **min_staff_weekday**: INT - Minimum staff required on normal weekdays
- **max_staff_weekday**: INT - Maximum staff allowed on normal weekdays
- **min_staff_weekend**: INT - Minimum staff required on weekends/holidays
- **max_staff_weekend**: INT - Maximum staff allowed on weekends/holidays
- **required_senior_count**: INT DEFAULT 0 - Number of senior staff required in this shift

### Schedule Master Fields

#### Department Information
- **department_name**: VARCHAR(255) - Name of the department for redundancy/reporting

#### Working Days & Time Management
- **total_working_days**: INT - Total number of working days in the month
- **working_hours_per_person**: DECIMAL(6,2) - Planned working hours per person in this month
- **total_dayoffs**: INT - Total number of day-offs for the month (days not scheduled)
- **total_holidays**: INT - Total number of official holidays in the month

#### Workforce Planning
- **total_fte**: DECIMAL(6,2) - Total calculated FTE for the schedule
- **total_shifts_needed**: INT - Total number of shifts needed for the department in the month
- **total_working_hours_required**: DECIMAL(10,2) - Total working hours required for the department in the month

#### Staff Analysis
- **total_members**: INT - Total number of assigned staff in the department
- **total_regular_hours_available**: DECIMAL(10,2) - Sum of normal hours all members can contribute
- **total_ot_hours_required**: DECIMAL(10,2) - Estimated overtime hours needed to cover gap
- **additional_members_required**: INT - Estimated number of extra members needed to meet coverage

### Schedule Shifts Fields

#### Shift Time Snapshots
- **start_time**: TIME - Start time of the shift (snapshot from shift_types)
- **end_time**: TIME - End time of the shift (snapshot from shift_types)

#### Hours Breakdown
- **total_hours**: DECIMAL(5,2) - Total hours of this shift
- **normal_hours**: DECIMAL(5,2) - Normal working hours (excluding OT)
- **ot_hours**: DECIMAL(5,2) - Overtime hours (if any)

#### Shift Classification
- **is_overtime**: BOOLEAN DEFAULT FALSE - Flag indicating if this is an overtime shift
- **is_replacement**: BOOLEAN DEFAULT FALSE - Flag if this shift is assigned as replacement

#### Replacement Tracking
- **replaced_employee_id**: INT - Employee ID who was originally assigned this shift

#### Attendance Tracking
- **actual_check_in**: DATETIME - Actual check-in time
- **actual_check_out**: DATETIME - Actual check-out time
- **late_minutes**: INT DEFAULT 0 - Number of minutes late to check in
- **early_leave_minutes**: INT DEFAULT 0 - Number of minutes left before shift end

## API Changes

### Create Department Request
```json
{
  "name": "IT Department",
  "type_id": 1,
  "dayoff_duedate": 7,        // NEW: Optional, default 5
  "include_weekend": true,    // NEW: Optional, default true
  "include_holiday": false    // NEW: Optional, default true
}
```

### Update Department Request
```json
{
  "dayoff_duedate": 10,       // NEW: Optional
  "include_weekend": false,   // NEW: Optional
  "include_holiday": true     // NEW: Optional
}
```

### Get Department Response
```json
{
  "department": {
    "id": 1,
    "name": "IT Department",
    "type_id": 1,
    "facility_id": 1,
    "parent_department_id": null,
    "dayoff_duedate": 7,        // NEW
    "include_weekend": true,    // NEW
    "include_holiday": false,   // NEW
    "is_active": true,
    "created_by": 123,
    "updated_by": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

## Backward Compatibility

✅ **Fully Backward Compatible**
- All new fields have default values
- Existing API calls will continue to work without modification
- Existing database records will automatically get default values
- No breaking changes to existing functionality

## Files Modified

### Department Updates
1. `src/models/DepartmentModel.ts` - Added 3 new field definitions
2. `src/validations/departmentValidation.ts` - Added validation for new fields
3. `sql/alter_departments_table.sql` - Database migration script
4. `docs/department-api-updated.md` - Updated API documentation

### Shift Types Updates
1. `src/models/ShiftTypesModel.ts` - Added 12 new field definitions
2. `src/validations/shiftTypeValidation.ts` - Added comprehensive validation for new fields
3. `sql/alter_shift_types_table.sql` - Database migration script
4. `docs/shift-types-api-updated.md` - Updated API documentation
5. `docs/shift-types-updates-summary.md` - Detailed changes summary

### Schedule Master Updates
1. `src/models/ScheduleMasterModel.ts` - Added 12 new field definitions
2. `src/validations/scheduleMasterValidation.ts` - Added comprehensive validation for new fields
3. `sql/alter_schedule_master_table.sql` - Database migration script
4. `docs/schedule-master-api-updated.md` - Updated API documentation
5. `docs/schedule-master-updates-summary.md` - Detailed changes summary

### Schedule Shifts Updates
1. `src/models/ScheduleShiftsModel.ts` - Added 12 new field definitions
2. `src/validations/scheduleShiftValidation.ts` - Added comprehensive validation for new fields
3. `sql/alter_schedule_shifts_table.sql` - Database migration script
4. `docs/schedule-shifts-api-updated.md` - Updated API documentation
5. `docs/schedule-shifts-updates-summary.md` - Detailed changes summary

## Files Not Modified (No Changes Needed)

### Department
- `src/services/departmentService.ts` - Works with new fields automatically
- `src/controllers/departmentController.ts` - Works with new fields automatically
- `src/routes/departmentRoutes.ts` - No changes needed
- Other services that use DepartmentModel - Work automatically through associations

### Shift Types
- `src/services/shiftTypeService.ts` - Works with new fields automatically
- `src/controllers/shiftTypeController.ts` - Works with new fields automatically
- `src/routes/shiftTypeRoutes.ts` - No changes needed
- Other services that use ShiftTypeModel - Work automatically through associations

### Schedule Master
- `src/services/scheduleMasterService.ts` - Works with new fields automatically
- `src/controllers/scheduleMasterController.ts` - Works with new fields automatically
- `src/routes/scheduleMasterRoutes.ts` - No changes needed
- Other services that use ScheduleMasterModel - Work automatically through associations

### Schedule Shifts
- `src/services/scheduleShiftService.ts` - Works with new fields automatically
- `src/controllers/scheduleShiftController.ts` - Works with new fields automatically
- `src/routes/scheduleShiftRoutes.ts` - No changes needed
- Other services that use ScheduleShiftModel - Work automatically through associations

## Testing Recommendations

1. **Database Migration**: Run all four SQL scripts to add the new columns
2. **API Testing**: Test create and update endpoints with new fields for all models
3. **Validation Testing**: Test field validation (especially department dayoff_duedate range, shift type color codes, time formats, and datetime validations)
4. **Backward Compatibility**: Ensure existing API calls still work for all models
5. **Default Values**: Verify that default values are applied correctly
6. **Integration Testing**: Test how new fields work with scheduling, HR, and payroll systems
7. **Attendance Tracking**: Test check-in/check-out functionality and time calculations
8. **Overtime Management**: Test overtime shift creation and tracking
9. **Replacement Tracking**: Test replacement shift assignment and audit trail

## Next Steps

1. Run all four database migration scripts in order
2. Test the updated API endpoints for all models
3. Update any frontend applications to use the new fields
4. Update any documentation or API specifications used by other teams
5. Consider updating any scheduling, HR, or payroll systems to use the new fields
6. Update UI components to display shift type colors and short names
7. Update reporting systems to use new FTE and working hour calculations
8. Update mobile applications for attendance check-in/check-out functionality
9. Update workforce planning systems to use new schedule master analytics
10. Update time tracking systems to use new attendance data
11. Update payroll systems to use new overtime and attendance calculations
12. Train users on new attendance tracking and overtime management features

## Overall Impact

### Enhanced Scheduling
- Complete workforce planning with FTE and hour calculations
- Visual shift identification with colors and short names
- Flexible shift hour management for various scenarios
- Comprehensive attendance tracking and monitoring

### Improved Analytics
- Department-wise scheduling analytics
- Overtime analysis and cost tracking
- Attendance compliance monitoring
- Workforce optimization insights

### Better Integration
- Payroll system integration with accurate hour tracking
- Time clock system integration with attendance data
- Mobile app integration for check-in/check-out
- Reporting dashboard integration with comprehensive metrics

### Historical Accuracy
- Shift time snapshots maintain historical records
- Replacement tracking provides complete audit trail
- Changes to definitions don't affect historical data
- Comprehensive change tracking across all entities
