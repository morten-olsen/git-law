import { z, ZodSchema } from 'zod';
import { Repo } from '../../repo/repo.js';

type PredictOptions<TSchema extends ZodSchema> = {
  repo: Repo;
  actual: z.infer<TSchema>;
  requested?: z.infer<TSchema>;
};

type RepoConfigSectionContext<TSchema extends ZodSchema> = {
  repo: Repo;
  config?: z.infer<TSchema>;
};
type RepoConfigSection<TName extends string, TSchema extends ZodSchema> = {
  schema: TSchema;
  name: TName;
  get: (ctx: RepoConfigSectionContext<TSchema>) => Promise<z.infer<TSchema>>;
  set: (ctx: RepoConfigSectionContext<TSchema>) => Promise<void>;
  predict?: (options: PredictOptions<TSchema>) => Promise<z.infer<TSchema>>;
};

const createRepoConfigSection = <const TName extends string, TSchema extends ZodSchema>(
  name: TName,
  config: Omit<RepoConfigSection<TName, TSchema>, 'name'>,
): RepoConfigSection<TName, TSchema> => ({
  ...config,
  name,
});

export { createRepoConfigSection, type RepoConfigSection };
