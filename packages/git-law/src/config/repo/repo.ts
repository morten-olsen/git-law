import { RepoConfigSection } from './repo.section.js';

type RepoConfigOptions = {
  sections: RepoConfigSection<string, any>[];
};

class RepoConfig {
  #options: RepoConfigOptions;

  constructor(options: RepoConfigOptions) {
    this.#options = options;
  }

  public get sections() {
    const { sections } = this.#options;
    return sections;
  }
}

export { RepoConfig };
