import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../shared/interfaces/user-payload.interface';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Orders') // Agrupa os endpoints no Swagger
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo pedido',
    description:
      'Este endpoint realiza a reserva de estoque e gera uma fatura financeira automaticamente.',
  })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Estoque insuficiente ou dados inválidos.',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto ou Cliente não encontrado.',
  })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ordersService.create(createOrderDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os pedidos da empresa' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.ordersService.findAll(user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancela um pedido e estorna o estoque (Soft Delete)',
  })
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.ordersService.remove(id, user.tenantId);
  }
}
