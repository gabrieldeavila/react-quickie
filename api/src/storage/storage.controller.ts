import { Controller, Get } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  createProject(projectName: string): Promise<any> {
    return this.storageService.createProject(projectName);
  }
}
