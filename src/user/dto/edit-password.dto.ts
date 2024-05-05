import { IsString, IsNotEmpty } from 'class-validator';

export class EditPasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;
}
