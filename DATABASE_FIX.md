# Department Operating Hours Database Fix

## Issue
The error occurs because there's a data type mismatch between the foreign key columns in the `department_operating_hours` table and the referenced tables:
- `department_id` was defined as `BIGINT` but `departments.id` is `INT`
- `created_by` and `updated_by` were defined as `BIGINT` but `users.id` is `INT`

## Solution
Run the following SQL script in your database to fix the issue:

```sql
-- Drop the existing table if it exists
DROP TABLE IF EXISTS department_operating_hours;

-- Create the table with correct data types
CREATE TABLE department_operating_hours (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key',
  department_id INT NOT NULL COMMENT 'Reference to departments.id',
  weekday ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun') NOT NULL COMMENT 'Day of the week',
  start_time TIME NOT NULL COMMENT 'Opening time',
  end_time TIME NOT NULL COMMENT 'Closing time',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this time slot is active',
  created_by INT DEFAULT NULL COMMENT 'User ID who created the record',
  updated_by INT DEFAULT NULL COMMENT 'User ID who last updated the record',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created timestamp',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last updated timestamp',
  
  -- Add indexes for better performance
  INDEX idx_department_id (department_id),
  INDEX idx_weekday (weekday),
  INDEX idx_is_active (is_active),
  INDEX idx_department_weekday (department_id, weekday),
  
  -- Add foreign key constraint
  CONSTRAINT fk_department_operating_hours_department_id 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  CONSTRAINT fk_department_operating_hours_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_department_operating_hours_updated_by 
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
  -- Add unique constraint to prevent duplicate operating hours for same department and weekday
  UNIQUE KEY uk_department_weekday_active (department_id, weekday, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Operating hours for each department by weekday and time range';
```

## Steps to Fix

1. **Stop your application** if it's currently running

2. **Connect to your MySQL database** using your preferred client (MySQL Workbench, phpMyAdmin, command line, etc.)

3. **Run the SQL script** above to drop and recreate the table with correct data types

4. **Restart your application** - it should now work without the foreign key constraint error

## Alternative: Skip Auto-Sync (Temporary)

If you want to avoid the auto-sync temporarily, you can modify `src/index.ts`:

```typescript
// Comment out the sync line temporarily
// sequelize.sync({ force: false })

// Or use alter: true instead of sync
sequelize.sync({ alter: true })
```

## Files Updated

The following files have been updated with the correct data types:
- `src/models/DepartmentOperatingHoursModel.ts` - Changed from BIGINT to INTEGER
- `sql/create_department_operating_hours_table.sql` - Updated SQL schema
- `sql/fix_department_operating_hours_table.sql` - New fix script

After applying the SQL fix, your Department Operating Hours API should work correctly!
