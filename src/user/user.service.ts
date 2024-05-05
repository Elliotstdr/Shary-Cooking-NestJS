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

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailer: MailService,
    private authService: AuthService,
  ) {}

  async getMe(user: User) {
    delete user.password;
    delete user.resetPassword;
    return user;
  }

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });

    delete user.password;

    return user;
  }

  async editPassword(userId: number, dto: EditPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches)
      throw new ForbiddenException('The old password is not correct');

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

    if (!user) return 'Utilisateur non trouvé';

    const key = (Math.random() + 1).toString(36).substring(2);

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { resetPassword: key },
    });

    this.mailer.sendResetPasswordEmail(key);
    return 'Success';
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) return 'Utilisateur non trouvé';

    const pwMatches = await argon.verify(user.resetPassword, dto.resetKey);

    if (!pwMatches)
      throw new ForbiddenException('The secret key is not correct');

    const newPassword = await argon.hash(dto.newPassword);
    const newUser = await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        resetPassword: null,
        password: newPassword,
      },
    });

    const newToken = await this.authService.signin({
      email: dto.email,
      password: newPassword,
    });

    return { user: newUser, token: newToken.access_token };
  }

  async sendReport(user: User, dto: SendReportDto) {
    this.mailer.sendReportEmail(user, dto);
    return 'Success';
  }
}
