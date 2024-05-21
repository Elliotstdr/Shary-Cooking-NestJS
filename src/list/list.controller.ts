import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/Guard';
import { ListService } from './list.service';
import { GetUser } from 'src/auth/decorator';
import { ListPropertyGuard } from './Guard';
import { CreateListDto, EditListDto } from './dto';
import { ParseJsonInterceptor } from './Interceptor';

@UseGuards(JwtGuard)
@Controller('list')
export class ListController {
  constructor(private listService: ListService) {}

  @UseInterceptors(ParseJsonInterceptor)
  @Get()
  getLists(@GetUser('id') userId: number) {
    return this.listService.getLists(userId);
  }

  @UseInterceptors(ParseJsonInterceptor)
  @Post()
  createList(@GetUser('id') userId: number, @Body() dto: CreateListDto) {
    return this.listService.createList(userId, dto);
  }

  @UseGuards(ListPropertyGuard)
  @Post(':id/share/:userId')
  shareList(
    @Param('id', ParseIntPipe) listId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.listService.shareList(listId, userId);
  }

  @UseInterceptors(ParseJsonInterceptor)
  @UseGuards(ListPropertyGuard)
  @Patch(':id')
  editList(
    @Param('id', ParseIntPipe) listId: number,
    @Body() dto: EditListDto,
  ) {
    return this.listService.editList(listId, dto);
  }

  @UseGuards(ListPropertyGuard)
  @Delete(':id')
  deleteList(@Param('id', ParseIntPipe) listId: number) {
    return this.listService.deleteList(listId);
  }
}
