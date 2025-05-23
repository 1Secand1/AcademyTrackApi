/*
  Warnings:

  - A unique constraint covering the columns `[date,lessonNumber]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Schedule_date_lessonNumber_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_date_lessonNumber_key" ON "Schedule"("date", "lessonNumber");
