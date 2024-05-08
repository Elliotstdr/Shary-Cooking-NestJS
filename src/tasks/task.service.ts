import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private httpService: HttpService,
  ) {}

  // @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
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
