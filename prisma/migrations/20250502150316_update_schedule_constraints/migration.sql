/*
  Warnings:

  - You are about to drop the column `groupId` on the `Schedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_groupId_fkey";

-- DropIndex
DROP INDEX "Schedule_groupId_date_lessonNumber_key";

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "groupId";

-- CreateIndex
CREATE INDEX "Schedule_date_lessonNumber_idx" ON "Schedule"("date", "lessonNumber");
