import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import type { UserPayload } from 'src/shared/interfaces/user-payload.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo utilizador vinculado a um tenant' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({
    summary: 'Lista todos os utilizadores de um tenant específico',
  })
  findAll(@Param('tenantId') tenantId: string) {
    return this.usersService.findAllByTenant(tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um usuário (Soft Delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.usersService.remove(id, user.tenantId, user.sub);
  }
}
