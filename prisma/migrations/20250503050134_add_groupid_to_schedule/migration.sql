/*
  Warnings:

  - A unique constraint covering the columns `[groupId,date,lessonNumber]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Schedule_date_lessonNumber_key";

-- DropIndex
DROP INDEX "Schedule_teacherGroupSubjectId_date_lessonNumber_key";

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN "groupId" INTEGER;

-- Заполнить groupId на основе связи с TeacherGroupSubject
UPDATE "Schedule" s
SET "groupId" = tgs."groupId"
FROM "TeacherGroupSubject" tgs
WHERE s."teacherGroupSubjectId" = tgs."id";

-- Сделать groupId обязательным
ALTER TABLE "Schedule" ALTER COLUMN "groupId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_groupId_date_lessonNumber_key" ON "Schedule"("groupId", "date", "lessonNumber");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
