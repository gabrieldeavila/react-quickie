import type { SystemModelMessage } from 'ai';
import type { Instruction } from './instruction.types';

/** One system message per selected instruction, headed with its name. */
export function formatInstructionMessage({
  name,
  content,
}: Instruction): SystemModelMessage {
  return {
    role: 'system',
    content: `Instruction "${name}" (selected by the user):\n\n${content}`,
  };
}
