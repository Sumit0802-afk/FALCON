-- CreateTable
CREATE TABLE `library_templates` (
    `id` VARCHAR(24) NOT NULL,
    `type` VARCHAR(16) NOT NULL,
    `seq` INTEGER NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `description` VARCHAR(400) NOT NULL,
    `keywords` TEXT NOT NULL,
    `category` VARCHAR(40) NOT NULL,
    `categoryName` VARCHAR(60) NOT NULL,
    `subcategory` VARCHAR(60) NOT NULL,
    `subcategoryName` VARCHAR(80) NOT NULL,
    `style` VARCHAR(32) NOT NULL,
    `styleName` VARCHAR(40) NOT NULL,
    `industry` VARCHAR(32) NOT NULL,
    `colorFamily` VARCHAR(20) NOT NULL,
    `mode` VARCHAR(8) NOT NULL,
    `orientation` VARCHAR(12) NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `sizeId` VARCHAR(24) NOT NULL,
    `sizeName` VARCHAR(40) NOT NULL,
    `slideCount` INTEGER NOT NULL DEFAULT 1,
    `aspect` VARCHAR(12) NOT NULL,
    `layout` VARCHAR(32) NOT NULL,
    `palette` VARCHAR(80) NOT NULL,
    `fonts` VARCHAR(80) NOT NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `shuffleKey` INTEGER NOT NULL,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `favoriteCount` INTEGER NOT NULL DEFAULT 0,
    `author` VARCHAR(40) NOT NULL DEFAULT 'Falcon',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `library_templates_type_shuffleKey_id_idx`(`type`, `shuffleKey`, `id`),
    INDEX `library_templates_type_category_shuffleKey_id_idx`(`type`, `category`, `shuffleKey`, `id`),
    INDEX `library_templates_type_subcategory_shuffleKey_id_idx`(`type`, `subcategory`, `shuffleKey`, `id`),
    INDEX `library_templates_type_style_shuffleKey_id_idx`(`type`, `style`, `shuffleKey`, `id`),
    INDEX `library_templates_type_colorFamily_shuffleKey_id_idx`(`type`, `colorFamily`, `shuffleKey`, `id`),
    INDEX `library_templates_type_sizeId_shuffleKey_id_idx`(`type`, `sizeId`, `shuffleKey`, `id`),
    INDEX `library_templates_type_slideCount_shuffleKey_id_idx`(`type`, `slideCount`, `shuffleKey`, `id`),
    INDEX `library_templates_type_industry_shuffleKey_id_idx`(`type`, `industry`, `shuffleKey`, `id`),
    INDEX `library_templates_type_usageCount_id_idx`(`type`, `usageCount`, `id`),
    INDEX `library_templates_type_isFeatured_shuffleKey_id_idx`(`type`, `isFeatured`, `shuffleKey`, `id`),
    FULLTEXT INDEX `library_templates_title_keywords_idx`(`title`, `keywords`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `library_template_favorites` (
    `userId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(24) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `library_template_favorites_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`userId`, `templateId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `library_template_favorites` ADD CONSTRAINT `library_template_favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `library_template_favorites` ADD CONSTRAINT `library_template_favorites_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `library_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
