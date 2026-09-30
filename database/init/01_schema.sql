-- Falcon database schema for MySQL 8+
-- Mirrors backend/prisma/schema.prisma exactly. If you use `npm run prisma:migrate`
-- in falcon-backend, Prisma will create these same tables for you — this file is
-- for quick manual bootstrap, review, or environments without the Prisma CLI.

CREATE DATABASE IF NOT EXISTS `falcon`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `falcon`;

-- -----------------------------------------------------
-- users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`            VARCHAR(36)   NOT NULL,
  `name`          VARCHAR(191)  NOT NULL,
  `email`         VARCHAR(191)  NOT NULL,
  `passwordHash`  VARCHAR(191)  NOT NULL,
  `createdAt`     DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     DATETIME(3)   NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- projects
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id`            VARCHAR(36)   NOT NULL,
  `title`         VARCHAR(191)  NOT NULL,
  `thumbnailUrl`  TEXT          NULL,
  `ownerId`       VARCHAR(36)   NOT NULL,
  `createdAt`     DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     DATETIME(3)   NOT NULL,
  PRIMARY KEY (`id`),
  KEY `projects_ownerId_idx` (`ownerId`),
  CONSTRAINT `projects_ownerId_fkey`
    FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- pages
-- `elements` stores a JSON array of CanvasElement objects — see
-- backend/models/element.model.ts for the exact TypeScript shape.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pages` (
  `id`          VARCHAR(36)   NOT NULL,
  `name`        VARCHAR(191)  NOT NULL,
  `width`       INT           NOT NULL,
  `height`      INT           NOT NULL,
  `presetName`  VARCHAR(191)  NOT NULL,
  `background`  VARCHAR(32)   NOT NULL DEFAULT '#FFFFFF',
  `elements`    JSON          NOT NULL,
  `order`       INT           NOT NULL DEFAULT 0,
  `projectId`   VARCHAR(36)   NOT NULL,
  `createdAt`   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)   NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pages_projectId_idx` (`projectId`),
  CONSTRAINT `pages_projectId_fkey`
    FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
