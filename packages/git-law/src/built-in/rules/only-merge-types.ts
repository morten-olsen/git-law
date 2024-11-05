import { z } from 'zod';
import { createRule } from '../../rule/rule.js';
import basic from '../configs/basics.js';

const mergeTypes = z.enum(['squash', 'rebase', 'merge']);

const schema = z.object({
  allowed: z.array(mergeTypes).optional(),
});
const requireVisibility = createRule('require-visibility', {
  schema,
  validate: async ({ repo, config, validation }) => {
    const basics = await repo.getConfig(basic);
    if (!config.allowed) {
      return;
    }
    if (basics.predicted?.pullRequests?.mergeCommits?.enabled && !config.allowed.includes('merge')) {
      validation.addViolation({
        reason: 'Merge commits are not allowed',
      });
    }
    if (basics.predicted?.pullRequests?.squashMerge?.enabled && !config.allowed.includes('squash')) {
      validation.addViolation({
        reason: 'Squash merge is not allowed',
      });
    }
    if (basics.predicted?.pullRequests?.rebaseMerge?.enabled && !config.allowed.includes('rebase')) {
      validation.addViolation({
        reason: 'Rebase merge is not allowed',
      });
    }
  },
});

export { requireVisibility };
export default requireVisibility;
