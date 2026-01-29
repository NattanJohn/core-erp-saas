import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class ConfirmRegistrationDto {
  @ApiProperty({ example: 'nattan@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Código de 6 dígitos enviado por e-mail',
  })
  @IsString()
  @Length(6, 6)
  code: string;
}
