# Facility Admins API - Request Bodies

## 1. Create Facility Admin (Full)
```json
{
  "facility_id": 1,
  "user_id": 5,
  "assigned_at": "2025-01-15T10:00:00Z",
  "is_active": true
}
```

## 2. Create Facility Admin (Minimal)
```json
{
  "facility_id": 1,
  "user_id": 5
}
```

## 3. Update Facility Admin (Full)
```json
{
  "facility_id": 2,
  "user_id": 6,
  "assigned_at": "2025-01-16T10:00:00Z",
  "is_active": false
}
```

## 4. Update Facility Admin (Partial - Change Facility)
```json
{
  "facility_id": 3
}
```

## 5. Update Facility Admin (Partial - Change User)
```json
{
  "user_id": 7
}
```

## 6. Update Facility Admin (Deactivate)
```json
{
  "is_active": false
}
```

## 7. Update Facility Admin (Reactivate)
```json
{
  "is_active": true,
  "assigned_at": "2025-01-20T08:00:00Z"
}
```

## 8. Update Facility Admin (Change Assignment Date)
```json
{
  "assigned_at": "2025-01-25T09:30:00Z"
}
```
