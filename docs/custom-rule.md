`./configs/packagejson.mjs`

```js
import { z } from 'zod';
import { createRepoConfigSection } from 'git-law';

const schema = z
  .object({
    license: z.string().optional(),
  })
  .optional();

export default createRepoConfigSection('my-configs/package.json', {
  schema,
  get: async ({ repo }) => {
    const client = repo.client;
    const content = await client.rest.repos
      .getContent({
        repo: repo.name,
        owner: repo.owner,
        path: 'package.json',
      })
      .then((result) => {
        if (result.data.type !== 'file') {
          throw new Error('Not a file');
        }
        return JSON.parse(Buffer.from(result.data.content, 'base64'));
      })
      .catch(() => {
        return undefined;
      });
    return content;
  },
});
```

`./rules/packagejson/license.mjs`

```js
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
```

```javascript
import 'dotenv/config';
import all from 'git-law/configs/all';
import packageJsonConfig from './configs/packagejson.mjs';
import packageJsonLicenseRule from './rules/packagejson/license.mjs';

/** @type {import('git-law').Configuration} */
const config = {
  github: {
    token: process.env.GITHUB_TOKEN,
  },
  configs: [...all, packageJsonConfig],
  rules: [
    [
      packageJsonLicenseRule,
      {
        mustSpecifyLicense: true,
        allowedLicenses: ['GPL-3.0-only'],
      },
    ],
  ],
};

export { config };
```

```bash
npx git-law local validate repo-config.json morten-olsen/git-law
```
