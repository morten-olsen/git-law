import { Command, program } from 'commander';
import { loadConfig } from '../../config/config.js';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { getRepoConfigSchema } from '../../config/config.utils.js';

const createRepoConfig = (cmd: Command) => {
  const getSchemaCmd = cmd
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
};

export { createRepoConfig };
