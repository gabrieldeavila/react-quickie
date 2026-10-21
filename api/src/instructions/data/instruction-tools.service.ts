import { Injectable } from '@nestjs/common';
import { tool, type ToolSet } from 'ai';
import { z } from 'zod/v4';
import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import {
  formatToolError,
  toolSuccess,
} from 'src/common/agents/tools/shared/format-tool-error';
import { createInstructionApprovalPolicies } from '../domain/instruction-approval-policies';
import {
  LIST_INSTRUCTIONS_TOOL,
  READ_INSTRUCTION_TOOL,
  SAVE_INSTRUCTION_TOOL,
} from '../domain/instruction-tool-names';
import { planInstructionSave } from '../domain/plan-instruction-save';
import {
  toInstructionDetailView,
  toInstructionView,
} from '../domain/to-instruction-view';
import { InstructionsRepository } from './instructions.repository';

const readInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe('Id of the instruction (from list_instructions).'),
});

const saveInputSchema = z.object({
  scope: z
    .enum(['project', 'global'])
    .optional()
    .describe(
      '"project" saves to <root>/.doty/instructions/ (can be committed); "global" to ~/.doty/instructions/ (every project). Defaults to "project" when a project is open.',
    ),
  id: z
    .string()
    .optional()
    .describe(
      'File name without .md: lowercase letters, digits and "-". Defaults to one made from the name.',
    ),
  name: z.string().describe('Short name shown in the instruction picker.'),
  description: z
    .string()
    .optional()
    .describe('One line on when to attach this instruction.'),
  starters: z
    .array(z.string())
    .optional()
    .describe('Example prompts offered when the instruction is selected.'),
  content: z
    .string()
    .describe(
      'The guidance itself, in Markdown, without frontmatter (up to 20 KB).',
    ),
  replace: z
    .boolean()
    .optional()
    .describe(
      'Set true to overwrite an existing instruction with the same id and scope.',
    ),
});

type ReadInput = z.infer<typeof readInputSchema>;
type SaveInput = z.infer<typeof saveInputSchema>;

export type InstructionToolkitForChat = {
  tools: ToolSet;
  approvalPolicies: Record<string, ToolApprovalPolicy>;
};

/** Lets the agent list, read and save the user's instructions. */
@Injectable()
export class InstructionToolsService {
  constructor(private readonly repository: InstructionsRepository) {}

  createToolkit(root?: string): InstructionToolkitForChat {
    return {
      tools: {
        [LIST_INSTRUCTIONS_TOOL]: this.listTool(root),
        [READ_INSTRUCTION_TOOL]: this.readTool(root),
        [SAVE_INSTRUCTION_TOOL]: this.saveTool(root),
      },
      approvalPolicies: createInstructionApprovalPolicies(root),
    };
  }

  private listTool(root?: string) {
    return tool({
      description:
        'Lists the instructions (built-in, global and project) the user can attach to a conversation, without their bodies.',
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const instructions = await this.repository.list(root);
          return toolSuccess(
            `${instructions.length} instruction(s).`,
            instructions.map(toInstructionView),
          );
        } catch (error) {
          return formatToolError('list the instructions', error);
        }
      },
    });
  }

  private readTool(root?: string) {
    return tool({
      description: 'Reads one instruction with its Markdown body.',
      inputSchema: readInputSchema,
      execute: async ({ id }: ReadInput) => {
        try {
          const instruction = await this.repository.get(id, root);
          if (!instruction) throw new Error(`Instruction "${id}" not found.`);
          return toolSuccess(
            `Instruction "${id}".`,
            toInstructionDetailView(instruction),
          );
        } catch (error) {
          return formatToolError(`read the instruction "${id}"`, error);
        }
      },
    });
  }

  private saveTool(root?: string) {
    return tool({
      description:
        'Creates or updates an instruction: reusable Markdown guidance the user attaches to conversations from the instruction picker. Use it when the user asks to save guidance, conventions or a document as an instruction. The user approves every save.',
      inputSchema: saveInputSchema,
      execute: async (request: SaveInput) => {
        try {
          const plan = planInstructionSave(request, root);
          const taken = await this.repository.exists(plan.scope, plan.id, root);
          if (taken && !plan.replace) {
            throw new Error(
              `A ${plan.scope} instruction "${plan.id}" already exists. Read it, then save again with replace: true, or pick another id.`,
            );
          }
          const written = await this.repository.write(
            plan.scope,
            plan.id,
            plan.input,
            root,
          );
          return toolSuccess(
            `${taken ? 'Updated' : 'Created'} the ${plan.scope} instruction "${plan.id}".`,
            toInstructionView(written),
          );
        } catch (error) {
          return formatToolError('save the instruction', error);
        }
      },
    });
  }
}
