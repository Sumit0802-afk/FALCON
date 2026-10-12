-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileImage" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "presetName" TEXT NOT NULL,
    "background" TEXT NOT NULL DEFAULT '#FFFFFF',
    "elements" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'LOGIN_MFA',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "lastResentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "template_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "orientation" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "colorFamily" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "thumbnailUrl" TEXT,
    "previewUrl" TEXT,
    "fingerprint" TEXT NOT NULL,
    "searchDocument" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_designs" (
    "templateId" TEXT NOT NULL,
    "designData" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "assetRefs" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_designs_pkey" PRIMARY KEY ("templateId")
);

-- CreateTable
CREATE TABLE "template_tags_on_templates" (
    "templateId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "template_tags_on_templates_pkey" PRIMARY KEY ("templateId","tagId")
);

-- CreateTable
CREATE TABLE "template_favorites" (
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_favorites_pkey" PRIMARY KEY ("userId","templateId")
);

-- CreateTable
CREATE TABLE "template_import_jobs" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sourceType" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "imported" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "errorLog" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "template_import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_template_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_template_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_template_tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "email_template_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "tagList" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "width" INTEGER NOT NULL DEFAULT 600,
    "height" INTEGER NOT NULL,
    "orientation" TEXT NOT NULL DEFAULT 'portrait',
    "layoutKey" TEXT NOT NULL,
    "paletteKey" TEXT NOT NULL,
    "fontKey" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'Falcon',
    "status" TEXT NOT NULL DEFAULT 'published',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "shuffleKey" INTEGER NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_template_contents" (
    "templateId" TEXT NOT NULL,
    "templateData" TEXT NOT NULL,
    "html" TEXT,

    CONSTRAINT "email_template_contents_pkey" PRIMARY KEY ("templateId")
);

-- CreateTable
CREATE TABLE "email_template_tag_links" (
    "templateId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "email_template_tag_links_pkey" PRIMARY KEY ("templateId","tagId")
);

-- CreateTable
CREATE TABLE "email_template_favorites" (
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_template_favorites_pkey" PRIMARY KEY ("userId","templateId")
);

-- CreateTable
CREATE TABLE "user_email_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceTemplateId" TEXT,
    "templateData" TEXT NOT NULL,
    "html" TEXT,
    "thumbnailSvg" TEXT,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "width" INTEGER NOT NULL DEFAULT 600,
    "height" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_templates" (
    "id" VARCHAR(24) NOT NULL,
    "type" VARCHAR(16) NOT NULL,
    "seq" INTEGER NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" VARCHAR(400) NOT NULL,
    "keywords" TEXT NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "categoryName" VARCHAR(60) NOT NULL,
    "subcategory" VARCHAR(60) NOT NULL,
    "subcategoryName" VARCHAR(80) NOT NULL,
    "style" VARCHAR(32) NOT NULL,
    "styleName" VARCHAR(40) NOT NULL,
    "industry" VARCHAR(32) NOT NULL,
    "colorFamily" VARCHAR(20) NOT NULL,
    "mode" VARCHAR(8) NOT NULL,
    "orientation" VARCHAR(12) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sizeId" VARCHAR(24) NOT NULL,
    "sizeName" VARCHAR(40) NOT NULL,
    "slideCount" INTEGER NOT NULL DEFAULT 1,
    "aspect" VARCHAR(12) NOT NULL,
    "layout" VARCHAR(32) NOT NULL,
    "palette" VARCHAR(80) NOT NULL,
    "fonts" VARCHAR(80) NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "shuffleKey" INTEGER NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "author" VARCHAR(40) NOT NULL DEFAULT 'Falcon',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_template_favorites" (
    "userId" TEXT NOT NULL,
    "templateId" VARCHAR(24) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_template_favorites_pkey" PRIMARY KEY ("userId","templateId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- CreateIndex
CREATE INDEX "pages_projectId_idx" ON "pages"("projectId");

-- CreateIndex
CREATE INDEX "otp_verifications_userId_purpose_idx" ON "otp_verifications"("userId", "purpose");

-- CreateIndex
CREATE INDEX "otp_verifications_expiresAt_idx" ON "otp_verifications"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionTokenHash_key" ON "sessions"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "template_categories_slug_key" ON "template_categories"("slug");

