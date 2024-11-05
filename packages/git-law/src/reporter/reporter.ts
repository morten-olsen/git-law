import { Repo } from '../repo/repo.js';
import { ValidationResponse } from '../repo/repo.run.js';

type ReporterInput = {
  repo: Repo;
  result: ValidationResponse;
};

type Reporter = {
  create: (input: ReporterInput[]) => Promise<{
    console?: string;
    files?: Record<string, string>;
  }>;
};

const createReporter = (reporter: Reporter) => reporter;

export { createReporter, type Reporter };
