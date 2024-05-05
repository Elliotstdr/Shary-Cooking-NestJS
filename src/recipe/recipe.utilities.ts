import { PrismaService } from 'src/prisma/prisma.service';
import { DtoIngredient, DtoStep } from './dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RecipeUtilities {
  constructor(private prisma: PrismaService) {}

  async createSteps(reqSteps: DtoStep[], recipeId: number) {
    return await Promise.all(
      reqSteps.map((step) =>
        this.prisma.step.create({
          data: {
            ...step,
            recipeId: recipeId,
          },
        }),
      ),
    );
  }

  async createIngredients(reqIngredients: DtoIngredient[], recipeId: number) {
    return await Promise.all(
      reqIngredients.map((ingredient) =>
        this.prisma.ingredient.create({
          data: {
            ...ingredient,
            recipeId: recipeId,
          },
          include: { unit: true },
        }),
      ),
    );
  }

  async getResponseRecipe(recipeId: number) {
    return this.prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { Step: true, Ingredient: true, SavedByUsers: true },
    });
  }
}
