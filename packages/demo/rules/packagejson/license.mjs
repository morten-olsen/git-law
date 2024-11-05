import { createRule } from 'git-law';
import { z } from 'zod';
import packageJsonConfig from '../../configs/packagejson.mjs';

const schema = z.object({
  mustSpecifyLicense: z.boolean().optional(),
  allowedLicenses: z.array(z.string()).optional(),
});

export default createRule('packagejson/license', {
  schema,
  validate: async ({ getConfig, config, validation }) => {
    const packageJson = await getConfig(packageJsonConfig);
    if (!packageJson) {
      // if the repo doesn't have a package.json we assume
      // this isn't a node project.
      return;
    }

    if (!packageJson.license) {
      if (config.mustSpecifyLicense) {
        validation.addViolation({
          reason: 'No license specified in package.json',
        });
      }
      return;
    }

    if (config.allowedLicenses && !config.allowedLicenses.includes(packageJson.license)) {
      validation.addViolation({
        reason: `license ${packageJson.license} specified in package.json is not allowed, allowed values are ${config.allowedLicenses.join(', ')}`,
      });
    }
  },
});
