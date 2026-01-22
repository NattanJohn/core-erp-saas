import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateOrderDto, tenantId: string) {
    let orderTotal = 0;
    const orderItems: OrderItem[] = [];

    // 1. Validar e buscar dados de cada produto
    for (const itemDto of dto.items) {
      const product = await this.productRepository.findOne({
        where: { id: itemDto.productId, tenantId },
      });

      if (!product) {
        throw new NotFoundException(
          `Produto ${itemDto.productId} não encontrado`,
        );
      }

      const itemPrice = Number(product.price);
      const subtotal = itemPrice * itemDto.quantity;
      orderTotal += subtotal;

      // 2. Criar a instância do item com o preço capturado no momento
      const orderItem = new OrderItem();
      orderItem.productId = product.id;
      orderItem.quantity = itemDto.quantity;
      orderItem.unit_price = itemPrice;

      orderItems.push(orderItem);
    }

    // 3. Criar o pedido (O TypeORM vai salvar os itens automaticamente pelo cascade)
    const order = this.orderRepository.create({
      customerId: dto.customerId,
      tenantId,
      total: orderTotal,
      items: orderItems,
      status: 'pending',
    });

    return this.orderRepository.save(order);
  }

  findAll(tenantId: string) {
    return this.orderRepository.find({
      where: { tenantId },
      relations: ['customer', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }
}
