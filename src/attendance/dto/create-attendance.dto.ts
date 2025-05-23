import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  scheduleId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;
}
