import { IsInt, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeachingAssignmentDto {
  @ApiProperty({ description: 'ID преподавателя' })
  @IsInt()
  @IsPositive()
  teacherId: number;

  @ApiProperty({ description: 'ID группы' })
  @IsInt()
  @IsPositive()
  groupId: number;

  @ApiProperty({ description: 'ID предмета' })
  @IsInt()
  @IsPositive()
  subjectId: number;

  @ApiPropertyOptional({ description: 'Семестр (1 или 2)', default: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  semester?: number;
}
