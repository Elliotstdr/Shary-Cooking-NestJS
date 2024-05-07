import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshTokenDto, SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return await this.getTokenPair(user.id, user.email);
  }

  async signup(dto: SignUpDto) {
    try {
      const hashedSecretKey = await argon.verify(
        process.env.SECRET_KEY,
        dto.secretKey,
      );

      if (!hashedSecretKey)
        throw new ForbiddenException(
          'La clef secrète que vous avez renseigné est incorrecte.',
        );

      delete dto.secretKey;

      const hash = await argon.hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          ...dto,
          password: hash,
        },
      });

      return await this.getTokenPair(user.id, user.email);
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

  async refreshToken(body: RefreshTokenDto) {
    try {
      const user = this.jwt.verify(body.refresh_token, {
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
      });

      const newAccessToken = await this.signToken(user.sub, user.email);

      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getTokenPair(userId: number, email: string) {
    const token = await this.signToken(userId, email);
    const refreshToken = await this.signRefreshToken(userId, email);

    return {
      access_token: token,
      refresh_token: refreshToken,
    };
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email: email,
    };

    const token = this.jwt.sign(payload, {
      expiresIn: '15m',
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
      expiresIn: '30d',
      secret: this.config.get('REFRESH_TOKEN_SECRET'),
    });

    return token;
  }
}
