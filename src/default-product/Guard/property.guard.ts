import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class DefaultProductPropertyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const defaultProduct = await this.prisma.defaultProduct.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!defaultProduct) {
      throw new UnprocessableEntityException(
        'Aucune produit trouvé pour cet id',
      );
    }

    if (defaultProduct.userId !== req.user.id) {
      throw new UnauthorizedException(
        "Vous n'êtes pas le propriétaire de cette ressource",
      );
    }
    return true;
  }
}
