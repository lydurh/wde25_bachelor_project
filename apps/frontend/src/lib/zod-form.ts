import type { z } from '@repo/shared';

export const flattenZodErrors = (
  issues: z.ZodIssue[],
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
};

export const flattenApiIssues = (
  issues: Array<{ path: (string | number)[]; message: string }> | undefined,
): Record<string, string> => {
  if (!issues?.length) return {};

  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
};
