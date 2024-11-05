import { Config } from '../config/config.js';

type ScannerOptions = {
  config: Config;
};

class Scanner {
  _options: ScannerOptions;

  constructor(options: ScannerOptions) {
    this._options = options;
  }
}

export { Scanner };
