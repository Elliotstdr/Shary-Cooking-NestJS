import { Prisma } from '@prisma/client';

export const USER_SELECT = {
  id: true,
  createdAt: true,
  updatedAt: true,
  email: true,
  name: true,
  lastname: true,
  imageUrl: true,
} satisfies Prisma.UserSelect;
