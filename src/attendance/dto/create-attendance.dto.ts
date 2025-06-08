import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE'
}

export class StudentAttendanceDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  studentId: number;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class CreateAttendanceDto {
  @ApiProperty({ example: 132 })
  @IsInt()
  scheduleId: number;

  @ApiProperty({ type: [StudentAttendanceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  students: StudentAttendanceDto[];
}
