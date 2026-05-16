import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { OpenAIProvider } from '../openai-provider';
import { GitDiff } from '@pr-ready/shared';
import nock from 'nock';

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  const mockApiKey = 'test-api-key';

  const mockDiff: GitDiff = {
    files: [
      { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: 'diff content' },
    ],
    baseBranch: 'main',
    headBranch: 'feature',
    totalChanges: 1,
    additions: 10,
    deletions: 5,
  };

  beforeEach(() => {
    nock.cleanAll();
    provider = new OpenAIProvider(mockApiKey);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('isConfigured', () => {
    it('should return true when API key is provided', () => {
      expect(provider.isConfigured()).toBe(true);
    });

    it('should return false when API key is missing', () => {
      const unconfiguredProvider = new OpenAIProvider('');
      expect(unconfiguredProvider.isConfigured()).toBe(false);
    });
  });

  describe('analyze', () => {
    it('should analyze diff and return LLM analysis', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Updated application logic',
                insights: ['Improved error handling', 'Added new feature'],
                keyChanges: ['Modified src/app.ts'],
                checklistItems: ['Test error scenarios', 'Verify new feature'],
              }),
            },
          },
        ],
      };

      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      const result = await provider.analyze(mockDiff);

      expect(result.summary).toBe('Updated application logic');
      expect(result.insights).toHaveLength(2);
      expect(result.keyChanges).toHaveLength(1);
      expect(result.checklistItems).toHaveLength(2);
    });

    it('should throw error when not configured', async () => {
      const unconfiguredProvider = new OpenAIProvider('');

      await expect(unconfiguredProvider.analyze(mockDiff)).rejects.toThrow(
        'OpenAI API key not configured'
      );
    });

    it('should handle API errors', async () => {
      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(500, { error: 'Internal server error' });

      await expect(provider.analyze(mockDiff)).rejects.toThrow();
    });

    it('should handle rate limiting', async () => {
      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(429, { error: 'Rate limit exceeded' });

      await expect(provider.analyze(mockDiff)).rejects.toThrow();
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Invalid JSON',
            },
          },
        ],
      };

      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      await expect(provider.analyze(mockDiff)).rejects.toThrow();
    });

    it('should use custom model when specified', async () => {
      const customProvider = new OpenAIProvider(mockApiKey, 'gpt-3.5-turbo');

      nock('https://api.openai.com')
        .post('/v1/chat/completions', (body: any) => {
          return body.model === 'gpt-3.5-turbo';
        })
        .reply(200, {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: 'Test',
                  insights: [],
                  keyChanges: [],
                }),
              },
            },
          ],
        });

      await customProvider.analyze(mockDiff);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .replyWithError('Network error');

      await expect(provider.analyze(mockDiff)).rejects.toThrow();
    });

    it('should handle timeout', async () => {
      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .delayConnection(60000)
        .reply(200, {});

      await expect(provider.analyze(mockDiff)).rejects.toThrow();
    }, 10000);

    it('should handle authentication errors', async () => {
      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(401, { error: 'Invalid API key' });

      await expect(provider.analyze(mockDiff)).rejects.toThrow();
    });
  });
});

// Made with Bob
