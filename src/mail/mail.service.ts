import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { SendReportDto } from 'src/user/dto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(config: ConfigService) {
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

  async sendResetPasswordEmail(key: string) {
    await this.transporter.sendMail({
      subject: 'Reset password',
      html: this.loadTemplate('resetPassword.hbs', { key: key }),
    });
  }

  async sendReportEmail(user: User, dto: SendReportDto) {
    await this.transporter.sendMail({
      subject: 'report from shary-cooking',
      html: this.loadTemplate('sendReport.hbs', {
        name: user.name,
        lastname: user.lastname,
        title: dto.title,
        message: dto.message,
        image: dto.image,
      }),
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
