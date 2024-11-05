import { z } from 'zod';
import { createRepoConfigSection } from '../../config/repo/repo.section.js';

const schema = z.object({
  repo: z.array(z.string()).optional(),
});

const secrets = createRepoConfigSection('secrets', {
  schema,
  get: async ({ repo }) => {
    const secrets = await repo.client.rest.actions.listRepoSecrets({
      owner: repo.owner,
      repo: repo.name,
    });
    const repoSecrets = secrets.data.secrets.map((secret) => secret.name);

    return {
      repo: repoSecrets,
    };
  },
  set: async () => {},
});

export { secrets };
