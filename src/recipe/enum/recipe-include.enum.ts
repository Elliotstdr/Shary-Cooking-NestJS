import { Prisma } from '@prisma/client';

export const RECIPE_INCLUDE = {
  steps: {
    select: {
      stepIndex: true,
      description: true,
    },
  },
  ingredients: {
    select: {
      unit: true,
      quantity: true,
      label: true,
    },
  },
  savedByUsers: true,
  type: true,
  regime: true,
  postedByUser: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  },
} satisfies Prisma.RecipeInclude;
