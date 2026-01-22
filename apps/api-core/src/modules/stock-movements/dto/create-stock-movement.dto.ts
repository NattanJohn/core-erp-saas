import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateStockMovementDto {
  @ApiProperty({ example: '33117ade-...' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'in', enum: ['in', 'out'] })
  @IsEnum(['in', 'out'])
  type: 'in' | 'out';

  @ApiProperty({ example: 'Compra de fornecedor' })
  @IsString()
  @IsOptional()
  reason?: string;
}
