# Backend Login Role Validation

## Changes Made

### 1. AuthService (src/services/authService.ts)
Added role validation in the `backEndLoginUser` function:

```typescript
// Check if user has required role (1 or 28) for backend access
const userRoles = Array.isArray(user.user_role) ? user.user_role : [user.user_role];
const hasRequiredRole = userRoles.some((userRole: any) => {
  const roleId = userRole?.role?.id;
  return roleId === 1 || roleId === 28;
});

if (!hasRequiredRole) {
  throw new Error("Access denied: Insufficient permissions for backend access");
}
```

### 2. AuthController (src/controllers/authController.ts)
Enhanced error handling to return 403 status for permission errors:

```typescript
// Handle role permission errors with specific status code
if (error instanceof Error && error.message.includes("Access denied")) {
  ctx.status = 403;
  ctx.body = { error: error.message };
} else {
  // ... existing error handling
}
```

## Behavior

### Allowed Users
- Users with role_id = 1 (typically Admin)
- Users with role_id = 28 (typically Supervisor or specific backend role)

### Error Responses

**403 Forbidden (Insufficient permissions):**
```json
{
  "error": "Access denied: Insufficient permissions for backend access"
}
```

**400 Bad Request (Invalid credentials):**
```json
{
  "error": "Invalid email or password"
}
```

### Testing

To test the role validation:

1. **Valid backend user** (role_id 1 or 28):
   ```bash
   curl -X POST /backoffice/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "password123"}'
   ```

2. **Invalid role user** (any other role_id):
   ```bash
   curl -X POST /backoffice/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'
   ```
   Should return 403 error.

## Security Notes

- The validation happens after password verification to avoid timing attacks
- Users without the required roles cannot access backend functionality
- The error message clearly indicates insufficient permissions
- Role validation is server-side and cannot be bypassed from client-side
