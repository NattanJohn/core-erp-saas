import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  create(dto: CreateProductDto, tenantId: string) {
    const product = this.repository.create({ ...dto, tenantId });
    return this.repository.save(product);
  }

  findAll(tenantId: string) {
    return this.repository.find({
      where: { tenantId },
      relations: ['category'], // Já traz a categoria junto no NestJS
    });
  }

  async remove(id: string, tenantId: string) {
    // 1. Verificamos se o produto existe e pertence ao tenant
    const product = await this.repository.findOne({
      where: { id, tenantId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // 2. Executa o Soft Delete (preenche a coluna deletedAt)
    await this.repository.softDelete(id);

    return { message: 'Produto removido com sucesso' };
  }
}
