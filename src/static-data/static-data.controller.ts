import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('retrieveStaticData')
export class StaticDataController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getStaticData() {
    const units = await this.prisma.unit.findMany();
    const types = await this.prisma.type.findMany();
    const regimes = await this.prisma.regime.findMany();
    const ingTypes = await this.prisma.ingredientType.findMany();

    return {
      units,
      types,
      regimes,
      ingTypes,
    };
  }
}
