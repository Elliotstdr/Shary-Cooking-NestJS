import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecipeDto } from './dto';
import { RecipeUtilities } from './recipe.utilities';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RECIPE_INCLUDE } from './enum';

@Injectable()
export class RecipeService {
  constructor(
    private prisma: PrismaService,
    private recipeUtilities: RecipeUtilities,
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  async getRecipes() {
    return this.prisma.recipe.findMany({
      include: RECIPE_INCLUDE,
      orderBy: { id: 'asc' },
    });
  }

  async getRecipeById(recipeId: number) {
    return this.prisma.recipe.findUnique({
      where: { id: recipeId },
      include: RECIPE_INCLUDE,
    });
  }

  async createRecipe(userId: number, dto: CreateRecipeDto) {
    return await this.prisma.$transaction(async () => {
      const reqSteps = [...dto.Steps];
      const reqIngredients = [...dto.Ingredients];

      delete dto.Steps;
      delete dto.Ingredients;

      const createdRecipe = await this.prisma.recipe.create({
        data: { ...dto, userId },
        include: RECIPE_INCLUDE,
      });

      const createdSteps = await this.recipeUtilities.createSteps(
        reqSteps,
        createdRecipe.id,
      );

      const createdIngredients = await this.recipeUtilities.createIngredients(
        reqIngredients,
        createdRecipe.id,
      );

      createdRecipe.steps = createdSteps;
      createdRecipe.ingredients = createdIngredients;

      return createdRecipe;
    });
  }

  async editRecipeById(recipeId: number, dto: CreateRecipeDto) {
    await this.prisma.step.deleteMany({
      where: { recipeId: recipeId },
    });
    await this.prisma.ingredient.deleteMany({
      where: { recipeId: recipeId },
    });

    await this.recipeUtilities.createSteps(dto.Steps, recipeId);
    await this.recipeUtilities.createIngredients(dto.Ingredients, recipeId);

    delete dto.Steps;
    delete dto.Ingredients;

    return await this.prisma.recipe.update({
      where: { id: recipeId },
      data: dto,
      include: RECIPE_INCLUDE,
    });
  }

  async deleteRecipeById(recipeId: number) {
    await this.prisma.recipe.delete({
      where: { id: recipeId },
    });
  }

  async retrieveHellofRecipes(dto: { search: string }) {
    const externalTokens = await this.prisma.externalToken.findMany();

    if (externalTokens.length === 0) throw new NotFoundException();

    const token = externalTokens[0].value;
    const response = [];

    await this.httpService.axiosRef
      .get(this.config.get('HF_RECIPE_URL') + '&q=' + dto.search, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.count === 0) return;

        res.data.items.forEach((x: any) =>
          response.push({
            id: x.id,
            imagePath: this.config.get('HF_IMAGE_URL') + x.imagePath,
            name: x.name,
            prepTime: x.prepTime,
            ingredients: x.ingredients,
            steps: x.steps,
            tags: x.tags,
            yields: x.yields,
            averageRating: x.averageRating,
          }),
        );

        return response;
      })
      .catch(() => {
        return;
      });

    return response;
  }

  async deleteRecipePicture(userId: number, recipeId: number) {
    console.log(userId, recipeId);
  }

  async getTopRecipes() {
    const recipes = await this.prisma.recipe.findMany({
      include: RECIPE_INCLUDE,
    });

    return recipes
      .filter((x) => x.savedByUsers && x.savedByUsers.length > 0)
      .sort((a, b) => b.savedByUsers.length - a.savedByUsers.length)
      .slice(0, 3);
  }

  async saveRecipe(userId: number, recipeId: number) {
    try {
      await this.prisma.savedByUsers.create({
        data: {
          userId,
          recipeId,
        },
      });
    } catch (error) {}

    return this.prisma.recipe.findUnique({
      where: { id: recipeId },
      include: RECIPE_INCLUDE,
    });
  }

  async unsaveRecipe(userId: number, recipeId: number) {
    try {
      await this.prisma.savedByUsers.delete({
        where: {
          recipeId_userId: {
            userId: userId,
            recipeId: recipeId,
          },
        },
      });
    } catch (error) {}

    return this.prisma.recipe.findUnique({
      where: { id: recipeId },
      include: RECIPE_INCLUDE,
    });
  }
}