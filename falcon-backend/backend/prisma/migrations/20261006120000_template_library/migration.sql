-- Scalable Falcon template library (50k–100k capable)

CREATE TABLE `template_categories` (
  `id`          VARCHAR(191) NOT NULL,
  `slug`        VARCHAR(191) NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `parentId`    VARCHAR(191) NULL,
  `sortOrder`   INT NOT NULL DEFAULT 0,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `template_categories_slug_key` (`slug`),
  KEY `template_categories_parentId_sortOrder_idx` (`parentId`, `sortOrder`),
  CONSTRAINT `template_categories_parentId_fkey`
    FOREIGN KEY (`parentId`) REFERENCES `template_categories` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `template_tags` (
  `id`   VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `template_tags_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `design_templates` (
  `id`             VARCHAR(191) NOT NULL,
  `slug`           VARCHAR(191) NOT NULL,
  `name`           VARCHAR(191) NOT NULL,
  `description`    TEXT NOT NULL,
  `status`         VARCHAR(191) NOT NULL DEFAULT 'draft',
  `featured`       BOOLEAN NOT NULL DEFAULT false,
  `categoryId`     VARCHAR(191) NOT NULL,
  `subcategoryId`  VARCHAR(191) NOT NULL,
  `style`          VARCHAR(191) NOT NULL,
  `industry`       VARCHAR(191) NOT NULL,
  `audience`       VARCHAR(191) NOT NULL,
  `platform`       VARCHAR(191) NOT NULL,
  `orientation`    VARCHAR(191) NOT NULL,
  `width`          INT NOT NULL,
  `height`         INT NOT NULL,
  `colorFamily`    VARCHAR(191) NOT NULL,
  `theme`          VARCHAR(191) NOT NULL,
  `language`       VARCHAR(191) NOT NULL DEFAULT 'en',
  `thumbnailUrl`   TEXT NULL,
  `previewUrl`     TEXT NULL,
  `fingerprint`    VARCHAR(191) NOT NULL,
  `searchDocument` TEXT NOT NULL,
  `usageCount`     INT NOT NULL DEFAULT 0,
  `favoriteCount`  INT NOT NULL DEFAULT 0,
  `viewCount`      INT NOT NULL DEFAULT 0,
  `lastUsedAt`     DATETIME(3) NULL,
  `publishedAt`    DATETIME(3) NULL,
  `createdAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `design_templates_slug_key` (`slug`),
  UNIQUE KEY `design_templates_fingerprint_key` (`fingerprint`),
  KEY `design_templates_status_featured_createdAt_idx` (`status`, `featured`, `createdAt`),
  KEY `design_templates_status_usageCount_idx` (`status`, `usageCount`),
  KEY `design_templates_status_viewCount_idx` (`status`, `viewCount`),
  KEY `design_templates_categoryId_subcategoryId_status_idx` (`categoryId`, `subcategoryId`, `status`),
  KEY `design_templates_style_idx` (`style`),
  KEY `design_templates_industry_idx` (`industry`),
  KEY `design_templates_platform_idx` (`platform`),
  KEY `design_templates_orientation_width_height_idx` (`orientation`, `width`, `height`),
  KEY `design_templates_createdAt_idx` (`createdAt`),
  KEY `design_templates_publishedAt_idx` (`publishedAt`),
  KEY `design_templates_featured_idx` (`featured`),
  CONSTRAINT `design_templates_categoryId_fkey`
    FOREIGN KEY (`categoryId`) REFERENCES `template_categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `design_templates_subcategoryId_fkey`
    FOREIGN KEY (`subcategoryId`) REFERENCES `template_categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE FULLTEXT INDEX `design_templates_search_fulltext`
  ON `design_templates` (`name`, `description`, `searchDocument`);

CREATE TABLE `template_designs` (
  `templateId`    VARCHAR(191) NOT NULL,
  `designData`    LONGTEXT NOT NULL,
  `schemaVersion` INT NOT NULL DEFAULT 1,
  `assetRefs`     TEXT NOT NULL,
  `updatedAt`     DATETIME(3) NOT NULL,
  PRIMARY KEY (`templateId`),
  CONSTRAINT `template_designs_templateId_fkey`
    FOREIGN KEY (`templateId`) REFERENCES `design_templates` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `template_tags_on_templates` (
  `templateId` VARCHAR(191) NOT NULL,
  `tagId`      VARCHAR(191) NOT NULL,
  PRIMARY KEY (`templateId`, `tagId`),
  KEY `template_tags_on_templates_tagId_idx` (`tagId`),
  CONSTRAINT `template_tags_on_templates_templateId_fkey`
    FOREIGN KEY (`templateId`) REFERENCES `design_templates` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `template_tags_on_templates_tagId_fkey`
    FOREIGN KEY (`tagId`) REFERENCES `template_tags` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `template_favorites` (
  `userId`     VARCHAR(191) NOT NULL,
  `templateId` VARCHAR(191) NOT NULL,
  `createdAt`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`userId`, `templateId`),
  KEY `template_favorites_templateId_idx` (`templateId`),
  KEY `template_favorites_userId_createdAt_idx` (`userId`, `createdAt`),
  CONSTRAINT `template_favorites_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `template_favorites_templateId_fkey`
    FOREIGN KEY (`templateId`) REFERENCES `design_templates` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `template_import_jobs` (
  `id`          VARCHAR(191) NOT NULL,
  `status`      VARCHAR(191) NOT NULL DEFAULT 'pending',
  `sourceType`  VARCHAR(191) NOT NULL,
  `total`       INT NOT NULL DEFAULT 0,
  `processed`   INT NOT NULL DEFAULT 0,
  `imported`    INT NOT NULL DEFAULT 0,
  `skipped`     INT NOT NULL DEFAULT 0,
  `failed`      INT NOT NULL DEFAULT 0,
  `errorLog`    LONGTEXT NOT NULL,
  `createdById` VARCHAR(191) NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL,
  `completedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `template_import_jobs_status_createdAt_idx` (`status`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
