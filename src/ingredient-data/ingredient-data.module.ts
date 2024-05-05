import { Module } from '@nestjs/common';
import { IngredientDataController } from './ingredient-data.controller';

@Module({
  controllers: [IngredientDataController],
})
export class IngredientDataModule {}
