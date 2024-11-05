import { program } from 'commander';
import { loadConfig } from '../config/config.js';
import { applyRepoConfig, getRepoConfig, validateRepoConfig } from '../repo/repo.run.js';
import { Repo } from '../repo/repo.js';
import { readFile, writeFile } from 'fs/promises';
import { getRepoConfigSchema } from '../config/config.utils.js';
import { resolve } from 'path';
import { inspect } from 'util';

program.option('-c,--config <config>', 'Config file', 'gitlaw.config.mjs');

const localCmd = program.command('local');

localCmd
  .command('validate')
  .argument('<file>')
  .option('-n,--name <name>')
  .option('-o,--owner <owner>')
  .action(async (file) => {
    const { config: configLocation, name, owner } = program.opts();
    const config = await loadConfig(configLocation);
    const repoConfig = JSON.parse(await readFile(file, 'utf8'));
    const repo = new Repo({
      repoConfig: repoConfig.configs || {},
      name,
      owner,
      config,
      exists: false,
    });
    const result = await validateRepoConfig({
      config,
      repo,
    });
    console.log('Configs');
    result.parse.forEach((parse) => {
      console.log(`${parse.success}: ${parse.section}`);
    });

    console.log('Rules');
    for (const validation of result.validations) {
      console.log(`${!validation.hasViolation}: ${validation.rule.name}`);
    }
  });

const localApplyCmd = localCmd
  .command('apply')
  .argument('<file>')
  .option('-n,--name <name>')
  .option('-o,--owner <owner>')
  .action(async (file) => {
    const { config: configLocation } = program.opts();
    const { owner, name } = localApplyCmd.opts();
    const config = await loadConfig(configLocation);
    const repoConfig = JSON.parse(await readFile(file, 'utf8'));
    const repo = new Repo({
      repoConfig: repoConfig.configs || {},
      name,
      owner,
      config,
      exists: false,
    });
    await applyRepoConfig({
      config,
      repo,
    });
    console.log('Done!');
  });

const remote = program.command('remote');

remote
  .command('get-config')
  .argument('<owner>')
  .argument('<repo>')
  .action(async (owner, name) => {
    const { config: configLocation } = program.opts();
    const config = await loadConfig(configLocation);
    const repo = new Repo({
      repoConfig: {},
      name,
      owner,
      config,
      exists: false,
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

const repoConfigCmd = program.command('repo-config');

const getSchemaCmd = repoConfigCmd
  .command('schema')
  .option('-o,--out <out>')
  .action(async () => {
    const { config: configLocation } = program.opts();
    const { out } = getSchemaCmd.opts();
    const config = await loadConfig(configLocation);
    const schema = getRepoConfigSchema(config);
    if (out) {
      await writeFile(resolve(out), JSON.stringify(schema, null, '  '), 'utf8');
    } else {
      process.stdout.write(JSON.stringify(schema, null, '  '));
    }
  });

await program.parseAsync(process.argv);
