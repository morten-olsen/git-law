import { z, ZodSchema } from 'zod';
import { RepoConfigSection } from '../config/repo/repo.section.js';
import { Octokit } from 'octokit';
import { Config } from '../config/config.js';

type RepoInstanceOptions = {
  repoConfig?: Record<string, unknown>;
  config: Config;
  owner: string;
  name: string;
};

type ConfigCacheItem = {
  requested?: unknown;
  actual: unknown;
  predicted?: unknown;
};

class Repo {
  #options: RepoInstanceOptions;
  #client: Octokit;
  #cache: Map<unknown, ConfigCacheItem>;

  constructor(options: RepoInstanceOptions) {
    this.#options = options;
    this.#cache = new Map<RepoConfigSection<string, ZodSchema>, ConfigCacheItem>();
    this.#client = new Octokit({
      auth: options.config.github?.token,
    });
  }

  public get client(): Octokit {
    return this.#client;
  }

  public get name() {
    return this.#options.name;
  }

  public get owner() {
    return this.#options.owner;
  }

  public get configs() {
    return this.#options.repoConfig || {};
  }

  public loadConfig = async () => {
    const content = await this.#client.rest.repos
      .getContent({
        path: this.#options.config.github.file,
        repo: this.name,
        owner: this.owner,
      })
      .then((result) => {
        if (!('type' in result.data) || result.data.type !== 'file') {
          throw new Error('Not a file');
        }
        return JSON.parse(Buffer.from(result.data.content, 'base64').toString('utf8'));
      })
      .catch(() => {
        return undefined;
      });
    if (content) {
      this.#options.config = content;
    }
  };

  public getConfig = async <const TName extends string, TSchema extends ZodSchema>(
    config: RepoConfigSection<TName, TSchema>,
  ) => {
    if (!this.#cache.has(config)) {
      const { repoConfig: configs = {} } = this.#options;
      const requestedRaw = configs[config.name];
      const requested = await config.schema.parseAsync(requestedRaw);
      const actual = await config.get({
        repo: this,
      });
      this.#cache.set(config, {
        requested,
        actual,
        predicted: config.predict
          ? await config.predict({
              requested,
              actual,
              repo: this,
            })
          : undefined,
      });
    }
    return this.#cache.get(config) as {
      actual?: z.infer<TSchema>;
      predicted?: z.infer<TSchema>;
      requested?: z.infer<TSchema>;
    };
  };
}

export { Repo };
