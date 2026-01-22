import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  create(dto: CreateCategoryDto, tenantId: string) {
    const category = this.repository.create({ ...dto, tenantId });
    return this.repository.save(category);
  }

  findAll(tenantId: string) {
    return this.repository.find({ where: { tenantId } });
  }

  async remove(id: string, tenantId: string) {
    const category = await this.repository.findOne({ where: { id, tenantId } });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
    await this.repository.softDelete(id);
    return { message: 'Categoria removida com sucesso' };
  }
}
