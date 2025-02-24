import { IsInt, IsPositive } from 'class-validator';

export class CreateTeachingAssignmentDto {
  @IsInt()
  @IsPositive()
  teacherId: number;

  @IsInt()
  @IsPositive()
  groupId: number;

  @IsInt()
  @IsPositive()
  subjectId: number;
}
