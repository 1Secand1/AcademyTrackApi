import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsNumber, IsString } from 'class-validator';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  patronymic: string;

  @IsString()
  surname: string;
}
