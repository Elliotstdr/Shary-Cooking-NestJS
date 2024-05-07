import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('ingredient_datas')
export class IngredientDataController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getIngredientData() {
    return await this.prisma.ingredientData.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
