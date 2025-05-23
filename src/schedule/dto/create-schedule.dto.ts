import { IsDate, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @IsInt()
  @IsPositive()
  teacherGroupSubjectId: number;

  @IsInt()
  @IsPositive()
  lessonNumber: number;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsInt()
  @IsPositive()
  @IsOptional()
  timeSlot?: number;
}
