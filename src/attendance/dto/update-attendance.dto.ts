import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAttendanceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  scheduleId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;
}
