import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from '../products/entities/product.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { Invoice } from '../finance/entities/invoice.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateOrderDto, tenantId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Criar a instância do pedido
      const order = queryRunner.manager.create(Order, {
        customerId: dto.customerId,
        tenantId,
        status: 'pending',
        total: 0, // Será calculado abaixo
      });

      const savedOrder = await queryRunner.manager.save(order);
      let totalOrderAmount = 0;

      // 2. Processar itens, estoque e preços históricos
      for (const item of dto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId, tenantId },
        });

        if (!product) {
          throw new NotFoundException(
            `Produto ${item.productId} não encontrado.`,
          );
        }

        if (product.stock_quantity < item.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto: ${product.name}`,
          );
        }

        // --- REFINE: Congelando o preço atual do produto no item do pedido ---
        const orderItem = queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: product.id,
          quantity: item.quantity,
          unit_price: product.price, // Salva o preço do momento da venda
        });

        await queryRunner.manager.save(orderItem);

        // Atualiza o total acumulado do pedido
        totalOrderAmount += Number(product.price) * item.quantity;

        // 3. Baixa de estoque
        product.stock_quantity -= item.quantity;
        await queryRunner.manager.save(product);

        // 4. Registro de movimentação de estoque
        const movement = queryRunner.manager.create(StockMovement, {
          productId: product.id,
          quantity: item.quantity,
          type: 'out',
          reason: `Venda - Pedido #${savedOrder.id}`,
          tenantId,
        });
        await queryRunner.manager.save(movement);
      }

      // 5. Atualizar o total final do pedido
      savedOrder.total = totalOrderAmount;
      await queryRunner.manager.save(savedOrder);

      // 6. Gerar a Invoice (Financeiro) automaticamente
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias

      const invoice = queryRunner.manager.create(Invoice, {
        orderId: savedOrder.id,
        customerId: savedOrder.customerId,
        amount: totalOrderAmount,
        status: 'pending',
        dueDate: dueDate,
        tenantId,
      });
      await queryRunner.manager.save(invoice);

      await queryRunner.commitTransaction();

      // Retorna o pedido completo com os itens
      return queryRunner.manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'items.product'],
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(tenantId: string) {
    return this.orderRepository.find({
      where: { tenantId },
      relations: ['items', 'items.product', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, tenantId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id, tenantId },
        relations: ['items'],
      });

      if (!order) {
        throw new NotFoundException('Pedido não encontrado');
      }

      // Estornar estoque
      for (const item of order.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId, tenantId },
        });

        if (product) {
          product.stock_quantity += item.quantity;
          await queryRunner.manager.save(product);

          const movement = queryRunner.manager.create(StockMovement, {
            productId: product.id,
            quantity: item.quantity,
            type: 'in',
            reason: `Estorno - Pedido Cancelado #${order.id}`,
            tenantId,
          });
          await queryRunner.manager.save(movement);
        }
      }

      await queryRunner.manager.softDelete(Order, { id, tenantId });
      await queryRunner.manager.softDelete(Invoice, { orderId: id, tenantId });

      await queryRunner.commitTransaction();
      return { message: 'Pedido cancelado e estoque estornado com sucesso' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
