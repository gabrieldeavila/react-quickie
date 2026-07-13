import { Module } from '@nestjs/common';
import { spawn } from 'child_process';
import { ProjectService } from './project.service';
import { StorageService } from './storage.service';

@Module({
  providers: [ProjectService, StorageService],
  exports: [ProjectService, StorageService],
})
export class HelperModule {}
