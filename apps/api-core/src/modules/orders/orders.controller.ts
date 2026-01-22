import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../shared/interfaces/user-payload.interface';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo pedido com cálculo automático de total',
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
}
