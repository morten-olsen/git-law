import { createReporter } from '../../reporter/reporter.js';

export default createReporter({
  create: async (input) => {
    const sections = input.map((current) => {
      return [
        '<details>',
        `<summary>${!current.result.hasRuleViolations && !current.result.hasParseErrors ? '✅' : '❌'} <code>${current.repo.owner}/${current.repo.name}</code></summary>`,
        '',
        '## Parsing',
        '',
        `Valid: ${!current.result.hasParseErrors ? '✅' : '❌'}`,
        '',
        '| status | config section | error |',
        '| -- | -- | -- |',
        ...current.result.parse.flatMap((status) => [
          `| ${status.success ? '✅' : '❌'} | ${status.section} | ${status.error ? JSON.stringify(status.error) : ''} |`,
        ]),
        '',
        '## Rules',
        '',
        `Valid: ${!current.result.hasRuleViolations ? '✅' : '❌'}`,
        '',
        '### Violations',
        '',
        '| rule | reason |',
        '| -- | -- |',
        ...current.result.validations.flatMap((validation) =>
          validation.violations.map((violation) => `| ${validation.rule.name} | ${violation.reason} |`),
        ),
        '</details>',
      ].join('\n');
    });
    return {
      files: {
        'result.md': ['# Result', ...sections].join('\n\n'),
      },
    };
  },
});
