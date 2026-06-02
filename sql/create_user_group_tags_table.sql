-- สร้างตาราง user_group_tags
CREATE TABLE `user_group_tags` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key: Unique ID for each user group tag',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Name of the user group tag',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Description of the user group tag',
  `department_id` int NOT NULL COMMENT 'Reference to the department this group tag belongs to',
  `color_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Color code for UI display (e.g., #FF5733)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Group tag status: true = active, false = inactive',
  `created_by` int DEFAULT NULL COMMENT 'User ID of the creator who created this record',
  `updated_by` int DEFAULT NULL COMMENT 'User ID of the last updater who updated this record',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the group tag was created',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when the group tag was last updated',
  PRIMARY KEY (`id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_name_department` (`name`, `department_id`),
  CONSTRAINT `fk_user_group_tags_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table for user group tags by department';

-- สร้างตาราง user_group_tag_members
CREATE TABLE `user_group_tag_members` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key: Unique ID for each user group tag member',
  `user_group_tag_id` int NOT NULL COMMENT 'Reference to the user group tag',
  `user_id` int NOT NULL COMMENT 'Reference to the user',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Member status: true = active, false = inactive',
  `created_by` int DEFAULT NULL COMMENT 'User ID of the creator who created this record',
  `updated_by` int DEFAULT NULL COMMENT 'User ID of the last updater who updated this record',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the member was created',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when the member was last updated',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_group_tag_member` (`user_group_tag_id`,`user_id`),
  KEY `idx_user_group_tag_id` (`user_group_tag_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_user_group_tag_members_tag` FOREIGN KEY (`user_group_tag_id`) REFERENCES `user_group_tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_group_tag_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table for user group tag members';
