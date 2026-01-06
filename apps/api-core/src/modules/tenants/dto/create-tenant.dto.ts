import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Minha Empresa' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'minha-empresa' })
  @IsString()
  @IsNotEmpty()
  slug: string;
}
