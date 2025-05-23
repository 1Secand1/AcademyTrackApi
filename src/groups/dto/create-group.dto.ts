import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'ПО-101' })
  @IsString()
  groupCode: string;

  @ApiProperty({ example: 'Искусственный интеллект', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '09.03.01', required: false })
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @Min(1)
  @Max(6)
  @IsOptional()
  course?: number;

  @ApiProperty({ example: 2022 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  yearOfEntry: number;
}
