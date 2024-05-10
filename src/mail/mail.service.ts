import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { MailResetDto, SendReportDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BCRYPT_SALT } from 'src/enum';
import { MailPayload } from 'src/image';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.transporter = nodemailer.createTransport(
      {
        host: config.get('EMAIL_HOST'),
        port: Number(config.get('EMAIL_PORT')),
        secure: true,
        auth: {
          user: config.get('EMAIL_USER'),
          pass: config.get('EMAIL_PASSWORD'),
        },
      },
      {
        to: config.get('EMAIL'),
        from: `"No Reply" <${config.get('NO_REPLY')}>`,
      },
    );
  }

  async sendResetPasswordEmail(dto: MailResetDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) return;

    const key = (Math.random() + 1).toString(36).substring(2);
    const hashedKey = await bcrypt.hash(key, BCRYPT_SALT);

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { resetPassword: hashedKey },
    });

    await this.transporter.sendMail({
      subject: 'Réinitialisation de mot de passe',
      html: this.loadTemplate('resetPassword.hbs', { key: key }),
    });
  }

  async sendReportEmail(
    user: User,
    dto: SendReportDto,
    file: MailPayload | undefined,
  ) {
    await this.transporter.sendMail({
      subject: 'report from shary-cooking',
      html: this.loadTemplate('sendReport.hbs', {
        name: user.name,
        lastname: user.lastname,
        title: dto.title,
        message: dto.message,
      }),
      attachments: file ? [{ filename: file.image, content: file.buffer }] : [],
    });
  }

  private loadTemplate(templateName: string, params: any): string {
    const templatesFolderPath = path.join(__dirname, './templates');
    const templatePath = path.join(templatesFolderPath, templateName);

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    return template(params);
  }
}
