-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "course" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "name" VARCHAR(100),
ADD COLUMN     "specialty" VARCHAR(50);
