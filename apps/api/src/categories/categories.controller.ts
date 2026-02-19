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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entity/category.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'Category created', type: CategoryEntity })
  createCategory(
    @Body() categoryData: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoriesService.createCategory(categoryData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [CategoryEntity] })
  findAllCategories(): Promise<CategoryEntity[]> {
    return this.categoriesService.findAllCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category found', type: CategoryEntity })
  @ApiNotFoundResponse({ description: 'Category not found' })
  findCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryEntity> {
    return this.categoriesService.findCategoryById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated', type: CategoryEntity })
  @ApiNotFoundResponse({ description: 'Category not found' })
  updateCategory(
    @Param('id') id: string,
    @Body() categoryData: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoriesService.updateCategory(id, categoryData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted', type: CategoryEntity })
  @ApiNotFoundResponse({ description: 'Category not found' })
  removeCategory(@Param('id') id: string): Promise<CategoryEntity> {
    return this.categoriesService.removeCategory(id);
  }
}
