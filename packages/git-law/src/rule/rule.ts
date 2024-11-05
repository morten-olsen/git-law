import { z, ZodSchema } from 'zod';
import { Repo } from '../repo/repo.js';
import { RuleValidation } from './rule.validation.js';
import { RepoConfigSection } from '../exports.js';

type RuleValidationContext<TSchema extends ZodSchema> = {
  config: z.infer<TSchema>;
  repo: Repo;
  validation: RuleValidation;
  getConfig: <TConfigSchema extends ZodSchema>(
    section: RepoConfigSection<string, TConfigSchema>,
  ) => Promise<z.infer<TConfigSchema>>;
};

type Rule<TName extends string, TSchema extends ZodSchema> = {
  name: TName;
  schema: TSchema;
  validate: (ctx: RuleValidationContext<TSchema>) => Promise<void>;
};

const createRule = <TName extends string, TSchema extends ZodSchema>(
  name: TName,
  rule: Omit<Rule<TName, TSchema>, 'name'>,
): Rule<TName, TSchema> => ({
  ...rule,
  name,
});

export { createRule, type RuleValidationContext, type Rule };
