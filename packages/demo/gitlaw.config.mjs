import 'dotenv/config';
import all from 'git-law/configs/all';
import requireTsConfigExtends from './rules/require-tsconfig-extends.mjs';
import tsconfig from './configs/tsconfig.mjs';

/** @type {import('git-law').Configuration} */
const config = {
  github: {
    token: process.env.GITHUB_TOKEN,
  },
  configs: [...all, tsconfig],
  rules: [
    // [
    //   requireTsConfigExtends,
    //   {
    //     shouldExtend: 'foobar',
    //   },
    // ],
  ],
};

export { config };
