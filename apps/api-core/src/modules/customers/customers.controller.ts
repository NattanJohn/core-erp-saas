import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: Record<string, any>,
  ) {
    return this.customersService.create({
      ...createCustomerDto,
      tenantId: String(user.tenantId),
    });
  }

  @Get()
  findAll(@CurrentUser() user: Record<string, any>) {
    return this.customersService.findAll(String(user.tenantId));
  }
}
