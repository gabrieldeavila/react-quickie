import { tool } from 'ai';
import z from 'zod';
import { createAgent } from './tool';

const createAgentTool = tool({
  description:
    'Creates a new agent plugin, generating the required API (NestJS) and UI (React) files.',
  inputSchema: z.object({
    name: z
      .string()
      .describe(
        'The agent internal name. Lowercase, with no spaces (e.g. "data_analyst", "agent_builder").',
      ),
    label: z
      .string()
      .describe(
        'The human-readable display name (e.g. "Data Analyst", "Agent Builder").',
      ),
    icon: z
      .string()
      .describe(
        'The exact icon component name from the react-icons library (e.g. "AiFillAlert", "FaMagic").',
      ),
    iconImport: z
      .string()
      .describe(
        'The react-icons import path for that icon (e.g. "react-icons/ai" for Ai icons, "react-icons/fa" for Fa icons).',
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

      return `Created agent "${label}" (${name}). Generated files: ${paths.join(', ')}`;
    } catch (error) {
      return `Failed to create the agent: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

export default createAgentTool;
