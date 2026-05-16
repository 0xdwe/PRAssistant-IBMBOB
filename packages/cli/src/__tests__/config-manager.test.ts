import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConfigManager } from '../config-manager';
import { vol } from 'memfs';
import { fs } from 'memfs';
import { Config } from '@pr-ready/shared';

// Mock fs/promises
jest.mock('fs/promises', () => fs.promises);

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
    vol.reset();
  });

  describe('loadConfig', () => {
    it('should return default config when no config files exist', async () => {
      vol.fromJSON({}, '/test');

      const config = await configManager.loadConfig('/test');

      expect(config.llm?.provider).toBe('none');
      expect(config.test?.command).toBe('npm test');
      expect(config.output?.clipboard).toBe(true);
    });

    it('should load config from package.json prReady field', async () => {
      vol.fromJSON({
        '/test/package.json': JSON.stringify({
          name: 'test-project',
          prReady: {
            llm: {
              provider: 'openai',
              apiKey: 'test-key',
            },
          },
        }),
      });

      const config = await configManager.loadConfig('/test');

      expect(config.llm?.provider).toBe('openai');
      expect(config.llm?.apiKey).toBe('test-key');
    });

    it('should load config from .pr-ready.json', async () => {
      vol.fromJSON({
        '/test/.pr-ready.json': JSON.stringify({
          llm: {
            provider: 'anthropic',
            apiKey: 'anthropic-key',
          },
          test: {
            command: 'yarn test',
          },
        }),
      });

      const config = await configManager.loadConfig('/test');

      expect(config.llm?.provider).toBe('anthropic');
      expect(config.test?.command).toBe('yarn test');
    });

    it('should prioritize .pr-ready.json over package.json', async () => {
      vol.fromJSON({
        '/test/package.json': JSON.stringify({
          prReady: {
            llm: { provider: 'openai' },
          },
        }),
        '/test/.pr-ready.json': JSON.stringify({
          llm: { provider: 'anthropic' },
        }),
      });

      const config = await configManager.loadConfig('/test');

      expect(config.llm?.provider).toBe('anthropic');
    });

    it('should merge configs with defaults', async () => {
      vol.fromJSON({
        '/test/.pr-ready.json': JSON.stringify({
          llm: {
            provider: 'openai',
          },
        }),
      });

      const config = await configManager.loadConfig('/test');

      // Custom value
      expect(config.llm?.provider).toBe('openai');
      // Default values preserved
      expect(config.test?.command).toBe('npm test');
      expect(config.output?.clipboard).toBe(true);
    });
  });

  describe('mergeConfig', () => {
    it('should merge configs correctly', () => {
      const base: Config = {
        llm: { provider: 'none' },
        test: { command: 'npm test', patterns: ['*.test.ts'], timeout: 300000 },
        risks: { patterns: [] },
        output: { file: '.pr-ready.md', clipboard: true },
        monorepo: { enabled: false, packages: [] },
      };

      const override: Partial<Config> = {
        llm: { provider: 'openai', apiKey: 'key' },
        test: { command: 'yarn test' },
      };

      const result = configManager.mergeConfig(base, override);

      expect(result.llm?.provider).toBe('openai');
      expect(result.llm?.apiKey).toBe('key');
      expect(result.test?.command).toBe('yarn test');
      expect(result.test?.patterns).toEqual(['*.test.ts']); // Preserved from base
    });

    it('should handle partial overrides', () => {
      const base: Config = {
        llm: { provider: 'none' },
        test: { command: 'npm test', patterns: ['*.test.ts'], timeout: 300000 },
        risks: { patterns: [] },
        output: { file: '.pr-ready.md', clipboard: true },
        monorepo: { enabled: false, packages: [] },
      };

      const override: Partial<Config> = {
        output: { clipboard: false },
      };

      const result = configManager.mergeConfig(base, override);

      expect(result.output?.clipboard).toBe(false);
      expect(result.output?.file).toBe('.pr-ready.md'); // Preserved
    });
  });

  describe('applyCliFlags', () => {
    it('should override config with CLI flags', () => {
      const config: Config = {
        llm: { provider: 'none' },
        test: { command: 'npm test', patterns: [], timeout: 300000 },
        risks: { patterns: [] },
        output: { file: '.pr-ready.md', clipboard: true },
        monorepo: { enabled: false, packages: [] },
      };

      const flags: Partial<Config> = {
        llm: { provider: 'openai', apiKey: 'cli-key' },
        output: { clipboard: false },
      };

      const result = configManager.applyCliFlags(config, flags);

      expect(result.llm?.provider).toBe('openai');
      expect(result.llm?.apiKey).toBe('cli-key');
      expect(result.output?.clipboard).toBe(false);
    });
  });

  describe('validateConfig', () => {
    it('should accept valid config', () => {
      const config: Config = {
        llm: { provider: 'openai', apiKey: 'key' },
        test: { command: 'npm test', patterns: ['*.test.ts'], timeout: 300000 },
        risks: { patterns: ['migrations/'] },
        output: { file: 'output.md', clipboard: true },
        monorepo: { enabled: false, packages: [] },
      };

      expect(() => configManager.validateConfig(config)).not.toThrow();
    });

    it('should reject invalid LLM provider', () => {
      const config: Config = {
        llm: { provider: 'invalid' as any },
        test: { command: 'npm test', patterns: [], timeout: 300000 },
        risks: { patterns: [] },
        output: { file: 'output.md', clipboard: true },
        monorepo: { enabled: false, packages: [] },
      };

      expect(() => configManager.validateConfig(config)).toThrow('Invalid LLM provider');
    });

    it('should reject output file without .md extension', () => {
      const config: Config = {
        llm: { provider: 'none' },
        test: { command: 'npm test', patterns: [], timeout: 300000 },
        risks: { patterns: [] },
        output: { file: 'output.txt', clipboard: true },
        monorepo: { enabled: false, packages: [] },
      };

      expect(() => configManager.validateConfig(config)).toThrow('must have .md extension');
    });

    it('should reject non-array test patterns', () => {
      const config: Config = {
        llm: { provider: 'none' },
        test: { command: 'npm test', patterns: 'invalid' as any, timeout: 300000 },
        risks: { patterns: [] },
        output: { file: 'output.md', clipboard: true },
        monorepo: { enabled: false, packages: [] },
      };

      expect(() => configManager.validateConfig(config)).toThrow('Test patterns must be an array');
    });

    it('should reject non-array risk patterns', () => {
      const config: Config = {
        llm: { provider: 'none' },
        test: { command: 'npm test', patterns: [], timeout: 300000 },
        risks: { patterns: 'invalid' as any },
        output: { file: 'output.md', clipboard: true },
        monorepo: { enabled: false, packages: [] },
      };

      expect(() => configManager.validateConfig(config)).toThrow('Risk patterns must be an array');
    });

    it('should accept all valid LLM providers', () => {
      const providers = ['openai', 'anthropic', 'ollama', 'none'];

      providers.forEach(provider => {
        const config: Config = {
          llm: { provider: provider as any },
          test: { command: 'npm test', patterns: [], timeout: 300000 },
          risks: { patterns: [] },
          output: { file: 'output.md', clipboard: true },
          monorepo: { enabled: false, packages: [] },
        };

        expect(() => configManager.validateConfig(config)).not.toThrow();
      });
    });
  });

  describe('default config', () => {
    it('should have sensible defaults', async () => {
      vol.fromJSON({}, '/test');

      const config = await configManager.loadConfig('/test');

      expect(config.llm?.provider).toBe('none');
      expect(config.test?.command).toBe('npm test');
      expect(config.test?.timeout).toBe(300000);
      expect(config.test?.patterns).toContain('*.test.ts');
      expect(config.output?.file).toBe('.pr-ready.md');
      expect(config.output?.clipboard).toBe(true);
      expect(config.monorepo?.enabled).toBe(false);
      expect(config.risks?.patterns).toContain('migrations/');
    });
  });
});

// Made with Bob
