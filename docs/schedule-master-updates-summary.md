# Schedule Master Model Updates - Summary

## Changes Made

### 1. Database Schema Changes
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

### 2. Model Updates
**File**: `src/models/ScheduleMasterModel.ts`
- Added 12 new field properties to the TypeScript class
- Added corresponding field definitions in Sequelize model initialization
- All fields have proper types, defaults, and comments

### 3. Validation Updates
**File**: `src/validations/scheduleMasterValidation.ts`

**createScheduleMasterSchema:**
- Added `department_name` validation (max 255 chars)
- Added `total_working_days` validation (0-31)
- Added `working_hours_per_person` validation (0-744, 2 decimal places)
- Added `total_dayoffs` validation (0-31)
- Added `total_holidays` validation (0-31)
- Added `total_fte` validation (0-9999, 2 decimal places)
- Added `total_shifts_needed` validation (integer ≥ 0)
- Added `total_working_hours_required` validation (≥ 0, 2 decimal places)
- Added `total_members` validation (integer ≥ 0)
- Added `total_regular_hours_available` validation (≥ 0, 2 decimal places)
- Added `total_ot_hours_required` validation (≥ 0, 2 decimal places)
- Added `additional_members_required` validation (integer ≥ 0)

**updateScheduleMasterSchema:**
- Added optional validation for all 12 new fields

### 4. Documentation
**Files Created:**
- `docs/schedule-master-api-updated.md` - Complete API documentation with new fields
- `sql/alter_schedule_master_table.sql` - Database migration script

## Field Categories

### Department Information
- **department_name**: Name of the department for redundancy/reporting

### Working Days & Time Management
- **total_working_days**: Total number of working days in the month
- **working_hours_per_person**: Planned working hours per person in this month
- **total_dayoffs**: Total number of day-offs for the month (days not scheduled)
- **total_holidays**: Total number of official holidays in the month

### Workforce Planning
- **total_fte**: Total calculated FTE for the schedule
- **total_shifts_needed**: Total number of shifts needed for the department in the month
- **total_working_hours_required**: Total working hours required for the department in the month

### Staff Analysis
- **total_members**: Total number of assigned staff in the department
- **total_regular_hours_available**: Sum of normal hours all members can contribute
- **total_ot_hours_required**: Estimated overtime hours needed to cover gap
- **additional_members_required**: Estimated number of extra members needed to meet coverage

## API Changes

### Create Schedule Master Request
```json
{
  "department_id": 1,
  "facility_id": 1,
  "date": "2025-01-01",
  "month": 1,
  "year": 2025,
  "status_id": 1,
  "department_name": "Emergency Department",        // NEW
  "total_working_days": 22,                         // NEW
  "working_hours_per_person": 168.00,               // NEW
  "total_dayoffs": 8,                               // NEW
  "total_holidays": 1,                              // NEW
  "total_fte": 12.50,                               // NEW
  "total_shifts_needed": 66,                        // NEW
  "total_working_hours_required": 1584.00,          // NEW
  "total_members": 15,                              // NEW
  "total_regular_hours_available": 1320.00,         // NEW
  "total_ot_hours_required": 264.00,                // NEW
  "additional_members_required": 2                  // NEW
}
```

