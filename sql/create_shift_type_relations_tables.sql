-- สร้างตาราง shift_type_roles (many-to-many relationship ระหว่าง shift_types และ roles)
CREATE TABLE `shift_type_roles` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key: Unique ID for each shift type role',
  `shift_type_id` int NOT NULL COMMENT 'Reference to the shift type',
  `role_id` int NOT NULL COMMENT 'Reference to the role',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Role assignment status: true = active, false = inactive',
  `created_by` int DEFAULT NULL COMMENT 'User ID of the creator who created this record',
  `updated_by` int DEFAULT NULL COMMENT 'User ID of the last updater who updated this record',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the record was created',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when the record was last updated',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_shift_type_role` (`shift_type_id`,`role_id`),
  KEY `idx_shift_type_id` (`shift_type_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_shift_type_roles_shift_type` FOREIGN KEY (`shift_type_id`) REFERENCES `shift_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_shift_type_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table for shift type role assignments';

-- สร้างตาราง shift_type_group_tags (many-to-many relationship ระหว่าง shift_types และ user_group_tags)
CREATE TABLE `shift_type_group_tags` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key: Unique ID for each shift type group tag',
  `shift_type_id` int NOT NULL COMMENT 'Reference to the shift type',
  `user_group_tag_id` int NOT NULL COMMENT 'Reference to the user group tag',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Group tag assignment status: true = active, false = inactive',
  `created_by` int DEFAULT NULL COMMENT 'User ID of the creator who created this record',
  `updated_by` int DEFAULT NULL COMMENT 'User ID of the last updater who updated this record',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the record was created',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when the record was last updated',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_shift_type_group_tag` (`shift_type_id`,`user_group_tag_id`),
  KEY `idx_shift_type_id` (`shift_type_id`),
  KEY `idx_user_group_tag_id` (`user_group_tag_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_shift_type_group_tags_shift_type` FOREIGN KEY (`shift_type_id`) REFERENCES `shift_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_shift_type_group_tags_group_tag` FOREIGN KEY (`user_group_tag_id`) REFERENCES `user_group_tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table for shift type group tag assignments';
