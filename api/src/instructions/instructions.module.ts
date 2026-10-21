import { Module } from '@nestjs/common';
import { InstructionSelectionService } from './data/instruction-selection.service';
import { InstructionToolsService } from './data/instruction-tools.service';
import { InstructionsRepository } from './data/instructions.repository';
import { InstructionsController } from './delivery/instructions.controller';

@Module({
  controllers: [InstructionsController],
  providers: [
    InstructionsRepository,
    InstructionSelectionService,
    InstructionToolsService,
  ],
  exports: [InstructionSelectionService, InstructionToolsService],
})
export class InstructionsModule {}
