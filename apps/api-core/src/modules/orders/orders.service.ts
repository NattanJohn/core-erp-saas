import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { Invoice } from '../finance/entities/invoice.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private dataSource: DataSource, // Injetado para gerenciar a transação
  ) {}

  async create(dto: CreateOrderDto, tenantId: string) {
    // Iniciamos o QueryRunner para gerenciar a transação manualmente
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let orderTotal = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of dto.items) {
        // 1. Buscar produto dentro da transação
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId, tenantId },
          lock: { mode: 'pessimistic_write' }, // Evita que outro pedido mexa nesse produto ao mesmo tempo
        });

        if (!product) {
          throw new NotFoundException(
            `Produto ${itemDto.productId} não encontrado`,
          );
        }

        // 2. Verificar estoque
        if (product.stock_quantity < itemDto.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stock_quantity}`,
          );
        }

        // 3. Atualizar estoque do produto
        product.stock_quantity -= itemDto.quantity;
        await queryRunner.manager.save(product);

        const movement = queryRunner.manager.create('StockMovement', {
          type: 'out',
          quantity: itemDto.quantity,
          reason: `Venda - Pedido Gerado`,
          productId: product.id,
          tenantId: tenantId,
        });

        await queryRunner.manager.save(movement);

        // 4. Calcular totais
        const itemPrice = Number(product.price);
        orderTotal += itemPrice * itemDto.quantity;

        const orderItem = new OrderItem();
        orderItem.productId = product.id;
        orderItem.quantity = itemDto.quantity;
        orderItem.unit_price = itemPrice;
        orderItems.push(orderItem);
      }

      // 5. Criar e salvar o pedido
      const order = queryRunner.manager.create(Order, {
        customerId: dto.customerId,
        tenantId,
        total: orderTotal,
        items: orderItems,
        status: 'pending',
      });

      const savedOrder = await queryRunner.manager.save(order);

      const invoice = queryRunner.manager.create('Invoice', {
        amount: orderTotal,
        status: 'pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Vence em 3 dias
        orderId: savedOrder.id,
        customerId: dto.customerId,
        tenantId: tenantId,
      });

      await queryRunner.manager.save(invoice);

      // Se tudo deu certo, confirma as alterações no banco
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      // Se qualquer erro ocorrer, desfaz tudo (estoque volta ao que era)
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Importante: sempre liberar o queryRunner
      await queryRunner.release();
    }
  }

  findAll(tenantId: string) {
    return this.orderRepository.find({
      where: { tenantId },
      relations: ['customer', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }
  async remove(id: string, tenantId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Buscar o pedido com os itens para saber o que devolver ao estoque
      const order = await queryRunner.manager.findOne(Order, {
        where: { id, tenantId },
        relations: ['items'],
      });

      if (!order) {
        throw new NotFoundException('Pedido não encontrado');
      }

      // 2. Estornar o estoque para cada item do pedido
      for (const item of order.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId, tenantId },
        });

        if (product) {
          product.stock_quantity += item.quantity; // Devolve a quantidade
          await queryRunner.manager.save(product);

          // Opcional: Registrar a movimentação de estorno no stock_movements
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

      // 3. Dar Soft Delete no Pedido
      await queryRunner.manager.softDelete(Order, id);

      // 4. Opcional: Se houver uma Invoice (Fatura) vinculada, deletar ela também
      await queryRunner.manager.softDelete(Invoice, { orderId: id });

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
