import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('retrieveStaticData')
export class StaticDataController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getStaticData() {
    const unit = await this.prisma.unit.findMany();
    const type = await this.prisma.type.findMany();
    const regime = await this.prisma.regime.findMany();
    const ingredientType = await this.prisma.ingredientType.findMany();

    return {
      unit,
      type,
      regime,
      ingredientType,
    };
  }
}
