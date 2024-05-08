import { IsNotEmpty, IsEmail } from 'class-validator';

export class MailResetDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
