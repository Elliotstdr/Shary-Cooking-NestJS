import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  // Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DefaultProductService } from './default-product.service';
import { GetUser } from 'src/auth/decorator';
import { DefaultProductDto } from './dto';
import { DefaultProductPropertyGuard } from './Guard';
import { JwtGuard } from 'src/auth/Guard';

@UseGuards(JwtGuard)
@Controller('default_product')
export class DefaultProductController {
  constructor(private defaultProductService: DefaultProductService) {}

  @Get()
  getDefaultProduct(@GetUser('id') userId: number) {
    return this.defaultProductService.getDefaultProduct(userId);
  }

  @Post()
  createDefaultProduct(
    @GetUser('id') userId: number,
    @Body() dto: DefaultProductDto,
  ) {
    return this.defaultProductService.createDefaultProduct(userId, dto);
  }

  @UseGuards(DefaultProductPropertyGuard)
  @Delete(':id')
  deleteDefaultProduct(@Param('id', ParseIntPipe) listId: number) {
    return this.defaultProductService.deleteDefaultProduct(listId);
  }
}
