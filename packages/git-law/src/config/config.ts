import { extname, resolve } from 'path';
import { Rule } from '../rule/rule.js';
import { RepoConfigSection } from './repo/repo.section.js';
import { readFile } from 'fs/promises';
import { Action } from '../actions/actions.js';
import { ZodSchema } from 'zod';
import { Reporter } from '../reporter/reporter.js';

type Configuration = {
  github?: {
    token?: string;
    file?: string;
  };
  repos?: {
    include?: string[];
    exclude?: string[];
  };
  configs?: (string | RepoConfigSection<string, ZodSchema>)[];
  reporters?: (string | Reporter)[];
  rules: ([string, unknown] | [Rule<string, ZodSchema>, unknown])[];
  actions: ([string, unknown] | [Action<ZodSchema>, unknown])[];
};

type Config = {
  github: {
    token?: string;
    file: string;
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
  reporters: Reporter[];
};

type LoadConfigOptions = {
  github?: {
    token?: string;
    file?: string;
  };
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
  const reporters: Config['reporters'] = await Promise.all(
    config.reporters?.map(async (reporter) => {
      if (typeof reporter === 'string') {
        const response = await import(resolve(reporter));
        return response.reporter || response.default;
      }
      return reporter;
    }) || [],
  );
  const token = options.github?.token || config.github?.token || process.env.GITHUB_TOKEN;
  const file = options.github?.file || config.github?.file || '.github/github-config.json';
  return {
    github: {
      token,
      file,
    },
    repos: {
      include: options.repos?.include || config.repos?.include,
      exclude: options.repos?.exclude || config.repos?.exclude,
    },
    sections,
    rules,
    actions,
    reporters,
  };
};

export { loadConfig, type Config, type Configuration };
