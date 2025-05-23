import { ApiProperty } from '@nestjs/swagger';

export class StudentAttendanceDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Иванов Иван Иванович' })
  fullName: string;

  @ApiProperty({ example: 85 })
  attendancePercentage: number;

  @ApiProperty({ example: 15 })
  absences: number;
}

export class GroupAttendanceSummaryDto {
  @ApiProperty({ example: 87 })
  averageAttendance: number;

  @ApiProperty({ example: { '2024-05': 90 } })
  byMonth: Record<string, number>;

  @ApiProperty({ type: [StudentAttendanceDto] })
  topAbsentStudents: StudentAttendanceDto[];

  @ApiProperty({ example: 150 })
  totalLessons: number;

  @ApiProperty({ example: 130 })
  totalPresent: number;

  @ApiProperty({ example: 15 })
  totalAbsent: number;

  @ApiProperty({ example: 5 })
  totalLate: number;
} 