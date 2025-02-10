import { Module } from '@nestjs/common';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [TeachersModule, StudentsModule, GroupsModule],
})
export class AppModule {}
