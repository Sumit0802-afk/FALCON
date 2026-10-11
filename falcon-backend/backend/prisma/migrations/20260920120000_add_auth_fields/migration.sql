-- Add auth fields to users table
ALTER TABLE `users`
  ADD COLUMN `role`         VARCHAR(191) NOT NULL DEFAULT 'user'  AFTER `passwordHash`,
  ADD COLUMN `isVerified`   BOOLEAN      NOT NULL DEFAULT FALSE    AFTER `role`,
  ADD COLUMN `profileImage` VARCHAR(191)          DEFAULT NULL     AFTER `isVerified`,
  ADD COLUMN `lastLogin`    DATETIME(3)           DEFAULT NULL     AFTER `profileImage`;
