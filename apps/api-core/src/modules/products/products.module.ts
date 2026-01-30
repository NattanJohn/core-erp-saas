import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { JwtModule } from '@nestjs/jwt';
import { StockMovementsModule } from '../stock-movements/stock-movements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    JwtModule,
    StockMovementsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
