import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Minha Empresa SaaS' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: 'minha-empresa' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Senha@123', description: 'Mínimo de 8 caracteres' })
  @IsString()
  @MinLength(8)
  password: string;
}
