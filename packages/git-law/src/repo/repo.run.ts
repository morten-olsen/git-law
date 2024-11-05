import { dirname, resolve } from 'path';
import { Config } from '../config/config.js';
import { Repo } from './repo.js';
import { applyConfig, getConfig, onInvalid, onValid, validateConfig } from './repo.utils.js';
import { mkdir, writeFile } from 'fs/promises';

type RepoRunOptions = {
  repo: Repo;
  config: Config;
};
const applyRepoConfig = async ({ repo, config }: RepoRunOptions) => {
  return await applyConfig({ repo, config });
};

const validateRepoConfig = async ({ repo, config }: RepoRunOptions) => {
  const validation = await validateConfig({ repo, config });
  for (const reporter of config.reporters) {
    const result = await reporter.create([
      {
        repo,
        result: validation,
      },
    ]);
    if (result.console) {
      process.stdout.write(result.console);
    }
    if (result.files) {
      for (const [location, content] of Object.entries(result.files)) {
        const target = resolve('reports', location);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, content);
      }
    }
  }
};

const getRepoConfig = async ({ repo, config }: RepoRunOptions) => {
  return await getConfig({ repo, config });
};

const runRepo = async ({ repo, config }: RepoRunOptions) => {
  const validate = await validateConfig({
    repo,
    config,
  });
  if (!validate.hasParseErrors && !validate.hasRuleViolations) {
    await applyRepoConfig({ repo, config });
    await onValid({ repo, config });
  } else if (validate.hasRuleViolations) {
    await onInvalid({ repo, config });
  }
  return validate;
};

type RunAllReposOptions = {
  repos: Repo[];
  config: Config;
};

type ValidationResponse = Awaited<ReturnType<typeof validateConfig>>;

const runRepos = async ({ repos, config }: RunAllReposOptions) => {
  const results: {
    repo: Repo;
    result: ValidationResponse;
  }[] = [];

  for (const repo of repos) {
    const result = await runRepo({ repo, config });
    results.push({
      repo,
      result,
    });
  }

  for (const reporter of config.reporters) {
    const result = await reporter.create(results);
    if (result.console) {
      process.stdout.write(result.console);
    }
    if (result.files) {
      for (const [location, content] of Object.entries(result.files)) {
        const target = resolve('reports', location);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, content);
      }
    }
  }

  return results;
};

export { getRepoConfig, applyRepoConfig, validateRepoConfig, runRepo, runRepos, type ValidationResponse };
