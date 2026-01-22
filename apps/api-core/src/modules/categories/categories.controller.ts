import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { UserPayload } from '../../shared/interfaces/user-payload.interface';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova categoria' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.categoriesService.create(createCategoryDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as categorias da empresa' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.categoriesService.findAll(user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma categoria (Soft Delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.categoriesService.remove(id, user.tenantId);
  }
}
