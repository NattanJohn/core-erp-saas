import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: 'in' | 'out'; // 'in' para entrada (compra/ajuste), 'out' para saída (venda)

  @Column('int')
  quantity: number;

  @Column({ nullable: true })
  reason: string; // Ex: "Venda - Pedido #123", "Ajuste de Inventário", "Compra de Fornecedor"

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
