import { ApiProperty } from '@nestjs/swagger';

export class StudentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Иванов Иван Иванович' })
  fullName: string;

  @ApiProperty({ example: 85 })
  attendancePercentage: number;
}

export class GroupStudentsResponseDto {
  @ApiProperty({ type: [StudentDto] })
  students: StudentDto[];
} 