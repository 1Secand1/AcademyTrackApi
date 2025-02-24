import { Module } from '@nestjs/common';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { GroupsModule } from './groups/groups.module';
import { SubjectModule } from './subject/subject.module';

@Module({
  imports: [TeachersModule, StudentsModule, GroupsModule, SubjectModule],
})
export class AppModule {}
