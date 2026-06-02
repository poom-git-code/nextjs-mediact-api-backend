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
  
  -- Add indexes for better performance
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_revoked (is_revoked),
  INDEX idx_user_active (user_id, is_revoked),
  
  -- Add foreign key constraint
  CONSTRAINT fk_refresh_tokens_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
  -- Add unique constraint on token
  UNIQUE KEY uk_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table for storing refresh tokens';
