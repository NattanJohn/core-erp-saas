import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Eletrônicos' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Produtos de tecnologia e hardware',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  tenantId?: string;
}
