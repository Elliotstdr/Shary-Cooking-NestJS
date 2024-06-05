import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: SignInDto, @Res() res: Response) {
    return this.authService.signin(dto, res);
  }

  @Post('signup')
  signup(@Body() dto: SignUpDto, @Res() res: Response) {
    return this.authService.signup(dto, res);
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request) {
    return this.authService.refreshToken(req);
  }
}