-- CreateIndex
CREATE INDEX "template_categories_parentId_sortOrder_idx" ON "template_categories"("parentId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "template_tags_slug_key" ON "template_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "design_templates_slug_key" ON "design_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "design_templates_fingerprint_key" ON "design_templates"("fingerprint");

-- CreateIndex
CREATE INDEX "design_templates_status_featured_createdAt_idx" ON "design_templates"("status", "featured", "createdAt");

-- CreateIndex
CREATE INDEX "design_templates_status_usageCount_idx" ON "design_templates"("status", "usageCount");

-- CreateIndex
CREATE INDEX "design_templates_status_viewCount_idx" ON "design_templates"("status", "viewCount");

-- CreateIndex
CREATE INDEX "design_templates_categoryId_subcategoryId_status_idx" ON "design_templates"("categoryId", "subcategoryId", "status");

-- CreateIndex
CREATE INDEX "design_templates_slug_idx" ON "design_templates"("slug");

-- CreateIndex
CREATE INDEX "design_templates_style_idx" ON "design_templates"("style");

-- CreateIndex
CREATE INDEX "design_templates_industry_idx" ON "design_templates"("industry");

-- CreateIndex
CREATE INDEX "design_templates_platform_idx" ON "design_templates"("platform");

-- CreateIndex
CREATE INDEX "design_templates_orientation_width_height_idx" ON "design_templates"("orientation", "width", "height");

-- CreateIndex
CREATE INDEX "design_templates_createdAt_idx" ON "design_templates"("createdAt");

-- CreateIndex
CREATE INDEX "design_templates_publishedAt_idx" ON "design_templates"("publishedAt");

-- CreateIndex
CREATE INDEX "design_templates_featured_idx" ON "design_templates"("featured");

-- CreateIndex
CREATE INDEX "template_tags_on_templates_tagId_idx" ON "template_tags_on_templates"("tagId");

-- CreateIndex
CREATE INDEX "template_favorites_templateId_idx" ON "template_favorites"("templateId");

-- CreateIndex
CREATE INDEX "template_favorites_userId_createdAt_idx" ON "template_favorites"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "template_import_jobs_status_createdAt_idx" ON "template_import_jobs"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_template_categories_slug_key" ON "email_template_categories"("slug");

-- CreateIndex
CREATE INDEX "email_template_categories_parentId_sortOrder_idx" ON "email_template_categories"("parentId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "email_template_tags_slug_key" ON "email_template_tags"("slug");

-- CreateIndex
CREATE INDEX "email_template_tags_templateCount_idx" ON "email_template_tags"("templateCount");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_slug_key" ON "email_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_fingerprint_key" ON "email_templates"("fingerprint");

-- CreateIndex
CREATE INDEX "email_templates_status_shuffleKey_id_idx" ON "email_templates"("status", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "email_templates_status_usageCount_id_idx" ON "email_templates"("status", "usageCount", "id");

-- CreateIndex
CREATE INDEX "email_templates_status_createdAt_id_idx" ON "email_templates"("status", "createdAt", "id");

-- CreateIndex
CREATE INDEX "email_templates_status_lastUsedAt_id_idx" ON "email_templates"("status", "lastUsedAt", "id");

-- CreateIndex
CREATE INDEX "email_templates_status_isFeatured_shuffleKey_idx" ON "email_templates"("status", "isFeatured", "shuffleKey");

-- CreateIndex
CREATE INDEX "email_templates_status_isPremium_shuffleKey_idx" ON "email_templates"("status", "isPremium", "shuffleKey");

-- CreateIndex
CREATE INDEX "email_templates_categoryId_status_shuffleKey_idx" ON "email_templates"("categoryId", "status", "shuffleKey");

-- CreateIndex
CREATE INDEX "email_templates_subcategoryId_status_shuffleKey_idx" ON "email_templates"("subcategoryId", "status", "shuffleKey");

-- CreateIndex
CREATE INDEX "email_template_tag_links_tagId_idx" ON "email_template_tag_links"("tagId");

-- CreateIndex
CREATE INDEX "email_template_favorites_templateId_idx" ON "email_template_favorites"("templateId");

-- CreateIndex
CREATE INDEX "email_template_favorites_userId_createdAt_idx" ON "email_template_favorites"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_email_templates_userId_updatedAt_idx" ON "user_email_templates"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "user_email_templates_userId_sourceTemplateId_idx" ON "user_email_templates"("userId", "sourceTemplateId");

-- CreateIndex
CREATE INDEX "library_templates_type_shuffleKey_id_idx" ON "library_templates"("type", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "library_templates_type_category_shuffleKey_id_idx" ON "library_templates"("type", "category", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "library_templates_type_subcategory_shuffleKey_id_idx" ON "library_templates"("type", "subcategory", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "library_templates_type_style_shuffleKey_id_idx" ON "library_templates"("type", "style", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "library_templates_type_colorFamily_shuffleKey_id_idx" ON "library_templates"("type", "colorFamily", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "library_templates_type_sizeId_shuffleKey_id_idx" ON "library_templates"("type", "sizeId", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "library_templates_type_slideCount_shuffleKey_id_idx" ON "library_templates"("type", "slideCount", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "library_templates_type_industry_shuffleKey_id_idx" ON "library_templates"("type", "industry", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "library_templates_type_orientation_shuffleKey_id_idx" ON "library_templates"("type", "orientation", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "library_templates_type_usageCount_id_idx" ON "library_templates"("type", "usageCount", "id");

-- CreateIndex
CREATE INDEX "library_templates_type_isFeatured_shuffleKey_id_idx" ON "library_templates"("type", "isFeatured", "shuffleKey", "id");

-- CreateIndex
CREATE INDEX "library_template_favorites_userId_createdAt_idx" ON "library_template_favorites"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_categories" ADD CONSTRAINT "template_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "template_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_templates" ADD CONSTRAINT "design_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "template_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_templates" ADD CONSTRAINT "design_templates_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "template_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_designs" ADD CONSTRAINT "template_designs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "design_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_tags_on_templates" ADD CONSTRAINT "template_tags_on_templates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "design_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_tags_on_templates" ADD CONSTRAINT "template_tags_on_templates_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "template_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_favorites" ADD CONSTRAINT "template_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_favorites" ADD CONSTRAINT "template_favorites_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "design_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_template_categories" ADD CONSTRAINT "email_template_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "email_template_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "email_template_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "email_template_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_template_contents" ADD CONSTRAINT "email_template_contents_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_template_tag_links" ADD CONSTRAINT "email_template_tag_links_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_template_tag_links" ADD CONSTRAINT "email_template_tag_links_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "email_template_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_template_favorites" ADD CONSTRAINT "email_template_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_template_favorites" ADD CONSTRAINT "email_template_favorites_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_email_templates" ADD CONSTRAINT "user_email_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_template_favorites" ADD CONSTRAINT "library_template_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_template_favorites" ADD CONSTRAINT "library_template_favorites_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "library_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

