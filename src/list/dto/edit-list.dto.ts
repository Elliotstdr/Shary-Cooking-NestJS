import { IsJSON, IsOptional, IsString } from 'class-validator';

export class EditListDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsJSON()
  @IsOptional()
  content: string;

  @IsJSON()
  @IsOptional()
  selectedRecipes: string;
}
