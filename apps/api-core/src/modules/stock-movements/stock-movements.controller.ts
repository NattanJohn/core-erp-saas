import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../shared/interfaces/user-payload.interface';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('stock-movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @ApiOperation({
    summary: 'Registra uma movimentação manual de estoque (Entrada/Saída)',
  })
  create(
    @Body() createStockMovementDto: CreateStockMovementDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.stockMovementsService.create(
      createStockMovementDto,
      user.tenantId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lista o histórico de movimentações de um produto' })
  @ApiQuery({
    name: 'productId',
    required: true,
    description: 'ID do produto para ver o histórico',
  })
  findAll(
    @Query('productId') productId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.stockMovementsService.findAll(productId, user.tenantId);
  }
}
