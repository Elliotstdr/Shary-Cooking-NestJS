import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { RecipeUtilities } from './recipe.utilities';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [RecipeController],
  providers: [RecipeService, RecipeUtilities],
})
export class RecipeModule {}
