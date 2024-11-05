import { createRule } from 'git-law';
import { z } from 'zod';
import tsconfig from '../configs/tsconfig.mjs';

const schema = z.object({
  shouldExtend: z.string(),
});

export default createRule('my-rules/require-tsconfig-extends', {
  schema,
  validate: async ({ getConfig, config, validation }) => {
    const result = await getConfig(tsconfig);
    if (result?.extends !== config.shouldExtend) {
      validation.addViolation({
        reason: `tsconfig does not extend ${config.shouldExtend}`,
      });
    }
  },
});
