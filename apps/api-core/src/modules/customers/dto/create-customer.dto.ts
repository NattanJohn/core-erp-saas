import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Cliente Exemplo LTDA' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'cliente@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiProperty({ example: 'company', enum: ['individual', 'company'] })
  @IsEnum(['individual', 'company'])
  type: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  tenantId?: string;
}
