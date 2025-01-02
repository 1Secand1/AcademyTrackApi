import { Module } from '@nestjs/common';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [TeachersModule, StudentsModule],
})
export class AppModule {}
