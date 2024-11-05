import { z, ZodSchema } from 'zod';
import { Repo } from '../repo/repo.js';
import { RuleValidation } from './rule.validation.js';

type RuleValidationContext<TSchema extends ZodSchema> = {
  config: z.infer<TSchema>;
  repo: Repo;
  validation: RuleValidation;
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
