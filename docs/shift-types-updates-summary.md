# Shift Types Model Updates - Summary

## Changes Made

### 1. Database Schema Changes
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

### 2. Model Updates
**File**: `src/models/ShiftTypesModel.ts`
- Added 12 new field properties to the TypeScript class
- Added corresponding field definitions in Sequelize model initialization
- All fields have proper types, defaults, and comments

### 3. Validation Updates
**File**: `src/validations/shiftTypeValidation.ts`

**createShiftTypeSchema:**
- Added `short_name` validation (max 50 chars)
- Added `color_code` validation (hex format #RRGGBB)
- Added `total_hours` validation (0-24, 2 decimal places)
- Added `normal_hours` validation (0-24, 2 decimal places)
- Added `ot_hours` validation (0-24, 2 decimal places)
- Added `count_as_fte` validation (boolean, default true)
- Added `count_as_working_hour` validation (boolean, default true)
- Added staffing fields validation (integers ≥ 0)
- Added `required_senior_count` validation (integer ≥ 0, default 0)

**updateShiftTypeSchema:**
- Added optional validation for all 12 new fields

### 4. Documentation
**Files Created:**
- `docs/shift-types-api-updated.md` - Complete API documentation with new fields
- `sql/alter_shift_types_table.sql` - Database migration script

## Field Categories

### Display & UI Fields
- **short_name**: Compact display name for schedules and mobile apps
- **color_code**: Visual distinction in scheduling interfaces

### Hour Management Fields
- **total_hours**: Complete shift duration including breaks and OT
- **normal_hours**: Standard work hours for payroll calculations
- **ot_hours**: Overtime portion for premium pay calculations

### Calculation Control Fields
- **count_as_fte**: Include in Full-Time Equivalent calculations
- **count_as_working_hour**: Include in total working hours reports

### Staffing Requirement Fields
- **min_staff_weekday**: Minimum staff required on normal weekdays
- **max_staff_weekday**: Maximum staff allowed on normal weekdays
- **min_staff_weekend**: Minimum staff required on weekends/holidays
- **max_staff_weekend**: Maximum staff allowed on weekends/holidays
- **required_senior_count**: Number of senior staff required in this shift

## API Changes

### Create Shift Type Request
```json
{
  "name": "Morning Shift",
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "roles_allowed": "nurse,doctor,admin",
  "short_name": "M",                    // NEW
  "color_code": "#4CAF50",              // NEW
  "total_hours": 9.00,                  // NEW
  "normal_hours": 8.00,                 // NEW
  "ot_hours": 1.00,                     // NEW
  "count_as_fte": true,                 // NEW
  "count_as_working_hour": true,        // NEW
  "min_staff_weekday": 5,               // NEW
  "max_staff_weekday": 10,              // NEW
  "min_staff_weekend": 3,               // NEW
  "max_staff_weekend": 8,               // NEW
  "required_senior_count": 2            // NEW
}
```

### Get Shift Type Response
```json
{
  "shiftType": {
    "id": 1,
    "name": "Morning Shift",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "roles_allowed": "nurse,doctor,admin",
    "short_name": "M",                    // NEW
    "color_code": "#4CAF50",              // NEW
    "total_hours": 9.00,                  // NEW
    "normal_hours": 8.00,                 // NEW
    "ot_hours": 1.00,                     // NEW
    "count_as_fte": true,                 // NEW
    "count_as_working_hour": true,        // NEW
    "min_staff_weekday": 5,               // NEW
    "max_staff_weekday": 10,              // NEW
    "min_staff_weekend": 3,               // NEW
    "max_staff_weekend": 8,               // NEW
    "required_senior_count": 2,           // NEW
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
| short_name | String | Max 50 chars | NULL | No |
| color_code | String | Hex format (#RRGGBB) | NULL | No |
| total_hours | Decimal | 0-24, 2 decimal places | NULL | No |
| normal_hours | Decimal | 0-24, 2 decimal places | NULL | No |
| ot_hours | Decimal | 0-24, 2 decimal places | NULL | No |
| count_as_fte | Boolean | true/false | TRUE | No |
| count_as_working_hour | Boolean | true/false | TRUE | No |
| min_staff_weekday | Integer | ≥ 0 | NULL | No |
| max_staff_weekday | Integer | ≥ 0 | NULL | No |
| min_staff_weekend | Integer | ≥ 0 | NULL | No |
| max_staff_weekend | Integer | ≥ 0 | NULL | No |
| required_senior_count | Integer | ≥ 0 | 0 | No |

## Backward Compatibility

✅ **Fully Backward Compatible**
- All new fields are optional with appropriate defaults
- Existing API calls will continue to work without modification
- Existing database records will automatically get default values
- No breaking changes to existing functionality

## Files Modified

1. `src/models/ShiftTypesModel.ts` - Added 12 new field definitions
2. `src/validations/shiftTypeValidation.ts` - Added comprehensive validation for new fields
3. `sql/alter_shift_types_table.sql` - Database migration script
4. `docs/shift-types-api-updated.md` - Updated API documentation

## Files Not Modified (No Changes Needed)

- `src/services/shiftTypeService.ts` - Works with new fields automatically
- `src/controllers/shiftTypeController.ts` - Works with new fields automatically
- `src/routes/shiftTypeRoutes.ts` - No changes needed
- Other services that use ShiftTypeModel - Work automatically through associations

## Business Impact

### Enhanced Scheduling
- Visual shift identification with colors and short names
- Precise hour tracking for payroll and compliance
- Flexible staffing requirements for different scenarios

### Improved Reporting
- FTE calculations with configurable shift inclusion
- Working hour reports with granular control
- Staffing analytics with min/max requirements

### Better User Experience
- Color-coded shift displays in UI
- Compact shift names for mobile interfaces
- Clear staffing expectations and requirements

## Testing Recommendations

1. **Database Migration**: Run the SQL script to add the new columns
2. **API Testing**: Test create and update endpoints with new fields
3. **Validation Testing**: Test all field validations (especially color code format and hour ranges)
4. **Backward Compatibility**: Ensure existing API calls still work
5. **Default Values**: Verify that default values are applied correctly
6. **UI Integration**: Test color codes and short names in scheduling interfaces

## Next Steps

1. Run the database migration script
2. Test the updated API endpoints
3. Update any frontend scheduling applications to use the new fields
4. Update any payroll systems to use the new hour calculations
5. Consider updating any staffing management systems to use the new requirements
6. Update scheduling UI to display colors and short names
7. Update reporting systems to use FTE and working hour flags
