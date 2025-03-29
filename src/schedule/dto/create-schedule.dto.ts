import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  lessonNumber: number;

  @IsString()
  date: string;

  @IsNumber()
  teacherGroupSubjectId: number;
}
