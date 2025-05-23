import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetGroupScheduleDto {
  @ApiPropertyOptional({
    description: 'Месяц в формате YYYY-MM',
    example: '2024-05',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'month must be in format YYYY-MM',
  })
  month?: string;

  @ApiPropertyOptional({
    description: 'Год в формате YYYY',
    example: '2024',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'year must be in format YYYY',
  })
  year?: string;
} 