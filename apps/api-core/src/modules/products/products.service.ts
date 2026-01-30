import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StockMovementsService } from '../stock-movements/stock-movements.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
    private readonly stockMovementsService: StockMovementsService,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto, tenantId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Cria o produto
      const product = this.repository.create({ ...dto, tenantId });
      const savedProduct = await queryRunner.manager.save(product);

      // 2. Se houver estoque inicial, registra a movimentação
      if (dto.stock_quantity && dto.stock_quantity > 0) {
        await this.stockMovementsService.createWithManager(
          queryRunner.manager,
          {
            productId: savedProduct.id,
            quantity: dto.stock_quantity,
            type: 'in',
            reason: 'Saldo inicial (Criação de produto)',
          },
          tenantId,
        );
      }

      await queryRunner.commitTransaction();
      return savedProduct;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateProductDto, tenantId: string) {
    const product = await this.repository.findOne({ where: { id, tenantId } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (
        dto.stock_quantity !== undefined &&
        dto.stock_quantity !== product.stock_quantity
      ) {
        const diff = dto.stock_quantity - product.stock_quantity;
        await this.stockMovementsService.createWithManager(
          queryRunner.manager,
          {
            productId: id,
            quantity: Math.abs(diff),
            type: diff > 0 ? 'in' : 'out',
            reason: 'Ajuste manual de estoque',
          },
          tenantId,
        );
      }

      const updatedProduct = await queryRunner.manager.save(Product, {
        ...product,
        ...dto,
      });

      await queryRunner.commitTransaction();
      return updatedProduct;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(tenantId: string) {
    return this.repository.find({
      where: { tenantId },
      relations: ['category'],
    });
  }

  async remove(id: string, tenantId: string) {
    const product = await this.repository.findOne({ where: { id, tenantId } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    // Opcional: Registrar saída total ao deletar
    if (product.stock_quantity > 0) {
      await this.stockMovementsService.create(
        {
          productId: id,
          quantity: product.stock_quantity,
          type: 'out',
          reason: 'Remoção de produto (Soft Delete)',
        },
        tenantId,
      );
    }

    await this.repository.softDelete(id);
    return { message: 'Produto removido com sucesso' };
  }
}
