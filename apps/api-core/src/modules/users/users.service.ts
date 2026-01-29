import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async createTenant(name: string): Promise<Tenant> {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newTenant = this.tenantRepository.create({ name, slug });
    return this.tenantRepository.save(newTenant);
  }

  async createUser(data: Partial<User>) {
    const userExists = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (userExists) {
      throw new ConflictException('Este e-mail já está em uso.');
    }
    const newUser = this.userRepository.create(data);
    return this.userRepository.save(newUser);
  }

  async findAllByTenant(tenantId: string) {
    return this.userRepository.find({
      where: { tenantId },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });
  }

  async remove(id: string, tenantId: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException(
        'Você não pode excluir seu próprio usuário.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    await this.userRepository.softDelete(id);
    return { message: 'Usuário removido com sucesso' };
  }
}
