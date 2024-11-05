import { Rule } from './rule.js';

type RuleValidationOptions = {
  rule: Rule<string, any>;
};

type RuleViolation = {
  reason: string;
};

class RuleValidation {
  #options: RuleValidationOptions;
  #violations: RuleViolation[];

  constructor(options: RuleValidationOptions) {
    this.#options = options;
    this.#violations = [];
  }

  public get hasViolation() {
    return this.#violations.length > 0;
  }

  public get rule() {
    return this.#options.rule;
  }

  public addViolation = (violation: RuleViolation) => {
    this.#violations.push(violation);
  };
}

export { RuleValidation };
