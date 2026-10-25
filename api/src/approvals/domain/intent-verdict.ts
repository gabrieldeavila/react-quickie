import { z } from 'zod/v4';

export const intentVerdictSchema = z.object({
  approve: z.boolean(),
  reason: z.string(),
});

/** The reason to run the call, or undefined: anything but a clear yes asks the user. */
export function readIntentApproval(output: unknown): string | undefined {
  const parsed = intentVerdictSchema.safeParse(output);
  if (!parsed.success || !parsed.data.approve) return undefined;
  return parsed.data.reason.trim() || undefined;
}
