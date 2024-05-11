import { PrismaService } from 'src/common/prisma/prisma.service';
import { DtoIngredient, DtoStep } from './dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RecipeUtilities {
  constructor(private prisma: PrismaService) {}

  async createSteps(reqSteps: DtoStep[], recipeId: number) {
    const newSteps = [];

    for (const x of reqSteps) {
      const item = await this.prisma.step.create({
        data: {
          ...x,
          recipeId: recipeId,
        },
      });
      newSteps.push(item);
    }

    return newSteps;
  }

  async createIngredients(reqIngredients: DtoIngredient[], recipeId: number) {
    const newIngredients = [];

    for (const x of reqIngredients) {
      const item = await this.prisma.ingredient.create({
        data: {
          ...x,
          recipeId: recipeId,
        },
        include: { unit: true },
      });
      newIngredients.push(item);
    }

    return newIngredients;
  }
}
