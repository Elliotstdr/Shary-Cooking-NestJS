import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetKey: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
