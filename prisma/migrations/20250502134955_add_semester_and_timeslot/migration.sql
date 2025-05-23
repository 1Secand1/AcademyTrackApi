/*
  Warnings:

  - A unique constraint covering the columns `[teacherGroupSubjectId,date,lessonNumber]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,subjectId,semester]` on the table `TeacherGroupSubject` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "timeSlot" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "TeacherGroupSubject" ADD COLUMN     "semester" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_teacherGroupSubjectId_date_lessonNumber_key" ON "Schedule"("teacherGroupSubjectId", "date", "lessonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherGroupSubject_groupId_subjectId_semester_key" ON "TeacherGroupSubject"("groupId", "subjectId", "semester");
