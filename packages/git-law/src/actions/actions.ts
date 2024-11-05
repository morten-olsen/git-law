import { z, ZodSchema } from 'zod';
import { Repo } from '../repo/repo.js';

type ActionContext<TSchema extends ZodSchema> = {
  repo: Repo;
  config: z.infer<TSchema>;
};

type Action<TSchema extends ZodSchema> = {
  onValid?: (ctx: ActionContext<TSchema>) => Promise<void>;
  onInvalid?: (ctx: ActionContext<TSchema>) => Promise<void>;
  always?: (ctx: ActionContext<TSchema>) => Promise<void>;
};

export { type Action };
