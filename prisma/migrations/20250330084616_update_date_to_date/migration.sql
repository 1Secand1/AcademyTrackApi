/*
  Warnings:

  - Changed the type of `date` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
UPDATE "Schedule"
SET "date" = '2025-01-01'
WHERE "date" IS NULL;