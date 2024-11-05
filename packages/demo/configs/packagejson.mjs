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
