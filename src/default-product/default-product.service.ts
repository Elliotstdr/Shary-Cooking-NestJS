import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { DefaultProductDto } from './dto';

@Injectable()
export class DefaultProductService {
  constructor(private prisma: PrismaService) {}

  async getDefaultProduct(userId: number) {
    return this.prisma.defaultProduct.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createDefaultProduct(userId: number, dto: DefaultProductDto) {
    return await this.prisma.defaultProduct.create({
      data: { ...dto, userId },
    });
  }

  async deleteDefaultProduct(listId: number) {
    await this.prisma.defaultProduct.delete({
      where: { id: listId },
    });
  }
}
