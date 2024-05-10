import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard, NotGuestGuard } from 'src/auth/Guard';
import { GetUser } from 'src/auth/decorator';
import { CreateRecipeDto } from './dto';
import { RecipeService } from './recipe.service';
import { RecipePropertyGuard } from './Guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from 'src/image';

@UseGuards(JwtGuard)
@Controller('recipes')
export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  @Get()
  getRecipes() {
    return this.recipeService.getRecipes();
  }

  @Get(':id')
  getRecipeById(@Param('id', ParseIntPipe) recipeId: number) {
    return this.recipeService.getRecipeById(recipeId);
  }

  @UseGuards(NotGuestGuard)
  @Post()
  createRecipe(@GetUser('id') userId: number, @Body() dto: CreateRecipeDto) {
    return this.recipeService.createRecipe(userId, dto);
  }

  @UseGuards(NotGuestGuard)
  @UseGuards(RecipePropertyGuard)
  @Patch(':id')
  editRecipeById(
    @Param('id', ParseIntPipe) recipeId: number,
    @Body() dto: CreateRecipeDto,
  ) {
    return this.recipeService.editRecipeById(recipeId, dto);
  }

  @UseGuards(NotGuestGuard)
  @UseGuards(RecipePropertyGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteRecipeById(@Param('id', ParseIntPipe) recipeId: number) {
    return this.recipeService.deleteRecipeById(recipeId);
  }

  @UseGuards(NotGuestGuard)
  @UseGuards(RecipePropertyGuard)
  @Post(':id/deletePicture')
  deleteRecipePicture(@Param('id', ParseIntPipe) recipeId: number) {
    return this.recipeService.deleteRecipePicture(recipeId);
  }

  @UseGuards(NotGuestGuard)
  @UseGuards(RecipePropertyGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post(':id/addPicture')
  addRecipePicture(
    @Param('id', ParseIntPipe) recipeId: number,
    @UploadedFile(new SharpPipe()) filePath: string | undefined,
  ) {
    return this.recipeService.addRecipePicture(recipeId, filePath);
  }

  @Post('hellof')
  retrieveHellofRecipes(@Body() dto: { search: string }) {
    return this.recipeService.retrieveHellofRecipes(dto);
  }

  @Get('top/recipes')
  getTopRecipes() {
    return this.recipeService.getTopRecipes();
  }

  @Post('save/:recipeId')
  saveRecipe(
    @GetUser('id') userId: number,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    return this.recipeService.saveRecipe(userId, recipeId);
  }

  @Post('unsave/:recipeId')
  unsaveRecipe(
    @GetUser('id') userId: number,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    return this.recipeService.unsaveRecipe(userId, recipeId);
  }
}
