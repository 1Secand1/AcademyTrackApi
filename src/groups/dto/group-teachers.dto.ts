import { ApiProperty } from '@nestjs/swagger';

export class GroupTeacherSubjectDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Математика' })
  name: string;

  @ApiProperty({ example: 1 })
  semester: number;
}

export class GroupTeacherDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Соколов Мария Петровна' })
  fullName: string;

  @ApiProperty({ type: [GroupTeacherSubjectDto] })
  subjects: GroupTeacherSubjectDto[];
}

export class GroupTeachersResponseDto {
  @ApiProperty({ type: [GroupTeacherDto] })
  teachers: GroupTeacherDto[];
} 