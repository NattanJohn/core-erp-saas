import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Nattan John' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'nattan@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Mínimo de 6 caracteres' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'uuid-da-empresa' })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;
}
