# Schedule Shift Summary API Test Guide

## Quick Test Commands

### 1. Test Database Connection
```bash
# Check if the table exists
SELECT * FROM schedule_shift_summary LIMIT 5;

# Verify foreign key constraints
SHOW CREATE TABLE schedule_shift_summary;
```

### 2. Test API Endpoints (using curl)

#### Create a new summary
```bash
curl -X POST "http://localhost:3000/schedule-shift-summaries" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": 30,
    "total_hours": 240.00,
    "total_normal_hours": 240.00,
    "total_ot_hours": 0.00,
    "total_employees": 10
  }'
```

#### Get all summaries
```bash
curl -X GET "http://localhost:3000/schedule-shift-summaries" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get summaries with filtering
```bash
curl -X GET "http://localhost:3000/schedule-shift-summaries?department_id=1&is_active=true&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get summary by ID
```bash
curl -X GET "http://localhost:3000/schedule-shift-summaries/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update a summary
```bash
curl -X PUT "http://localhost:3000/schedule-shift-summaries/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "total_shifts": 35,
    "total_hours": 280.00,
    "total_normal_hours": 240.00,
    "total_ot_hours": 40.00,
    "total_employees": 12
  }'
```

#### Get summaries by department
```bash
curl -X GET "http://localhost:3000/schedule-shift-summaries/department/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get summaries by schedule master
```bash
curl -X GET "http://localhost:3000/schedule-shift-summaries/schedule-master/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get active summaries only
```bash
curl -X GET "http://localhost:3000/schedule-shift-summaries/active/list" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get summary statistics
```bash
curl -X GET "http://localhost:3000/schedule-shift-summaries/stats/overview?department_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Bulk update summaries
```bash
curl -X PATCH "http://localhost:3000/schedule-shift-summaries/bulk-update" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary_ids": [1, 2, 3],
    "updates": {
      "is_active": false
    }
  }'
```

#### Upsert (create or update) summary
```bash
curl -X POST "http://localhost:3000/schedule-shift-summaries/upsert" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 2,
    "total_shifts": 25,
    "total_hours": 200.00,
    "total_normal_hours": 180.00,
    "total_ot_hours": 20.00,
    "total_employees": 8
  }'
```

#### Soft delete summary
```bash
curl -X PATCH "http://localhost:3000/schedule-shift-summaries/1/soft-delete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Delete summary
```bash
curl -X DELETE "http://localhost:3000/schedule-shift-summaries/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Expected Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": {
    "id": 1,
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": 30,
    "total_hours": "240.00",
    "total_normal_hours": "240.00",
    "total_ot_hours": "0.00",
    "total_employees": 10,
    "is_active": true,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### List Response with Pagination
```json
{
  "message": "Schedule Shift Summaries retrieved successfully",
  "data": [
    {
      "id": 1,
      "schedule_master_id": 1,
      "department_id": 1,
      "shift_type_id": 1,
      "total_shifts": 30,
      "total_hours": "240.00",
      "total_normal_hours": "240.00",
      "total_ot_hours": "0.00",
      "total_employees": 10,
      "is_active": true,
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "totalPages": 1,
    "limit": 100,
    "offset": 0
  }
}
```

### Statistics Response
```json
{
  "message": "Schedule Shift Summary statistics retrieved successfully",
  "data": {
    "totalShifts": 120,
    "totalHours": 960.00,
    "totalNormalHours": 800.00,
    "totalOtHours": 160.00,
    "totalEmployees": 45,
    "recordCount": 4
  }
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## Validation Tests

### Test Required Fields
```bash
curl -X POST "http://localhost:3000/schedule-shift-summaries" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```
Expected: 400 Bad Request with validation error

### Test Hour Validation (total_hours ≠ normal_hours + ot_hours)
```bash
curl -X POST "http://localhost:3000/schedule-shift-summaries" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": 30,
    "total_hours": 300.00,
    "total_normal_hours": 240.00,
    "total_ot_hours": 40.00
  }'
```
Expected: 400 Bad Request with hour validation error

### Test Negative Values
```bash
curl -X POST "http://localhost:3000/schedule-shift-summaries" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": -5,
    "total_hours": -100.00
  }'
```
Expected: 400 Bad Request with validation error

### Test Unique Constraint
```bash
# Create first summary
curl -X POST "http://localhost:3000/schedule-shift-summaries" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": 30,
    "total_hours": 240.00,
    "total_normal_hours": 240.00,
    "total_ot_hours": 0.00
  }'

# Try to create another with same schedule_master_id and shift_type_id
curl -X POST "http://localhost:3000/schedule-shift-summaries" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_master_id": 1,
    "department_id": 1,
    "shift_type_id": 1,
    "total_shifts": 25,
    "total_hours": 200.00,
    "total_normal_hours": 200.00,
    "total_ot_hours": 0.00
  }'
```
Expected: 400 Bad Request with duplicate key error

## Integration Test Checklist

### Database
- [ ] Table created successfully
- [ ] Foreign key constraints working
- [ ] Unique constraint enforced
- [ ] Indexes created
- [ ] Sample data inserted

### API Endpoints
- [ ] All CRUD operations working
- [ ] Authentication required
- [ ] Validation working correctly
- [ ] Error handling proper
- [ ] Response formats consistent

### Business Logic
- [ ] Hour calculations validated
- [ ] Soft delete working
- [ ] Bulk operations functional
- [ ] Statistics accurate
- [ ] Upsert logic correct

### Performance
- [ ] Query performance acceptable
- [ ] Pagination working
- [ ] Filtering efficient
- [ ] Bulk operations fast
- [ ] Statistics calculation quick

## Test Data Setup

### Prerequisites
1. Valid schedule_master record
2. Valid department record
3. Valid shift_type record
4. Valid user record for authentication

### Sample Data
```sql
-- Assuming these records exist
INSERT INTO schedule_shift_summary (
    schedule_master_id, department_id, shift_type_id, 
    total_shifts, total_hours, total_normal_hours, total_ot_hours, 
    total_employees, is_active, created_by, updated_by
) VALUES 
(1, 1, 1, 30, 240.00, 240.00, 0.00, 10, TRUE, 1, 1),
(1, 1, 2, 30, 240.00, 240.00, 0.00, 8, TRUE, 1, 1),
(1, 2, 1, 25, 200.00, 180.00, 20.00, 12, TRUE, 1, 1);
```

## Notes
- Replace `YOUR_TOKEN` with actual JWT token
- Update `localhost:3000` with your actual server URL
- Ensure database is running and accessible
- Run tests in logical order for dependent operations
- Monitor response times for performance
- Check database logs for any errors
