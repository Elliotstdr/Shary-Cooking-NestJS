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
      throw new NotFoundException('Aucune recette trouvée pour cet id');
    }

    if (recipe.userId !== req.user.id) {
      throw new UnauthorizedException(
        "Vous n'êtes pas le propriétaire de cette ressource",
      );
    }
    return true;
  }
}
