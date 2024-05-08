import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/Guard';
import { MailResetDto, SendReportDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PIPE_BUILDER } from 'src/enum';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('mailReset')
  sendMailReset(@Body() dto: MailResetDto) {
    return this.mailService.sendResetPasswordEmail(dto);
  }

  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post('sendReport')
  sendReport(
    @GetUser() user: User,
    @Body() dto: SendReportDto,
    @UploadedFile(PIPE_BUILDER) file: Express.Multer.File | undefined,
  ) {
    return this.mailService.sendReportEmail(user, dto, file);
  }
}
