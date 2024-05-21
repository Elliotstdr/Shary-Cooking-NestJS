import { Module } from '@nestjs/common';
import { DefaultProductController } from './default-product.controller';
import { DefaultProductService } from './default-product.service';

@Module({
  controllers: [DefaultProductController],
  providers: [DefaultProductService],
})
export class DefaultProductModule {}
