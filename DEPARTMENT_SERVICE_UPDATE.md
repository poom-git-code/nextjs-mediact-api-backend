# Department Service Update: Enhanced Query with Related Models

## Overview
Updated the `getPartnerDepartmentByFacility` function in `departmentService.ts` to include related models when querying departments.

## Changes Made

### 1. Added New Imports to departmentService.ts
```typescript
import DepartmentOperatingHoursModel from "../models/DepartmentOperatingHoursModel";
import DepartmentSupervisorModel from "../models/DepartmentSupervisorModel";
import ShiftTypesModel from "../models/ShiftTypesModel";
```

### 2. Updated getPartnerDepartmentByFacility Function
Enhanced the `DepartmentModel.findAll()` query to include related models:

```typescript
const departments = await DepartmentModel.findAll({
  where: { facility_id: facilityId },
  include: [
    {
      model: DepartmentOperatingHoursModel,
      as: "department_operating_hours",
      required: false,
    },
    {
      model: DepartmentSupervisorModel,
      as: "department_supervisors",
      required: false,
    },
    {
      model: ShiftTypesModel,
      as: "shift_types",
      required: false,
    },
  ],
});
```

### 3. Fixed Circular Dependency Issue
To avoid circular import issues between models, associations are now set up in a separate file:

**Created new file:** `src/models/associations.ts`
```typescript
import DepartmentModel from './DepartmentModel';
import DepartmentOperatingHoursModel from './DepartmentOperatingHoursModel';
import DepartmentSupervisorModel from './DepartmentSupervisorModel';
import ShiftTypeModel from './ShiftTypesModel';

export const setupAssociations = () => {
  // Department hasMany associations
  DepartmentModel.hasMany(DepartmentOperatingHoursModel, {
    as: 'department_operating_hours',
    foreignKey: 'department_id',
  });

  DepartmentModel.hasMany(DepartmentSupervisorModel, {
    as: 'department_supervisors',
    foreignKey: 'department_id',
  });

  DepartmentModel.hasMany(ShiftTypeModel, {
    as: 'shift_types',
    foreignKey: 'department_id',
  });

  console.log('Model associations set up successfully');
};
```

**Updated `src/index.ts`** to call `setupAssociations()` before database sync:
```typescript
import { setupAssociations } from "./models/associations";

// Setup model associations after all models are loaded
setupAssociations();
```

**Updated DepartmentModel.ts** with proper TypeScript types:
```typescript
// Type-only imports to avoid circular dependencies
import type { DepartmentOperatingHoursModel } from './DepartmentOperatingHoursModel';
import type { DepartmentSupervisorModel } from './DepartmentSupervisorModel';
import type { ShiftTypeModel } from './ShiftTypesModel';

// Related model associations with proper types
public department_operating_hours?: DepartmentOperatingHoursModel[];
public department_supervisors?: DepartmentSupervisorModel[];
public shift_types?: ShiftTypeModel[];
```

### 4. Updated DepartmentModel.ts
Added association properties without circular imports:

**New Properties:**
```typescript
// Related model associations with proper types
public department_operating_hours?: DepartmentOperatingHoursModel[];
public department_supervisors?: DepartmentSupervisorModel[];
public shift_types?: ShiftTypeModel[];
```

## Important Fix: Circular Dependency Resolution
The initial implementation caused a circular dependency error because `DepartmentModel` was importing the related models, and those models were also importing `DepartmentModel`. This has been resolved by:

1. **Separating associations** into `src/models/associations.ts`
2. **Loading associations** in `src/index.ts` after all models are loaded
3. **Using type-only imports** in DepartmentModel to get proper TypeScript types without circular dependencies

This approach ensures that:
- All models can be imported without circular dependencies
- Associations are properly established before database sync
- Full TypeScript type safety is maintained
- The application can start without errors

## Result Structure
The function now returns departments with the following structure:

```typescript
{
  id: number,
  name: string,
  facility_id: number,
  // ... other department fields
  department_operating_hours: [
    {
      id: number,
      department_id: number,
      weekday: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
      start_time: string,
      end_time: string,
      is_active: boolean,
      // ... other fields
    }
  ],
  department_supervisors: [
    {
      id: number,
      department_id: number,
      user_id: number,
      role: 'head' | 'assistant' | 'secretary',
      is_active: boolean,
      // ... other fields
    }
  ],
  shift_types: [
    {
      id: number,
      name: string,
      start_time: string,
      end_time: string,
      department_id: number,
      // ... other fields
    }
  ]
}
```

## Testing
Created test files to verify the functionality:
- `test_department_associations.js` - JavaScript version
- `test_department_associations.ts` - TypeScript version

To test the function:
1. Update the `userId` in the test file to a valid user ID from your database
2. Run the test file to verify associations are working correctly

## Notes
- All associations use `required: false` to prevent null results when related data doesn't exist
- The function maintains backward compatibility - existing code will continue to work
- TypeScript types are properly defined for better IDE support and type safety

## Files Modified
- `src/services/departmentService.ts` - Updated function and imports
- `src/models/DepartmentModel.ts` - Added association properties
- `src/models/associations.ts` - **NEW** - Centralized association setup
- `src/index.ts` - Added association setup call
- `test_department_associations.js` - Test file (JavaScript)
- `test_department_associations.ts` - Test file (TypeScript)
