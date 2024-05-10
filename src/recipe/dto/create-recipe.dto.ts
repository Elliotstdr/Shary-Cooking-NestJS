import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  @IsNotEmpty()
  number: number;

  @IsNumber()
  @IsNotEmpty()
  typeId: number;

  @IsNumber()
  @IsNotEmpty()
  regimeId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DtoStep)
  steps: DtoStep[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DtoIngredient)
  ingredients: DtoIngredient[];

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  fromHellof: boolean;
}

export class DtoStep {
  @IsNumber()
  @IsNotEmpty()
  stepIndex: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class DtoIngredient {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitId: number;
}
