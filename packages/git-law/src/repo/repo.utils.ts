import { ZodError } from 'zod';
import { Config } from '../config/config.js';
import { RuleValidation } from '../rule/rule.validation.js';
import { Repo } from './repo.js';

type GetConfigOptions = {
  repo: Repo;
  config: Config;
};
const getConfig = async ({ repo, config }: GetConfigOptions) => {
  return Object.fromEntries(
    await Promise.all(
      config.sections.map(async (section) => {
        const result = await section.get({ repo });
        return [section.name, result];
      }),
    ),
  );
};

type ApplyConfigOptions = {
  repo: Repo;
  config: Config;
};
const applyConfig = async ({ repo, config }: ApplyConfigOptions) => {
  for (const section of config.sections) {
    if (!section.set) {
      continue;
    }
    const sectionConfig = repo.configs[section.name];
    if (sectionConfig) {
      const parsed = await section.schema.parseAsync(sectionConfig);
      await section.set({
        repo,
        config: parsed,
      });
    }
  }
};

const validateConfig = async ({ repo, config }: ApplyConfigOptions) => {
  const validations: RuleValidation[] = [];
  const parse: {
    section: string;
    success: boolean;
    data?: unknown;
    error?: ZodError;
  }[] = [];

  for (const section of config.sections) {
    const sectionConfig = repo.configs[section.name];
    if (!sectionConfig) {
      continue;
    }
    const result = await section.schema.safeParseAsync(sectionConfig);
    parse.push({
      section: section.name,
      success: result.success,
      data: result.data,
      error: result.error,
    });
  }
  for (const { rule, config: ruleConfig } of config.rules) {
    const validation = new RuleValidation({
      rule,
    });
    validations.push(validation);
    await rule.validate({
      repo,
      config: ruleConfig,
      validation,
    });
  }
  return {
    validations,
    parse,
  };
};

type OnValidConfigOptions = {
  repo: Repo;
  config: Config;
};
const onValid = async ({ repo, config }: OnValidConfigOptions) => {
  for (const { action, config: actionConfig } of config.actions) {
    await action.onValid?.({
      repo,
      config: actionConfig,
    });

    await action.always?.({
      repo,
      config: actionConfig,
    });
  }
};

type OnInvalidConfigOptions = {
  repo: Repo;
  config: Config;
};
const onInvalid = async ({ repo, config }: OnInvalidConfigOptions) => {
  for (const { action, config: actionConfig } of config.actions) {
    await action.onInvalid?.({
      repo,
      config: actionConfig,
    });

    await action.always?.({
      repo,
      config: actionConfig,
    });
  }
};

export { getConfig, applyConfig, validateConfig, onValid, onInvalid };
