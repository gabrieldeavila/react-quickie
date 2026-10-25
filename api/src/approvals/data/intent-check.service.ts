import { Injectable, Logger } from '@nestjs/common';
import { generateText, Output } from 'ai';
import type {
  IntentCall,
  IntentConfirmer,
} from 'src/chat/domain/approval-policy';
import { ContextService } from 'src/common/context/context.service';
import { ProviderRegistryService } from 'src/llm/data/provider-registry.service';
import type { ModelUsage } from 'src/llm/domain/model-usage.types';
import { priceUsage } from 'src/llm/domain/price-usage';
import { toTokenUsage } from 'src/llm/domain/to-token-usage';
import { buildIntentPrompt } from '../domain/build-intent-prompt';
import { collectUserRequests } from '../domain/collect-user-requests';
import {
  intentVerdictSchema,
  readIntentApproval,
} from '../domain/intent-verdict';

const TIMEOUT_MS = 10_000;

/**
 * Asks a (preferably cheap) model whether the user's own messages ask for a
 * risky call, so auto mode can run it. Any failure asks the user instead.
 */
@Injectable()
export class IntentCheckService {
  private readonly logger = new Logger(IntentCheckService.name);

  constructor(
    private readonly providerRegistry: ProviderRegistryService,
    private readonly contextService: ContextService,
  ) {}

  /** A confirmer for this request; each check's usage goes to `recordUsage`. */
  createConfirmer(recordUsage: (usage: ModelUsage) => void): IntentConfirmer {
    return (call) => this.confirm(call, recordUsage);
  }

  private async confirm(
    call: IntentCall,
    recordUsage: (usage: ModelUsage) => void,
  ): Promise<string | undefined> {
    const requests = collectUserRequests(call.messages);
    if (requests.length === 0) return undefined;

    try {
      const conversation = this.providerRegistry.select(
        this.contextService.get('modelRef'),
      );
      const selected = this.providerRegistry.selectForApproval(conversation);
      const result = await generateText({
        model: this.providerRegistry.languageModel(selected),
        ...buildIntentPrompt(requests, call),
        output: Output.object({ schema: intentVerdictSchema }),
        maxRetries: this.providerRegistry.maxRetries,
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      });
      recordUsage(priceUsage(selected, toTokenUsage(result.usage)));
      return readIntentApproval(result.output);
    } catch (error) {
      this.logger.warn(
        `Intent check for ${call.toolName} failed; asking the user. ${String(error)}`,
      );
      return undefined;
    }
  }
}
