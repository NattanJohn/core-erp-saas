import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(name: string, slug: string) {
    const tenant = this.tenantRepository.create({ name, slug });
    return this.tenantRepository.save(tenant);
  }

  findAll() {
    return this.tenantRepository.find();
  }

  async remove(id: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    await this.tenantRepository.softDelete(id);
    return { message: 'Tenant desativado com sucesso' };
  }
}
