import type {
  ApprovalRule,
  ApprovalRuleScope,
  ApprovalRules,
} from './approval-rule.types';

export type ApprovalRuleTarget = {
  scope: ApprovalRuleScope;
  /** Resolved project root; required for `project`. */
  root?: string;
  tool: string;
  command?: string;
};

const sameRule = (rule: ApprovalRule, target: ApprovalRuleTarget) =>
  rule.tool === target.tool && rule.command === target.command;

function projectKey(target: ApprovalRuleTarget): string {
  if (!target.root) throw new Error('A project rule needs a root.');
  return target.root;
}

function listOf(rules: ApprovalRules, target: ApprovalRuleTarget) {
  if (target.scope === 'global') return rules.global;
  return rules.projects[projectKey(target)] ?? [];
}

function withList(
  rules: ApprovalRules,
  target: ApprovalRuleTarget,
  list: ApprovalRule[],
): ApprovalRules {
  if (target.scope === 'global') return { ...rules, global: list };
  const key = projectKey(target);
  const projects = { ...rules.projects, [key]: list };
  if (list.length === 0) delete projects[key];
  return { ...rules, projects };
}

/** Adds the rule unless the same tool + command is already there. */
export function addApprovalRule(
  rules: ApprovalRules,
  target: ApprovalRuleTarget,
  createdAt: string,
): ApprovalRules {
  const list = listOf(rules, target);
  if (list.some((rule) => sameRule(rule, target))) return rules;
  const rule: ApprovalRule = {
    tool: target.tool,
    ...(target.command === undefined ? {} : { command: target.command }),
    createdAt,
  };
  return withList(rules, target, [...list, rule]);
}

/** Removes the rule with this tool + command; a project left empty is dropped. */
export function removeApprovalRule(
  rules: ApprovalRules,
  target: ApprovalRuleTarget,
): ApprovalRules {
  const list = listOf(rules, target);
  return withList(
    rules,
    target,
    list.filter((rule) => !sameRule(rule, target)),
  );
}
