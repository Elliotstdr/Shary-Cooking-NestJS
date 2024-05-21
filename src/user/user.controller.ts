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
import { EditPasswordDto, EditUserDto, ResetPasswordDto } from './dto';
import { ImagePipe } from 'src/common/pipes';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return this.userService.getMe(user);
  }

  @UseGuards(NotGuestGuard)
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch()
  editUser(
    @GetUser('id') userId: number,
    @Body() dto: EditUserDto,
    @UploadedFile(new ImagePipe(400)) filePath: string | undefined,
  ) {
    return this.userService.editUser(userId, dto, filePath);
  }

  @UseGuards(NotGuestGuard)
  @UseGuards(JwtGuard)
  @Post('editPassword')
  editPassword(@GetUser('id') userId: number, @Body() dto: EditPasswordDto) {
    return this.userService.editPassword(userId, dto);
  }

  @Post('resetPassword')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(dto);
  }
}
