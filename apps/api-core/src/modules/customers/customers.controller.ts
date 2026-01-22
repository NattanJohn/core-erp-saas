import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../shared/interfaces/user-payload.interface';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

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

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um cliente (Soft Delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.customersService.remove(id, user.tenantId);
  }
}
