-- Email template library: catalog, documents, tags, favorites, and user-owned email designs

-- CreateTable
CREATE TABLE `email_template_categories` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `parentId` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `email_template_categories_slug_key`(`slug`),
    INDEX `email_template_categories_parentId_sortOrder_idx`(`parentId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_template_tags` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `templateCount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `email_template_tags_slug_key`(`slug`),
    INDEX `email_template_tags_templateCount_idx`(`templateCount`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_templates` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `subcategoryId` VARCHAR(191) NOT NULL,
    `tagList` TEXT NOT NULL,
    `keywords` TEXT NOT NULL,
    `schemaVersion` INTEGER NOT NULL DEFAULT 1,
    `width` INTEGER NOT NULL DEFAULT 600,
    `height` INTEGER NOT NULL,
    `orientation` VARCHAR(191) NOT NULL DEFAULT 'portrait',
    `layoutKey` VARCHAR(191) NOT NULL,
    `paletteKey` VARCHAR(191) NOT NULL,
    `fontKey` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,
    `authorName` VARCHAR(191) NOT NULL DEFAULT 'Falcon',
    `status` VARCHAR(191) NOT NULL DEFAULT 'published',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isPremium` BOOLEAN NOT NULL DEFAULT false,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `favoriteCount` INTEGER NOT NULL DEFAULT 0,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `lastUsedAt` DATETIME(3) NULL,
    `shuffleKey` INTEGER NOT NULL,
    `fingerprint` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `email_templates_slug_key`(`slug`),
    UNIQUE INDEX `email_templates_fingerprint_key`(`fingerprint`),
    INDEX `email_templates_status_shuffleKey_id_idx`(`status`, `shuffleKey`, `id`),
    INDEX `email_templates_status_usageCount_id_idx`(`status`, `usageCount`, `id`),
    INDEX `email_templates_status_createdAt_id_idx`(`status`, `createdAt`, `id`),
    INDEX `email_templates_status_lastUsedAt_id_idx`(`status`, `lastUsedAt`, `id`),
    INDEX `email_templates_status_isFeatured_shuffleKey_idx`(`status`, `isFeatured`, `shuffleKey`),
    INDEX `email_templates_status_isPremium_shuffleKey_idx`(`status`, `isPremium`, `shuffleKey`),
    INDEX `email_templates_categoryId_status_shuffleKey_idx`(`categoryId`, `status`, `shuffleKey`),
    INDEX `email_templates_subcategoryId_status_shuffleKey_idx`(`subcategoryId`, `status`, `shuffleKey`),
    FULLTEXT INDEX `email_templates_title_description_keywords_idx`(`title`, `description`, `keywords`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_template_contents` (
    `templateId` VARCHAR(191) NOT NULL,
    `templateData` LONGTEXT NOT NULL,
    `html` LONGTEXT NULL,

    PRIMARY KEY (`templateId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_template_tag_links` (
    `templateId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    INDEX `email_template_tag_links_tagId_idx`(`tagId`),
    PRIMARY KEY (`templateId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_template_favorites` (
    `userId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_template_favorites_templateId_idx`(`templateId`),
    INDEX `email_template_favorites_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`userId`, `templateId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_email_templates` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sourceTemplateId` VARCHAR(191) NULL,
    `templateData` LONGTEXT NOT NULL,
    `html` LONGTEXT NULL,
    `thumbnailSvg` MEDIUMTEXT NULL,
    `schemaVersion` INTEGER NOT NULL DEFAULT 1,
    `width` INTEGER NOT NULL DEFAULT 600,
    `height` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `user_email_templates_userId_updatedAt_idx`(`userId`, `updatedAt`),
    INDEX `user_email_templates_userId_sourceTemplateId_idx`(`userId`, `sourceTemplateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `email_template_categories` ADD CONSTRAINT `email_template_categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `email_template_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_templates` ADD CONSTRAINT `email_templates_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `email_template_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_templates` ADD CONSTRAINT `email_templates_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `email_template_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_template_contents` ADD CONSTRAINT `email_template_contents_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `email_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_template_tag_links` ADD CONSTRAINT `email_template_tag_links_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `email_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_template_tag_links` ADD CONSTRAINT `email_template_tag_links_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `email_template_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_template_favorites` ADD CONSTRAINT `email_template_favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_template_favorites` ADD CONSTRAINT `email_template_favorites_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `email_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_email_templates` ADD CONSTRAINT `user_email_templates_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

