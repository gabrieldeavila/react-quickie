import { Module } from '@nestjs/common';
import { spawn } from 'child_process';
import { ProjectService } from './project.service';

@Module({
  providers: [ProjectService],
  exports: [ProjectService],
})
export class HelperModule {}
