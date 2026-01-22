import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  create(createCustomerDto: CreateCustomerDto) {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  findAll(tenantId: string) {
    return this.customerRepository.find({
      where: { tenantId },
    });
  }

  async remove(id: string, tenantId: string) {
    const customer = await this.customerRepository.findOne({
      where: { id, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    await this.customerRepository.softDelete(id);
    return { message: 'Cliente removido com sucesso' };
  }
}
