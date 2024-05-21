import { IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class CreateListDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsJSON()
  @IsNotEmpty()
  content: string;

  @IsJSON()
  @IsNotEmpty()
  selectedRecipes: string;
}
