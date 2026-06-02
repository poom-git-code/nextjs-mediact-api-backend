# Shift Status API Test Guide

## Quick Test Commands

### 1. Test Database Connection
```bash
# Check if the table exists
SELECT * FROM shift_statuses LIMIT 5;
```

### 2. Test API Endpoints (using curl)

#### Get all shift statuses
```bash
curl -X GET "http://localhost:3000/shift-statuses" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get active shift statuses
```bash
curl -X GET "http://localhost:3000/shift-statuses/active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create new shift status
```bash
curl -X POST "http://localhost:3000/shift-statuses" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Status",
    "description": "Test description",
    "is_active": true
  }'
```

#### Update shift status
```bash
curl -X PUT "http://localhost:3000/shift-statuses/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }'
```

#### Get shift status by ID
```bash
curl -X GET "http://localhost:3000/shift-statuses/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Delete shift status
```bash
curl -X DELETE "http://localhost:3000/shift-statuses/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Expected Responses

### Success Response Format
```json
{
  "message": "Operation successful",
  "data": {
    "id": 1,
    "name": "Status Name",
    "description": "Description",
    "is_active": true,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response Format
```json
{
  "error": "Error message description"
}
```

## Validation Tests

### Test Required Fields
```bash
curl -X POST "http://localhost:3000/shift-statuses" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```
Expected: 400 Bad Request with validation error

### Test Name Length Validation
```bash
curl -X POST "http://localhost:3000/shift-statuses" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "This is a very long name that exceeds the 50 character limit"
  }'
```
Expected: 400 Bad Request with validation error

### Test Unique Name Constraint
```bash
# Create first status
curl -X POST "http://localhost:3000/shift-statuses" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unique Test"
  }'

# Try to create another with same name
curl -X POST "http://localhost:3000/shift-statuses" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unique Test"
  }'
```
Expected: 400 Bad Request with duplicate name error

## Integration Test Checklist

- [ ] Database table created successfully
- [ ] API endpoints accessible
- [ ] Authentication working
- [ ] CRUD operations functional
- [ ] Validation working correctly
- [ ] Error handling proper
- [ ] Default data inserted
- [ ] Routes registered in app.ts
- [ ] TypeScript compilation successful
- [ ] No runtime errors

## Notes
- Replace `YOUR_TOKEN` with actual JWT token
- Update `localhost:3000` with your actual server URL
- Ensure database is running and accessible
- Run tests in order for dependent operations
