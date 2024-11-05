import { Config } from '../config/config.js';
import { Repo } from './repo.js';
import { applyConfig, onInvalid, onValid, validateConfig } from './repo.utils.js';

type RepoRunOptions = {
  repo: Repo;
  config: Config;
};
const applyRepoConfig = async ({ repo, config }: RepoRunOptions) => {
  return await applyConfig({ repo, config });
};

const validateRepoConfig = async ({ repo, config }: RepoRunOptions) => {
  return await validateConfig({ repo, config });
};

const fullRepoRun = async ({ repo, config }: RepoRunOptions) => {
  const validate = await validateRepoConfig({
    repo,
    config,
  });
  const hasParseErrors = validate.parse.some((parse) => !parse.success);
  const hasRuleViolations = validate.validations.some((validation) => validation.hasViolation);
  if (!hasParseErrors && !hasRuleViolations) {
    await applyRepoConfig({ repo, config });
    await onValid({ repo, config });
  } else if (hasRuleViolations) {
    await onInvalid({ repo, config });
  }
  return {
    validate,
    hasRuleViolations,
    hasParseErrors,
  };
};

type RunAllReposOptions = {
  repos: Repo[];
  config: Config;
};

const runAllRepos = async ({ repos, config }: RunAllReposOptions) => {
  const results: {
    repo: Repo;
    result: Awaited<ReturnType<typeof fullRepoRun>>;
  }[] = [];

  for (const repo of repos) {
    const result = await fullRepoRun({ repo, config });
    results.push({
      repo,
      result,
    });
  }

  return results;
};

export { applyRepoConfig, validateRepoConfig, fullRepoRun, runAllRepos };
