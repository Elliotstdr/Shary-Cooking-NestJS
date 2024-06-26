import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RecipeModule } from './recipe/recipe.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { StaticDataModule } from './static-data/static-data.module';
import { IngredientDataModule } from './ingredient-data/ingredient-data.module';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './common/tasks/task.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ListModule } from './list/list.module';
import { DefaultProductModule } from './default-product/default-product.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    RecipeModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    StaticDataModule,
    IngredientDataModule,
    HealthModule,
    MailModule,
    ScheduleModule.forRoot(),
    TaskModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public/',
    }),
    ListModule,
    DefaultProductModule,
  ],
})
export class AppModule {}
