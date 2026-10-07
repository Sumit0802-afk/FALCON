-- Email OTP login.
-- The OTP table already exists on databases that were set up with `prisma db push`,
-- so it is only created when missing.
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id`           VARCHAR(191) NOT NULL,
  `userId`       VARCHAR(191) NOT NULL,
  `otpHash`      VARCHAR(191) NOT NULL,
  `purpose`      VARCHAR(191) NOT NULL DEFAULT 'LOGIN_MFA',
  `expiresAt`    DATETIME(3) NOT NULL,
  `attempts`     INT NOT NULL DEFAULT 0,
  `maxAttempts`  INT NOT NULL DEFAULT 5,
  `used`         BOOLEAN NOT NULL DEFAULT false,
  `lastResentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `otp_verifications_userId_purpose_idx` (`userId`, `purpose`),
  CONSTRAINT `otp_verifications_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lets expired codes be found and purged without scanning the table
CREATE INDEX `otp_verifications_expiresAt_idx` ON `otp_verifications` (`expiresAt`);
