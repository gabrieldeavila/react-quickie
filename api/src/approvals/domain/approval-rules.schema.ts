import { z } from 'zod/v4';

const approvalRuleSchema = z.object({
  tool: z.string().trim().min(1),
  command: z.string().optional(),
  createdAt: z.string().default(''),
});

export const approvalRulesSchema = z.object({
  global: z.array(approvalRuleSchema).default([]),
  projects: z.record(z.string(), z.array(approvalRuleSchema)).default({}),
});
