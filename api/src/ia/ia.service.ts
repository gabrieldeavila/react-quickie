import { Injectable } from '@nestjs/common';
import { CreateIaDto } from './dto/create-ia.dto';
import { UpdateIaDto } from './dto/update-ia.dto';

@Injectable()
export class IaService {
  create(createIaDto: CreateIaDto) {
    return 'This action adds a new ia';
  }

  findAll() {
    return `This action returns all ia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ia`;
  }

  update(id: number, updateIaDto: UpdateIaDto) {
    return `This action updates a #${id} ia`;
  }

  remove(id: number) {
    return `This action removes a #${id} ia`;
  }
}
