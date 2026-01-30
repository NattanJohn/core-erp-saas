import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import type { UserPayload } from '../../shared/interfaces/user-payload.interface';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo produto vinculado a uma categoria' })
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.productsService.create(createProductDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os produtos com suas categorias' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.productsService.findAll(user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um produto (Soft Delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.productsService.remove(id, user.tenantId);
  }

  @Patch(':id') // O ':' indica que o ID é um parâmetro de URL
  @ApiOperation({ summary: 'Atualiza um produto e registra movimentação' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.productsService.update(id, updateProductDto, user.tenantId);
  }
}
