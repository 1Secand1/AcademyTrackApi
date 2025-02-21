import { IsNumber, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  groupCode: string;

  @IsNumber()
  yearOfEntry: number;
}
