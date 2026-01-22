import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { UserPayload } from '../../shared/interfaces/user-payload.interface';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'Lista todas as contas a receber' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.financeService.findAll(user.tenantId);
  }

  @Patch('invoices/:id/pay')
  @ApiOperation({ summary: 'Registra o pagamento de uma fatura' })
  markAsPaid(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.financeService.markAsPaid(id, user.tenantId);
  }

  @Delete('invoices/:id')
  @ApiOperation({ summary: 'Remove uma fatura (Soft Delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.financeService.remove(id, user.tenantId);
  }
}
