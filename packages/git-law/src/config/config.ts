import { extname, resolve } from 'path';
import { Rule } from '../rule/rule.js';
import { RepoConfigSection } from './repo/repo.section.js';
import { readFile } from 'fs/promises';
import { Action } from '../actions/actions.js';
import { ZodSchema } from 'zod';

type Configuration = {
  github?: {
    token?: string;
  };
  repos?: {
    include?: string[];
    exclude?: string[];
  };
  configs?: (string | RepoConfigSection<string, ZodSchema>)[];
  rules: ([string, unknown] | [Rule<string, ZodSchema>, unknown])[];
  actions: ([string, unknown] | [Action<ZodSchema>, unknown])[];
};

type Config = {
  github: {
    token?: string;
  };
  repos: {
    include?: string[];
    exclude?: string[];
  };
  sections: RepoConfigSection<string, ZodSchema>[];
  rules: {
    rule: Rule<string, ZodSchema>;
    config: unknown;
  }[];
  actions: {
    action: Action<ZodSchema>;
    config: unknown;
  }[];
};

type LoadConfigOptions = {
  repos?: {
    include?: string[];
    exclude?: string[];
  };
};

const loadConfig = async (location: string, options: LoadConfigOptions = {}): Promise<Config> => {
  const fullLocation = resolve(location);
  let config: Configuration;

  const ext = extname(fullLocation);
  if (['.mjs', '.cjs', '.js'].includes(ext)) {
    const response = await import(fullLocation);
    config = response.config || response.default;
  } else if (ext === 'json') {
    config = JSON.parse(await readFile(fullLocation, 'utf8'));
  } else {
    throw new Error(`Unknown config extension ${ext}`);
  }
  const sections: RepoConfigSection<string, ZodSchema>[] = await Promise.all(
    config.configs?.map(async (config) => {
      if (typeof config === 'string') {
        const response = await import(resolve(config));
        return response.config || response.default;
      }
      return config;
    }) || [],
  );
  const rules: Config['rules'] = await Promise.all(
    config.rules?.map(async ([rule, config]) => {
      if (typeof rule === 'string') {
        const response = await import(resolve(rule));
        return response.rule || response.default;
      }
      return {
        rule,
        config,
      };
    }) || [],
  );
  const actions: Config['actions'] = await Promise.all(
    config.actions?.map(async ([action, config]) => {
      if (typeof action == 'string') {
        const response = await import(resolve(action));
        return {
          action: response.action || response.default,
          config,
        };
      }
      return {
        action,
        config,
      };
    }) || [],
  );
  const token = config.github?.token || process.env.GITHUB_TOKEN;
  return {
    github: {
      token,
    },
    repos: {
      include: options.repos?.include || config.repos?.include,
      exclude: options.repos?.exclude || config.repos?.exclude,
    },
    sections,
    rules,
    actions,
  };
};

export { loadConfig, type Config };
