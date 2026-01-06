import { Controller, Post, Get, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTenantDto } from './dto/create-tenant.dto';

@ApiTags('tenants') // Agrupa as rotas no Swagger
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova empresa (tenant)' })
  @ApiResponse({ status: 201, description: 'Empresa criada com sucesso.' })
  create(@Body() body: CreateTenantDto) {
    return this.tenantsService.create(body.name, body.slug);
  }

  @Get()
  @ApiOperation({ summary: 'Retorna todas as empresas (tenants)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas retornada com sucesso.',
  })
  findAll() {
    return this.tenantsService.findAll();
  }
}
