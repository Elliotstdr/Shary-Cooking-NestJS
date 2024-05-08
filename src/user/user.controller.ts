import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard, NotGuestGuard } from 'src/auth/Guard';
import { UserService } from './user.service';
import {
  EditPasswordDto,
  EditUserDto,
  MailResetDto,
  ResetPasswordDto,
  SendReportDto,
} from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_INTERCEPTOR, PIPE_BUILDER } from 'src/enum';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return this.userService.getMe(user);
  }

  @UseGuards(NotGuestGuard)
  @UseGuards(JwtGuard)
  @UseInterceptors(FILE_INTERCEPTOR)
  @Patch()
  editUser(
    @GetUser('id') userId: number,
    @Body() dto: EditUserDto,
    @UploadedFile(PIPE_BUILDER) file: Express.Multer.File | undefined,
  ) {
    return this.userService.editUser(userId, dto, file?.filename);
  }

  @UseGuards(NotGuestGuard)
  @UseGuards(JwtGuard)
  @Post('editPassword')
  editPassword(@GetUser('id') userId: number, @Body() dto: EditPasswordDto) {
    return this.userService.editPassword(userId, dto);
  }

  @Post('mailReset')
  sendMailReset(@Body() dto: MailResetDto) {
    return this.userService.sendMailReset(dto);
  }

  @Post('resetPassword')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(dto);
  }

  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post('sendReport')
  sendReport(
    @GetUser() user: User,
    @Body() dto: SendReportDto,
    @UploadedFile(PIPE_BUILDER) file: Express.Multer.File | undefined,
  ) {
    return this.userService.sendReport(user, dto, file);
  }
}
