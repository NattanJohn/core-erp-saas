import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Mouse Gamer RGB' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'PROD-001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Mouse de alta precisão' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 150.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsOptional()
  stock_quantity?: number;

  @ApiProperty({ example: 'uuid-da-categoria' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  tenantId?: string;
}
