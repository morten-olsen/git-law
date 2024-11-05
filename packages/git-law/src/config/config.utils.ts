import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Config } from './config.js';

const getSchema = (config: Config) => {
  const schema = z.object(
    Object.fromEntries(config.sections.map((section) => [section.name, section.schema.optional()])),
  );
  return zodToJsonSchema(schema, 'github-config');
};

export { getSchema as getRepoConfigSchema };