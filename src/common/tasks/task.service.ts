import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { TWICE_A_MONTH } from '../enum';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private httpService: HttpService,
  ) {}

  @Cron(TWICE_A_MONTH)
  async updateHellofToken() {
    const externalTokens = await this.prisma.externalToken.findMany();

    await this.httpService.axiosRef
      .get(this.config.get('EXTERNAL_TOKEN_URL'))
      .then(async (res) => {
        let explode = res.data.split('access_token":"');
        explode = explode[1].split('","expires_in');

        const token = explode[0];

        if (externalTokens.length === 0) {
          await this.prisma.externalToken.create({ data: { value: token } });
        } else {
          await this.prisma.externalToken.update({
            where: { id: externalTokens[0].id },
            data: { value: token },
          });
        }
      })
      .catch(() => {
        return;
      });
  }
}
