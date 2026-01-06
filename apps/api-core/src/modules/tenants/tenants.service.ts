import { Injectable } from '@nestjs/common';
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
}
