import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateListDto, EditListDto } from './dto';

@Injectable()
export class ListService {
  constructor(private prisma: PrismaService) {}

  async getLists(userId: number) {
    return this.prisma.list.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createList(userId: number, dto: CreateListDto) {
    return await this.prisma.list.create({
      data: { ...dto, userId },
    });
  }

  async shareList(listId: number, userId: number) {
    const list = await this.prisma.list.findUnique({ where: { id: listId } });

    if (!list) {
      throw new UnprocessableEntityException('La liste est introuvable');
    }

    await this.prisma.list.create({
      data: {
        name: list.name,
        content: list.content,
        selectedRecipes: list.selectedRecipes,
        userId,
      },
    });
  }

  async editList(listId: number, dto: EditListDto) {
    return await this.prisma.list.update({
      where: { id: listId },
      data: { ...dto },
    });
  }

  async deleteList(listId: number) {
    await this.prisma.list.delete({
      where: { id: listId },
    });
  }
}
