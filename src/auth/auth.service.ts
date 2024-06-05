import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BCRYPT_SALT } from 'src/common/enum';
import { Request, Response } from 'express';

const TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '30d';
const REFRESH_TOKEN = 'refresh_token';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: SignInDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await bcrypt.compare(dto.password, user.password);
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return this.fillAuthResponse(user.id, user.email, res);
  }

  async signup(dto: SignUpDto, res: Response) {
    const { secretKey, ...body } = dto;
    try {
      const hashedSecretKey = await bcrypt.compare(
        secretKey,
        process.env.SECRET_KEY,
      );

      if (!hashedSecretKey)
        throw new ForbiddenException(
          'La clef secrète que vous avez renseigné est incorrecte.',
        );

      const hash = await bcrypt.hash(body.password, BCRYPT_SALT);

      const user = await this.prisma.user.create({
        data: {
          ...body,
          password: hash,
        },
      });

      return this.fillAuthResponse(user.id, user.email, res);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Credentials Taken');
      } else {
        throw error;
      }
    }
  }

  async refreshToken(req: Request) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN];

      const user = this.jwt.verify(refreshToken, {
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
      });

      const newAccessToken = await this.signToken(user.sub, user.email);

      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async fillAuthResponse(userId: number, email: string, res: Response) {
    const token = await this.signToken(userId, email);
    const refreshToken = await this.signRefreshToken(userId, email);

    return res
      .cookie(REFRESH_TOKEN, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 32 * 24 * 60 * 60 * 1000,
      })
      .send({ access_token: token });
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email: email,
    };

    const token = this.jwt.sign(payload, {
      expiresIn: TOKEN_EXPIRATION,
      secret: this.config.get('JWT_SECRET'),
    });

    return token;
  }

  async signRefreshToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email: email,
    };

    const token = this.jwt.sign(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
      secret: this.config.get('REFRESH_TOKEN_SECRET'),
    });

    return token;
  }
}
