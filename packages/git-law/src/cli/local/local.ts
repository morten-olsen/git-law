import { Command, program } from 'commander';
import { validateRepoConfig, applyRepoConfig } from '../../repo/repo.run.js';
import { Repo } from '../../repo/repo.js';
import { loadConfig } from '../../config/config.js';
import { readFile } from 'fs/promises';

const createLocal = (cmd: Command) => {
  cmd
    .command('validate')
    .argument('<file>')
    .argument('<repo>')
    .action(async (file, repoName) => {
      const { config: configLocation } = program.opts();
      const [owner, name] = repoName.split('/');
      const config = await loadConfig(configLocation);
      const repoConfig = JSON.parse(await readFile(file, 'utf8'));
      const repo = new Repo({
        repoConfig: repoConfig.configs || {},
        name,
        owner,
        config,
      });
      await validateRepoConfig({
        config,
        repo,
      });
    });

  cmd
    .command('apply')
    .argument('<file>')
    .argument('<repo>')
    .action(async (file, repoName) => {
      const { config: configLocation } = program.opts();
      const [owner, name] = repoName.split('/');
      const config = await loadConfig(configLocation);
      const repoConfig = JSON.parse(await readFile(file, 'utf8'));
      const repo = new Repo({
        repoConfig: repoConfig.configs || {},
        name,
        owner,
        config,
      });
      await applyRepoConfig({
        config,
        repo,
      });
    });
};

export { createLocal };
