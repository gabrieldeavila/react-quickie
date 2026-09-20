import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, isStepCount, tool } from 'ai';
import { z } from 'zod/v4';
import { ContextService } from 'src/common/context/context.service';
import { StorageService } from 'src/common/helpers/storage.service';
import { createStorageTools } from './tools/storage.tools';

export type SubagentStatusEvent = {
  id: string;
  name: string;
  task: string;
  status: 'running' | 'completed' | 'failed';
};

@Injectable()
export class SubagentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly contextService: ContextService,
    private readonly storageService: StorageService,
  ) {}

  createTools() {
    return {
      run_subagent: tool({
        description:
          'Delegue uma tarefa bem delimitada a um subagente especializado. Use quando uma pesquisa, análise ou revisão puder ser feita separadamente antes de consolidar a resposta.',
        inputSchema: z.object({
          name: z.string().min(1).describe('Nome curto do subagente.'),
          task: z.string().min(1).describe('Tarefa específica do subagente.'),
          context: z
            .string()
            .optional()
            .describe('Contexto adicional necessário para executar a tarefa.'),
        }),
        execute: async ({
          name,
          task,
          context,
        }: {
          name: string;
          task: string;
          context?: string;
        }) => this.run(name, task, context),
      }),
    };
  }

  private async run(name: string, task: string, context?: string) {
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    this.emit({ id, name, task, status: 'running' });

    try {
      const apiKey = this.configService.get<string>('OPENAI_KEY');
      const modelName = this.configService.get<string>('OPENAI_MODEL');
      if (!apiKey || !modelName)
        throw new Error('Modelo de IA não configurado.');

      const model = createOpenAI({ apiKey })(modelName);
      const storageTools = createStorageTools(this.storageService);

      // Subagentes recebem apenas ferramentas de leitura. Assim eles conseguem
      // inspecionar o workspace atual sem ganhar permissão para editar arquivos,
      // executar comandos ou criar efeitos colaterais.
      const readOnlyTools = {
        list_folders: storageTools.list_folders,
        read_file: storageTools.read_file,
        regex_search_files_content: storageTools.regex_search_files_content,
        search_content_in_file: storageTools.search_content_in_file,
        get_lint_errors: storageTools.get_lint_errors,
      };

      const result = await generateText({
        model,
        system:
          'Você é um subagente especializado. Execute somente a tarefa recebida, seja objetivo e retorne um resultado útil para outro agente. Você pode ler arquivos do workspace usando as ferramentas disponíveis. Sempre use as ferramentas de leitura quando a tarefa exigir analisar o projeto. Não tente delegar novas tarefas e nunca altere arquivos.',
        prompt: `Tarefa: ${task}${context ? `\n\nContexto:\n${context}` : ''}`,
        tools: readOnlyTools,
        stopWhen: isStepCount(8),
      });

      this.emit({ id, name, task, status: 'completed' });
      return { success: true, subagentId: id, result: result.text };
    } catch {
      this.emit({ id, name, task, status: 'failed' });
      return {
        success: false,
        subagentId: id,
        error: 'Não foi possível concluir a tarefa do subagente.',
      };
    }
  }

  private emit(event: SubagentStatusEvent) {
    this.contextService.get('emitSubagentEvent')?.(event);
  }
}
