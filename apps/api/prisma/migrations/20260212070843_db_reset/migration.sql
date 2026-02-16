/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sortOrder` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "MaterialStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('ARTICLE', 'VIDEO', 'EXTERNAL', 'MINI_COURSE');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedListItems" (
    "id" TEXT NOT NULL,
    "featuredListId" TEXT NOT NULL,
    "learningMaterialId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedListItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningMaterial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "thumbnailUrl" TEXT,
    "status" "MaterialStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "MaterialType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "primaryCategoryId" TEXT NOT NULL,
    "tags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialContent" (
    "materialId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialContent_pkey" PRIMARY KEY ("materialId")
);

-- CreateTable
CREATE TABLE "MaterialTopic" (
    "materialId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "MaterialTopic_pkey" PRIMARY KEY ("materialId","topicId")
);

-- CreateTable
CREATE TABLE "MaterialCollection" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialCollectionItem" (
    "collectionId" TEXT NOT NULL,
    "childMaterialId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "MaterialCollectionItem_pkey" PRIMARY KEY ("collectionId","childMaterialId")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentInterest" (
    "studentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentInterest_pkey" PRIMARY KEY ("studentId","topicId")
);

-- CreateTable
CREATE TABLE "StudentSavedMaterial" (
    "studentId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentSavedMaterial_pkey" PRIMARY KEY ("studentId","materialId")
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "studentId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progressPct" INTEGER NOT NULL DEFAULT 0,
    "lastPositionSec" INTEGER,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentProgress_pkey" PRIMARY KEY ("studentId","materialId")
);

-- CreateTable
CREATE TABLE "StudentRecentView" (
    "studentId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRecentView_pkey" PRIMARY KEY ("studentId","materialId")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedList_slug_key" ON "FeaturedList"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LearningMaterial_slug_key" ON "LearningMaterial"("slug");

-- CreateIndex
CREATE INDEX "LearningMaterial_primaryCategoryId_idx" ON "LearningMaterial"("primaryCategoryId");

-- CreateIndex
CREATE INDEX "LearningMaterial_status_idx" ON "LearningMaterial"("status");

-- CreateIndex
CREATE INDEX "LearningMaterial_type_idx" ON "LearningMaterial"("type");

-- CreateIndex
CREATE INDEX "LearningMaterial_difficulty_idx" ON "LearningMaterial"("difficulty");

-- CreateIndex
CREATE INDEX "MaterialTopic_topicId_idx" ON "MaterialTopic"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialCollection_materialId_key" ON "MaterialCollection"("materialId");

-- CreateIndex
CREATE INDEX "MaterialCollectionItem_childMaterialId_idx" ON "MaterialCollectionItem"("childMaterialId");

-- CreateIndex
CREATE INDEX "MaterialCollectionItem_collectionId_idx" ON "MaterialCollectionItem"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialCollectionItem_collectionId_sortOrder_key" ON "MaterialCollectionItem"("collectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Student_externalUserId_key" ON "Student"("externalUserId");

-- CreateIndex
CREATE INDEX "StudentInterest_topicId_idx" ON "StudentInterest"("topicId");

-- CreateIndex
CREATE INDEX "StudentSavedMaterial_materialId_idx" ON "StudentSavedMaterial"("materialId");

-- CreateIndex
CREATE INDEX "StudentProgress_materialId_idx" ON "StudentProgress"("materialId");

-- CreateIndex
CREATE INDEX "StudentProgress_status_idx" ON "StudentProgress"("status");

-- CreateIndex
CREATE INDEX "StudentRecentView_studentId_lastViewedAt_idx" ON "StudentRecentView"("studentId", "lastViewedAt");

-- CreateIndex
CREATE INDEX "StudentRecentView_materialId_idx" ON "StudentRecentView"("materialId");

-- CreateIndex
CREATE INDEX "Topic_categoryId_idx" ON "Topic"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_categoryId_slug_key" ON "Topic"("categoryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "FeaturedListItems" ADD CONSTRAINT "FeaturedListItems_featuredListId_fkey" FOREIGN KEY ("featuredListId") REFERENCES "FeaturedList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningMaterial" ADD CONSTRAINT "LearningMaterial_primaryCategoryId_fkey" FOREIGN KEY ("primaryCategoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialContent" ADD CONSTRAINT "MaterialContent_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LearningMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialTopic" ADD CONSTRAINT "MaterialTopic_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LearningMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialTopic" ADD CONSTRAINT "MaterialTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialCollection" ADD CONSTRAINT "MaterialCollection_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LearningMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialCollectionItem" ADD CONSTRAINT "MaterialCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "MaterialCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialCollectionItem" ADD CONSTRAINT "MaterialCollectionItem_childMaterialId_fkey" FOREIGN KEY ("childMaterialId") REFERENCES "LearningMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInterest" ADD CONSTRAINT "StudentInterest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentInterest" ADD CONSTRAINT "StudentInterest_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSavedMaterial" ADD CONSTRAINT "StudentSavedMaterial_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSavedMaterial" ADD CONSTRAINT "StudentSavedMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LearningMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LearningMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRecentView" ADD CONSTRAINT "StudentRecentView_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRecentView" ADD CONSTRAINT "StudentRecentView_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "LearningMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
