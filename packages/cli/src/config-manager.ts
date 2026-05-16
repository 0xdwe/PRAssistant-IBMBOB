
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Config } from '@pr-ready/shared';

export class ConfigManager {
  private defaultConfig: Config = {
    llm: {
      provider: 'none',
    },
    test: {
      command: 'npm test',
      patterns: ['*.test.ts', '*.spec.ts', '*.test.js', '*.spec.js', '__tests__/'],
      timeout: 300000, // 5 minutes
    },
    risks: {
      patterns: [
        'migrations/',
        'schema/',
        'auth/',
        'security/',
        '*.config.js',
        '*.config.ts',
        'package.json',
      ],
    },
    output: {
      file: '.pr-ready.md',
      clipboard: true,
    },
    monorepo: {
      enabled: false,
      packages: ['packages/*'],
    },
  };

  async loadConfig(cwd: string = process.cwd()): Promise<Config> {
    let config = { ...this.defaultConfig };

    // Try loading from package.json first
    try {
      const packageJsonPath = join(cwd, 'package.json');
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
      
      if (packageJson.prReady) {
        config = this.mergeConfig(config, packageJson.prReady);
      }
    } catch (error) {
      // package.json not found or no prReady field, continue
    }

    // Try loading from .pr-ready.json
    try {
      const configPath = join(cwd, '.pr-ready.json');
      const fileConfig = JSON.parse(await readFile(configPath, 'utf-8'));
      config = this.mergeConfig(config, fileConfig);
    } catch (error) {
      // .pr-ready.json not found, use defaults
    }

    return config;
  }

  mergeConfig(base: Config, override: Partial<Config>): Config {
    return {
      llm: { ...base.llm, ...override.llm },
      test: { ...base.test, ...override.test },
      risks: { ...base.risks, ...override.risks },
      output: { ...base.output, ...override.output },
      monorepo: { ...base.monorepo, ...override.monorepo },
    };
  }

  applyCliFlags(config: Config, flags: Partial<Config>): Config {
    // CLI flags override config values
    return this.mergeConfig(config, flags);
  }

  validateConfig(config: Config): void {
    // Validate LLM provider
    if (config.llm?.provider && 
        !['openai', 'anthropic', 'ollama', 'none'].includes(config.llm.provider)) {
      throw new Error(
        `Invalid LLM provider: ${config.llm.provider}. Must be one of: openai, anthropic, ollama, none`
      );
    }

    // Validate output file path
    if (config.output?.file && !config.output.file.endsWith('.md')) {
      throw new Error('Output file must have .md extension');
    }

    // Validate test patterns
    if (config.test?.patterns && !Array.isArray(config.test.patterns)) {
      throw new Error('Test patterns must be an array');
    }

    // Validate risk patterns
    if (config.risks?.patterns && !Array.isArray(config.risks.patterns)) {
      throw new Error('Risk patterns must be an array');
    }
  }
}
