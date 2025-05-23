-- Delete all attendance records
DELETE FROM "Attendance";

-- Remove the status field
ALTER TABLE "Attendance" DROP COLUMN "status";

-- Drop the enum type
DROP TYPE "AttendanceStatus"; 