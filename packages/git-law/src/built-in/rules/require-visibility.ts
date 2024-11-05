import { z } from 'zod';
import { createRule } from '../../rule/rule.js';
import general from '../configs/general.js';

const visibilityTypes = z.enum(['public', 'private']);

const schema = z.object({
  allowed: z.array(visibilityTypes).optional(),
  disallowed: z.array(visibilityTypes).optional(),
});
const requireVisibility = createRule('require-visibility', {
  schema,
  validate: async ({ repo, config, validation }) => {
    const basics = await repo.getConfig(general);
    const requestedVisibility = basics.requested?.visibility ?? basics.actual?.visibility;

    if (!requestedVisibility) {
      return;
    }

    if (config.allowed && !config.allowed.includes(requestedVisibility)) {
      validation.addViolation({
        reason: `The repo visibility ${requestedVisibility} is not allowed`,
      });
    }

    if (config.disallowed && config.disallowed.includes(requestedVisibility)) {
      validation.addViolation({
        reason: `The repo visibility ${requestedVisibility} is disallowed`,
      });
    }
  },
});

export { requireVisibility };
export default requireVisibility;
