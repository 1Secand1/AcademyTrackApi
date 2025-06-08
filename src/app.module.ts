import { Module } from '@nestjs/common';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { GroupsModule } from './groups/groups.module';
import { SubjectModule } from './subject/subject.module';
import { TeachingAssignmentsModule } from './teaching-assignments/teaching-assignments.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    AuthModule,
    TeachersModule,
    StudentsModule,
    GroupsModule,
    SubjectModule,
    TeachingAssignmentsModule,
    ScheduleModule,
    AttendanceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
