import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { EditPasswordDto, EditUserDto, ResetPasswordDto } from './dto';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT, USER_SELECT } from 'src/common/enum';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    });
  }

  async getMe(user: User) {
    return user;
  }

  async editUser(
    userId: number,
    dto: EditUserDto,
    filePath: string | undefined,
  ) {
    const data = { ...dto };

    if (filePath) {
      data.imageUrl = filePath;
    } else {
      delete data.imageUrl;
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: data,
      select: USER_SELECT,
    });
  }

  async editPassword(userId: number, dto: EditPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const pwMatches = await bcrypt.compare(dto.oldPassword, user.password);
    if (!pwMatches)
      throw new ForbiddenException("L'ancien mot de passe est invalide");

    const hash = await bcrypt.hash(dto.password, BCRYPT_SALT);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });

    return;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) return;

    const pwMatches = await bcrypt.compare(dto.resetKey, user.resetPassword);

    if (!pwMatches)
      throw new ForbiddenException("La clé secrète n'est pas valide");

    const newPassword = await bcrypt.hash(dto.newPassword, BCRYPT_SALT);

    return await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        resetPassword: null,
        password: newPassword,
      },
      select: USER_SELECT,
    });
  }
}
