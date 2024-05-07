import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
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
  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
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
  @Post('sendReport')
  sendReport(@GetUser() user: User, @Body() dto: SendReportDto) {
    return this.userService.sendReport(user, dto);
  }
}
