/**
 * Prints the system prompt a chat request would get, for humans to read.
 *
 *   pnpm --dir api prompt:preview -- --root <dir> [--model <provider:model>]
 *     [--instructions <id,id>]
 *
 * Boots the real Nest app (env files, providers, MCP servers of the root),
 * so the toolset and the prompt are exactly what a request would build.
 */
import { NestFactory } from '@nestjs/core';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { ChatService } from '../src/chat/chat.service';
import { ContextService } from '../src/common/context/context.service';
import { PromptsService } from '../src/common/helpers/prompts.service';
import { ProviderRegistryService } from '../src/llm/data/provider-registry.service';

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const root = path.resolve(readFlag('root') ?? process.cwd());
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const context = app.get(ContextService);

  try {
    const instructionIds = (readFlag('instructions') ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    await context.run({ root, instructionIds }, async () => {
      const model = app.get(ProviderRegistryService).select(readFlag('model'));
      context.get()!.modelRef = model.ref;
      const { tools } = await app.get(ChatService).getToolkit();
      const toolNames = model.model.supportsTools ? Object.keys(tools) : [];
      const instructions = await app
        .get(PromptsService)
        .getInstructions({ model, toolNames });

      console.log(
        instructions
          .map(
            (message, index) =>
              `### System message ${index + 1}\n\n${message.content}`,
          )
          .join('\n\n'),
      );
    });
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
