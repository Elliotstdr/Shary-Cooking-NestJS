import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendReportDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  image?: string;
}
