import 'dotenv/config';
import all from 'git-law/configs/all';
import markdown from 'git-law/reporters/markdown';
import packageJsonConfig from './configs/packagejson.mjs';
import packageJsonLicenseRule from './rules/packagejson/license.mjs';

/** @type {import('git-law').Configuration} */
const config = {
  github: {
    token: process.env.GITHUB_TOKEN,
  },
  configs: [...all, packageJsonConfig],
  rules: [
    [
      packageJsonLicenseRule,
      {
        mustSpecifyLicense: true,
        allowedLicenses: ['GPL-3.0-only'],
      },
    ],
  ],
  reporters: [markdown],
};

export { config };
