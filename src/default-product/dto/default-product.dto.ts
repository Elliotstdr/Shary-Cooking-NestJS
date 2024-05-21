import { IsNotEmpty, IsString } from 'class-validator';

export class DefaultProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
