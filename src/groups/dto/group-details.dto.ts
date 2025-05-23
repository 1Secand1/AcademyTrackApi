import { ApiProperty } from '@nestjs/swagger';

export class StudentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Иванов Иван Иванович' })
  fullName: string;
}

export class SubjectDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Математика' })
  name: string;

  @ApiProperty({ example: 1 })
  semester: number;
}

export class TeacherDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Петров Петр Петрович' })
  fullName: string;

  @ApiProperty({ type: [SubjectDto] })
  subjects: SubjectDto[];

  @ApiProperty({ example: ['teacher'] })
  roles: string[];
}

export class TeachingAssignmentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  teacherId: number;

  @ApiProperty({ example: 1 })
  subjectId: number;

  @ApiProperty({ example: 1 })
  semester: number;
}

export class AttendanceStatsDto {
  @ApiProperty({ example: 85 })
  average: number;

  @ApiProperty({ example: { '2024-03': 85 } })
  byMonth: Record<string, number>;
}

export class GroupDetailsResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ПО-101' })
  code: string;

  @ApiProperty({ example: 'Программная инженерия' })
  name: string;

  @ApiProperty({ example: '09.03.01' })
  specialty: string;

  @ApiProperty({ example: 1 })
  course: number;

  @ApiProperty({ example: 2023 })
  yearOfEntry: number;

  @ApiProperty({ type: [StudentDto] })
  students: StudentDto[];

  @ApiProperty({ type: [TeacherDto] })
  teachers: TeacherDto[];

  @ApiProperty({ type: [SubjectDto] })
  subjects: SubjectDto[];

  @ApiProperty({ type: [TeachingAssignmentDto] })
  teachingAssignments: TeachingAssignmentDto[];

  @ApiProperty({ type: AttendanceStatsDto, required: false })
  attendanceStats?: AttendanceStatsDto;
} 