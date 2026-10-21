import { instructionIdFromName } from './instruction-id-from-name';
import type { InstructionInput, InstructionScope } from './instruction.types';
import { isValidInstructionId } from './validate-instruction-id';
import {
  InvalidInstructionInputError,
  validateInstructionInput,
} from './validate-instruction-input';

/** What the model sends to `save_instruction`. */
export type SaveInstructionRequest = {
  scope?: InstructionScope;
  id?: string;
  name: string;
  description?: string;
  starters?: string[];
  content: string;
  replace?: boolean;
};

export type InstructionSavePlan = {
  scope: InstructionScope;
  id: string;
  input: InstructionInput;
  replace: boolean;
};

/** Project scope when there is a project, global otherwise. */
function resolveScope(
  requested: InstructionScope | undefined,
  root: string | undefined,
): InstructionScope {
  const scope = requested ?? (root ? 'project' : 'global');
  if (scope === 'project' && !root) {
    throw new InvalidInstructionInputError(
      'No project is open: save the instruction with scope "global".',
    );
  }
  return scope;
}

function resolveId(requested: string | undefined, name: string): string {
  const id = requested?.trim() || instructionIdFromName(name);
  if (!isValidInstructionId(id)) {
    throw new InvalidInstructionInputError(
      `Invalid id "${id}": use lowercase letters, digits and "-" (up to 64).`,
    );
  }
  return id;
}

/**
 * Checks a `save_instruction` call and fills the defaults (scope, id from
 * the name). Throws `InvalidInstructionInputError` with a message the model
 * can act on.
 */
export function planInstructionSave(
  request: SaveInstructionRequest,
  root?: string,
): InstructionSavePlan {
  const input = validateInstructionInput({
    name: request.name,
    description: request.description,
    starters: request.starters,
    content: request.content,
  });
  return {
    scope: resolveScope(request.scope, root),
    id: resolveId(request.id, input.name),
    input,
    replace: request.replace ?? false,
  };
}
