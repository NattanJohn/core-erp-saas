import { Injectable } from '@nestjs/common';
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
}
