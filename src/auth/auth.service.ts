import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RefreshTokenDto, SignInDto, SignUpDto } from './dto';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BCRYPT_SALT } from 'src/common/enum';

const TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '30d';

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

    const pwMatches = await bcrypt.compare(dto.password, user.password);
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return await this.getTokenPair(user.id, user.email);
  }

  async signup(dto: SignUpDto) {
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
