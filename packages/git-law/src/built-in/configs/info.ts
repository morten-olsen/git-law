import { z } from 'zod';

const schema = z.object({
  description: z.string().optional(),
  webpage: z.string().optional(),
  topics: z.array(z.string()).optional(),
  include: z
    .object({
      releases: z.boolean().optional(),
      packages: z.boolean().optional(),
      deployments: z.boolean().optional(),
    })
    .optional(),
});
