import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entity/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  createCategory(
    @Body() categoryData: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoriesService.createCategory(categoryData);
  }

  @Get()
  findAllCategories(): Promise<CategoryEntity[]> {
    return this.categoriesService.findAllCategories();
  }

  @Get(':id')
  findCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryEntity> {
    return this.categoriesService.findCategoryById(id);
  }

  @Patch(':id')
  updateCategory(
    @Param('id') id: string,
    @Body() categoryData: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoriesService.updateCategory(id, categoryData);
  }

  @Delete(':id')
  removeCategory(@Param('id') id: string): Promise<CategoryEntity> {
    return this.categoriesService.removeCategory(id);
  }
}