### Get Schedule Master Response
```json
{
  "scheduleMaster": {
    "id": 1,
    "department_id": 1,
    "facility_id": 1,
    "date": "2025-01-01",
    "month": 1,
    "year": 2025,
    "status_id": 1,
    "department_name": "Emergency Department",        // NEW
    "total_working_days": 22,                         // NEW
    "working_hours_per_person": 168.00,               // NEW
    "total_dayoffs": 8,                               // NEW
    "total_holidays": 1,                              // NEW
    "total_fte": 12.50,                               // NEW
    "total_shifts_needed": 66,                        // NEW
    "total_working_hours_required": 1584.00,          // NEW
    "total_members": 15,                              // NEW
    "total_regular_hours_available": 1320.00,         // NEW
    "total_ot_hours_required": 264.00,                // NEW
    "additional_members_required": 2,                 // NEW
    "is_active": true,
    "created_by": 123,
    "updated_by": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

## Validation Rules Summary

| Field | Type | Range/Format | Default | Required |
|-------|------|--------------|---------|----------|
| department_name | String | Max 255 chars | NULL | No |
| total_working_days | Integer | 0-31 | NULL | No |
| working_hours_per_person | Decimal | 0-744, 2 decimal places | NULL | No |
| total_dayoffs | Integer | 0-31 | NULL | No |
| total_holidays | Integer | 0-31 | NULL | No |
| total_fte | Decimal | 0-9999, 2 decimal places | NULL | No |
| total_shifts_needed | Integer | ≥ 0 | NULL | No |
| total_working_hours_required | Decimal | ≥ 0, 2 decimal places | NULL | No |
| total_members | Integer | ≥ 0 | NULL | No |
| total_regular_hours_available | Decimal | ≥ 0, 2 decimal places | NULL | No |
| total_ot_hours_required | Decimal | ≥ 0, 2 decimal places | NULL | No |
| additional_members_required | Integer | ≥ 0 | NULL | No |

## Backward Compatibility

✅ **Fully Backward Compatible**
- All new fields are optional with NULL defaults
- Existing API calls will continue to work without modification
- Existing database records will automatically get default values
- No breaking changes to existing functionality

## Files Modified

1. `src/models/ScheduleMasterModel.ts` - Added 12 new field definitions
2. `src/validations/scheduleMasterValidation.ts` - Added comprehensive validation for new fields
3. `sql/alter_schedule_master_table.sql` - Database migration script
4. `docs/schedule-master-api-updated.md` - Updated API documentation

## Files Not Modified (No Changes Needed)

- `src/services/scheduleMasterService.ts` - Works with new fields automatically
- `src/controllers/scheduleMasterController.ts` - Works with new fields automatically
- `src/routes/scheduleMasterRoutes.ts` - No changes needed
- Other services that use ScheduleMasterModel - Work automatically through associations

## Business Impact

### Enhanced Workforce Planning
- Comprehensive FTE calculations for budgeting
- Overtime tracking and optimization
- Staff requirement analysis and planning

### Improved Scheduling Analytics
- Working days vs. holidays vs. dayoffs analysis
- Coverage gap identification
- Resource utilization tracking

### Better Reporting Capabilities
- Department-wise workforce metrics
- Monthly planning and forecasting
- Cost analysis and budget planning

### HR & Payroll Integration
- Accurate overtime calculations
- Staff requirement forecasting
- Budget allocation optimization

## Calculation Workflows

### FTE Calculation
```
total_fte = total_working_hours_required / working_hours_per_person
```

### Overtime Requirement
```
total_ot_hours_required = total_working_hours_required - total_regular_hours_available
```

### Additional Staff Needed
```
additional_members_required = Math.ceil(total_ot_hours_required / working_hours_per_person)
```

### Coverage Analysis
```
coverage_percentage = (total_regular_hours_available / total_working_hours_required) * 100
```

## Testing Recommendations

1. **Database Migration**: Run the SQL script to add the new columns
2. **API Testing**: Test create and update endpoints with new fields
3. **Validation Testing**: Test all field validations (especially ranges and decimal places)
4. **Backward Compatibility**: Ensure existing API calls still work
5. **Default Values**: Verify that default values are applied correctly
6. **Calculation Logic**: Test workforce calculation formulas
7. **Reporting Integration**: Test new fields in reporting queries

## Next Steps

1. Run the database migration script
2. Test the updated API endpoints
3. Update any workforce planning applications to use the new fields
4. Update any HR systems to use the new workforce analytics
5. Update any payroll systems to use the new overtime calculations
6. Update reporting dashboards to display new workforce metrics
7. Update scheduling systems to use the new planning data
8. Consider implementing automated calculation workflows for the new fields
