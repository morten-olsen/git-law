`./configs/info.mjs`

```js
import { z } from 'zod';
import { createRepoConfigSection } from '../../exports.js';

const schema = z.object({
  description: z.string().optional(),
  homepage: z.string().optional(),
  topics: z.array(z.string()).optional(),
});

export default createRepoConfigSection('my-configs/info', {
  schema,
  get: async ({ repo }) => {
    const { data: response } = await repo.client.rest.repos.get({
      owner: repo.owner,
      repo: repo.name,
    });
    return {
      description: response.description || undefined,
      topics: response.topics,
      homepage: response.homepage || undefined,
    };
  },
  set: async ({ repo, config }) => {
    if (!config) {
      return;
    }
    await repo.client.rest.repos.update({
      owner: repo.owner,
      repo: repo.name,
      description: config.description,
      homepage: config.homepage,
      topics: config.topics,
    });
  },
});
```

```javascript
import 'dotenv/config';
import info from './configs/info.mjs';

/** @type {import('git-law').Configuration} */
const config = {
  github: {
    token: process.env.GITHUB_TOKEN,
  },
  configs: [info],
};

export { config };
```

```bash
npx git-law remote get-config morten-olsen/git-law
```

```bash
npx git-law repo-config schema -o schema.json
```

`repo-config.json`

```json
{
  "$schema": "./schema.json",
  "configs": {
    "basics": {
      "description": "Hello World"
    }
  }
}
```

```bash
npx git-law local apply repo-config.json morten-olsen/git-law
```
