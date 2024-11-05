import { z } from 'zod';
import { createRepoConfigSection } from '../../exports.js';

const schema = z.object({
  description: z.string().optional(),
  homepage: z.string().optional(),
  topics: z.array(z.string()).optional(),
});

export default createRepoConfigSection('github/info', {
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
