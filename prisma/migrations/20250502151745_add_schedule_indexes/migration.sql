-- CreateIndex
CREATE INDEX "Schedule_teacherGroupSubjectId_idx" ON "Schedule"("teacherGroupSubjectId");

-- CreateIndex
CREATE INDEX "TeacherGroupSubject_groupId_idx" ON "TeacherGroupSubject"("groupId");

-- CreateIndex
CREATE INDEX "TeacherGroupSubject_teacherId_idx" ON "TeacherGroupSubject"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherGroupSubject_subjectId_idx" ON "TeacherGroupSubject"("subjectId");
