-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "teacherGroupSubjectId" INTEGER NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_teacherGroupSubjectId_fkey" FOREIGN KEY ("teacherGroupSubjectId") REFERENCES "TeacherGroupSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
