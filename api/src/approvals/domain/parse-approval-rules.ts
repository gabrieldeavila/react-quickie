import { approvalRulesSchema } from './approval-rules.schema';
import {
  EMPTY_APPROVAL_RULES,
  type ApprovalRules,
} from './approval-rule.types';

export type ParsedApprovalRules = {
  rules: ApprovalRules;
  /** The file is unusable; `rules` is empty, never "allow all". */
  error?: string;
};

function parseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

/** Parses `approval-rules.json`. Any invalid part makes the whole file void. */
export function parseApprovalRules(text: string): ParsedApprovalRules {
  const json = parseJson(text);
  if (!json.ok) return { rules: EMPTY_APPROVAL_RULES, error: 'Invalid JSON.' };

  const parsed = approvalRulesSchema.safeParse(json.value);
  if (!parsed.success) {
    return {
      rules: EMPTY_APPROVAL_RULES,
      error: 'Invalid approval rules: expected { global: [], projects: {} }.',
    };
  }
  return { rules: parsed.data };
}
