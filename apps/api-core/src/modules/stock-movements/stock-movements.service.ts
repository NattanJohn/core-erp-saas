import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
      // 1. Verificar se o produto existe
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId, tenantId },
      });

      if (!product) {
        throw new NotFoundException('Produto não encontrado');
      }

      // 2. Atualizar a quantidade no produto (In = Soma, Out = Subtrai)
      if (dto.type === 'in') {
        product.stock_quantity += dto.quantity;
      } else {
        product.stock_quantity -= dto.quantity;
      }
      await queryRunner.manager.save(product);

      // 3. Gravar o registro no histórico
      const movement = queryRunner.manager.create(StockMovement, {
        ...dto,
        tenantId,
      });
      const savedMovement = await queryRunner.manager.save(movement);

      await queryRunner.commitTransaction();
      return savedMovement;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(productId: string, tenantId: string) {
    return this.stockMovementRepository.find({
      where: { productId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
