import { IsArray, IsEnum, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

class StudentAttendanceUpdateDto {
  @IsInt()
  studentId: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class UpdateAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceUpdateDto)
  students: StudentAttendanceUpdateDto[];
}
