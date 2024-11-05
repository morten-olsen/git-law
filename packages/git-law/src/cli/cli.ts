import { program } from 'commander';
import { createLocal } from './local/local.js';
import { createRemote } from './remote/remote.js';
import { createRepoConfig } from './repo-config/repo-config.js';

program.option('-c,--config <config>', 'Config file', 'gitlaw.config.mjs');

createLocal(program.command('local'));
createRemote(program.command('remote'));
createRepoConfig(program.command('repo-config'));

await program.parseAsync(process.argv);
