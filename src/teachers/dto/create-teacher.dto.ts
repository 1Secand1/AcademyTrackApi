import { IsNumber, IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  patronymic: string;

  @IsString()
  surname: string;

  @IsString()
  login: string;

  @IsString()
  password: string;
}
