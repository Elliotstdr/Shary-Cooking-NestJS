import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ListPropertyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const list = await this.prisma.list.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!list) {
      throw new NotFoundException('Aucune liste trouvée pour cet id');
    }

    if (list.userId !== req.user.id) {
      throw new UnauthorizedException(
        "Vous n'êtes pas le propriétaire de cette ressource",
      );
    }
    return true;
  }
}
