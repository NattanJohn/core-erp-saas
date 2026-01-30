import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { Product } from '../products/entities/product.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}
  async create(dto: CreateStockMovementDto, tenantId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await this.createWithManager(
        queryRunner.manager,
        dto,
        tenantId,
      );
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createWithManager(
    manager: EntityManager,
    dto: CreateStockMovementDto,
    tenantId: string,
  ) {
    const product = await manager.findOne(Product, {
      where: { id: dto.productId, tenantId },
    });

    if (!product) throw new NotFoundException('Produto não encontrado');

    if (dto.type === 'in') {
      product.stock_quantity += dto.quantity;
    } else {
      product.stock_quantity -= dto.quantity;
    }
    await manager.save(product);

    const movement = manager.create(StockMovement, {
      ...dto,
      tenantId,
    });
    return manager.save(movement);
  }

  findAll(productId: string, tenantId: string) {
    return this.stockMovementRepository.find({
      where: { productId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
