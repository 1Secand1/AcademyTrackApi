import { IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  name: string;

  @IsString()
  patronymic: string;

  @IsString()
  surname: string;
}
