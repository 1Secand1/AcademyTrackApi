import { IsNumber, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsString()
  patronymic: string;

  @IsString()
  surname: string;

  @IsNumber()
  groupId: number;
}
