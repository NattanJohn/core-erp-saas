import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  // Lista todas as faturas da empresa
  findAll(tenantId: string) {
    return this.invoiceRepository.find({
      where: { tenantId },
      relations: ['customer', 'order'],
      order: { dueDate: 'ASC' },
    });
  }

  // Registrar pagamento de uma fatura
  async markAsPaid(id: string, tenantId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }

    invoice.status = 'paid';
    invoice.paidAt = new Date();

    return this.invoiceRepository.save(invoice);
  }
}
