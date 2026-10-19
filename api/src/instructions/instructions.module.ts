import { Module } from '@nestjs/common';
import { InstructionSelectionService } from './data/instruction-selection.service';
import { InstructionsRepository } from './data/instructions.repository';
import { InstructionsController } from './delivery/instructions.controller';

@Module({
  controllers: [InstructionsController],
  providers: [InstructionsRepository, InstructionSelectionService],
  exports: [InstructionSelectionService],
})
export class InstructionsModule {}
