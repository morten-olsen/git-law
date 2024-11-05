import { Command, program } from 'commander';
import { getRepoConfig } from '../../repo/repo.run.js';
import { Repo } from '../../repo/repo.js';
import { inspect } from 'util';
import { loadConfig } from '../../config/config.js';

const createRemote = (cmd: Command) => {
  cmd
    .command('get-config')
    .argument('<repo>')
    .action(async (repoName) => {
      const [owner, name] = repoName.split('/');
      const { config: configLocation } = program.opts();
      const config = await loadConfig(configLocation);
      const repo = new Repo({
        repoConfig: {},
        name,
        owner,
        config,
      });
      const result = await getRepoConfig({
        config,
        repo,
      });
      console.log(
        inspect(result, {
          depth: null,
          colors: true,
        }),
      );
    });
};

export { createRemote };
