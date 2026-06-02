# Refresh Tokens Database Fix

## Issue
The error occurs because MySQL cannot create an index on a TEXT column without specifying a key length:

```
Error: BLOB/TEXT column 'token' used in key specification without a key length
```

## Solution
The issue has been fixed by:

1. **Changed token field**: From `TEXT` to `VARCHAR(500)` in the model
2. **Removed problematic index**: Removed the token index from the Sequelize model definition
3. **Updated SQL script**: Changed to use `VARCHAR(500)` instead of `TEXT`

## Files Updated

1. **`src/models/RefreshTokenModel.ts`**
   - Changed `DataTypes.TEXT` to `DataTypes.STRING(500)`
   - Removed token index from indexes array

2. **`sql/create_refresh_tokens_table.sql`**
   - Changed `token TEXT` to `token VARCHAR(500)`
   - Updated index definition

3. **`sql/fix_refresh_tokens_table.sql`** (New)
   - Script to drop and recreate the table with correct structure

## Steps to Fix

### Option 1: Manual SQL Fix (Recommended)

1. **Stop your application** if it's currently running

2. **Connect to your MySQL database** using your preferred client

3. **Run the fix script**:
   ```sql
   DROP TABLE IF EXISTS refresh_tokens;
   
   CREATE TABLE refresh_tokens (
     id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key',
     user_id INT NOT NULL COMMENT 'Reference to users.id',
     token VARCHAR(500) NOT NULL COMMENT 'Refresh token string',
     expires_at DATETIME NOT NULL COMMENT 'Token expiration date',
     is_revoked BOOLEAN DEFAULT FALSE COMMENT 'Whether the token has been revoked',
     device_info VARCHAR(500) DEFAULT NULL COMMENT 'Device information (User-Agent)',
     ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP address when token was created',
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created timestamp',
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated timestamp',
     
     INDEX idx_user_id (user_id),
     INDEX idx_token (token),
     INDEX idx_expires_at (expires_at),
     INDEX idx_is_revoked (is_revoked),
     INDEX idx_user_active (user_id, is_revoked),
     
     CONSTRAINT fk_refresh_tokens_user_id 
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
       
     UNIQUE KEY uk_token (token)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table for storing refresh tokens';
   ```

4. **Restart your application** - it should now work without the indexing error

### Option 2: Use SQL Script File

Run the fix script:
```bash
mysql -u your_username -p your_database < sql/fix_refresh_tokens_table.sql
```

## Token Length Considerations

- **VARCHAR(500)** should be sufficient for JWT tokens
- Typical JWT refresh tokens are 200-300 characters
- If you need longer tokens, you can increase the length to `VARCHAR(1000)` or use `TEXT` but remove the index

## Why This Fix Works

1. **VARCHAR vs TEXT**: VARCHAR columns can be fully indexed, while TEXT columns need length specification
2. **Removed Model Index**: Sequelize was trying to create an index on TEXT without length specification
3. **SQL-Level Indexing**: The index is now created at the SQL level with proper column type

## Testing

After applying the fix, test the refresh token functionality:

1. **Login**: Should return both access and refresh tokens
2. **Refresh Token**: Should work with `/auth/refresh-token` endpoint
3. **Token Storage**: Tokens should be stored in the database
4. **Token Revocation**: Should work with logout and revoke endpoints

The refresh token system should now work correctly without database errors!
