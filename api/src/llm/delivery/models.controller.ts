import { Controller, Get } from '@nestjs/common';
import { ProviderRegistryService } from '../data/provider-registry.service';

@Controller('models')
export class ModelsController {
  constructor(private readonly registry: ProviderRegistryService) {}

  /** Only providers with a configured key; `default` is null when none has one. */
  @Get()
  list() {
    return {
      default: this.registry.getDefault()?.ref ?? null,
      providers: this.registry
        .listProviders()
        .map(({ id, label, models }) => ({ id, label, models })),
    };
  }
}
