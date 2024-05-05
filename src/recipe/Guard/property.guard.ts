import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecipePropertyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const recipe = await this.prisma.recipe.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!recipe) {
      throw new NotFoundException('No recipe found for this id');
    }

    if (recipe.userId !== req.user.id) {
      throw new UnauthorizedException('You are not the owner of this resource');
    }
    return true;
  }
}
