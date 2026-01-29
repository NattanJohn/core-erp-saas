import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';

export interface LoginResponse {
  access_token: string;
  id_token: string;
  user: {
    id: string;
    email: string;
    tenantId: string;
  };
}

@ApiTags('auth') // Organiza no Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Cria uma nova conta de empresa e usuário administrador',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário e empresa criados com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou erro no Cognito.',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Realiza o login e retorna os tokens e claims do Hasura',
  })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Confirma o registro do usuário usando o código enviado por e-mail',
  })
  async confirm(@Body() confirmDto: ConfirmRegistrationDto) {
    return this.authService.confirmRegistration(confirmDto);
  }
}
