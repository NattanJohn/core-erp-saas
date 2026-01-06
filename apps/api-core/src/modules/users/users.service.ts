import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Verificar se o e-mail já existe
    const userExists = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    // 2. Criar a instância (Por agora a password vai pura, o Bcrypt vem no próximo módulo)
    const newUser = this.userRepository.create(createUserDto);

    // 3. Guardar no banco
    return await this.userRepository.save(newUser);
  }

  async findAllByTenant(tenantId: string) {
    return this.userRepository.find({
      where: { tenantId },
    });
  }
}
