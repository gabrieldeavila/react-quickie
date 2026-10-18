import { Module } from '@nestjs/common';
import { ProviderRegistryService } from './data/provider-registry.service';
import { ModelsController } from './delivery/models.controller';

@Module({
  controllers: [ModelsController],
  providers: [ProviderRegistryService],
  exports: [ProviderRegistryService],
})
export class LlmModule {}
