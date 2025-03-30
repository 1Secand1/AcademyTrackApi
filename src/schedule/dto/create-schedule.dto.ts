import { IsDate, IsInt, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @IsInt()
  lessonNumber: number;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNumber()
  teacherGroupSubjectId: number;
}
