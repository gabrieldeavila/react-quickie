import { tool } from 'ai';
import z from 'zod';
import { createAgent } from './tool';

const createAgentTool = tool({
  description:
    'Cria um novo plugin de agente, gerando os arquivos de API (NestJS) e UI (React) necessários.',
  inputSchema: z.object({
    name: z
      .string()
      .describe(
        'O nome interno do agente no sistema. Deve ser em letras minúsculas e sem espaços (ex: "data_analyst", "agent_builder").',
      ),
    label: z
      .string()
      .describe(
        'O nome de exibição legível para humanos (ex: "Data Analyst", "Agent Builder").',
      ),
    icon: z
      .string()
      .describe(
        'O nome exato do componente de ícone da biblioteca react-icons (ex: "AiFillAlert", "FaMagic", etc.).',
      ),
    iconImport: z
      .string()
      .describe(
        'O caminho de importação do pacote do ícone correspondente no react-icons (ex: "react-icons/ai" para ícones Ai, "react-icons/fa" para ícones Fa, etc.).',
      ),
  }),
  execute: ({ name, label, icon, iconImport }) => {
    try {
      const paths = createAgent({
        name,
        label,
        icon,
        iconImport,
      });

      return `Agente "${label}" (${name}) criado com sucesso. Arquivos gerados em: ${paths.join(', ')}`;
    } catch (error) {
      return `Falha ao criar o agente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    }
  },
});

export default createAgentTool;
