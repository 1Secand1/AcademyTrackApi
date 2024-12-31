import { Module } from '@nestjs/common';
import { TeachersModule } from './teachers/teachers.module';

@Module({
  imports: [TeachersModule],
})
export class AppModule {}
