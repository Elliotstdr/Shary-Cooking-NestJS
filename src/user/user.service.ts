import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EditPasswordDto,
  EditUserDto,
  MailResetDto,
  ResetPasswordDto,
  SendReportDto,
} from './dto';
import * as argon from 'argon2';
import { MailService } from 'src/mail/mail.service';
import { AuthService } from 'src/auth/auth.service';
import { USER_SELECT } from 'src/enum';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailer: MailService,
    private authService: AuthService,
  ) {}

  async getMe(user: User) {
    return user;
  }

  async editUser(
    userId: number,
    dto: EditUserDto,
    filename: string | undefined,
  ) {
    const data = { ...dto };

    if (filename) {
      data.imageUrl = `/public/${filename}`;
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

    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches)
      throw new ForbiddenException("L'ancien mot de passe est invalide");

    const hash = await argon.hash(dto.password);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });

    return;
  }

  async sendMailReset(dto: MailResetDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) return;

    const key = (Math.random() + 1).toString(36).substring(2);
    const hashedKey = await argon.hash(key);

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { resetPassword: hashedKey },
    });

    this.mailer.sendResetPasswordEmail(key);
    return;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) return;

    const pwMatches = await argon.verify(user.resetPassword, dto.resetKey);

    if (!pwMatches)
      throw new ForbiddenException("La clé secrète n'est pas valide");

    const newPassword = await argon.hash(dto.newPassword);
    const newUser = await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        resetPassword: null,
        password: newPassword,
      },
      select: USER_SELECT,
    });

    const newToken = await this.authService.signin({
      email: dto.email,
      password: dto.newPassword,
    });

    return { user: newUser, token: newToken.access_token };
  }

  async sendReport(
    user: User,
    dto: SendReportDto,
    file: Express.Multer.File | undefined,
  ) {
    this.mailer.sendReportEmail(user, dto, file);
    return;
  }
}
