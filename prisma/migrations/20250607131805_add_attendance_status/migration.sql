/*
  Warnings:

  - The values [student,groupLeader,manager] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('teacher', 'admin');
ALTER TABLE "UserRole" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT';
