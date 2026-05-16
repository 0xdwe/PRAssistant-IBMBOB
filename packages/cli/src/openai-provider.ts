
import OpenAI from 'openai';
import { GitDiff, LLMProvider, LLMAnalysis, Config } from '@pr-ready/shared';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;
  private timeout: number;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    // Initialize OpenAI client with custom baseURL
    const apiKey = config.llm?.apiKey || 'sk-no-key-required';
    const baseURL = config.llm?.baseURL || 'https://rqhse4n.9router.com/v1';
    
    this.client = new OpenAI({
      baseURL: baseURL,
      apiKey: apiKey,
      timeout: 30000,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'User-Agent': 'PRAssistant/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    this.model = config.llm?.model || 'gpt-4';
    this.timeout = 30000;
    
    console.log(`[LLM] Initialized with baseURL: ${baseURL}, model: ${this.model}`);
    console.log(`[LLM] Using API key: ${apiKey.substring(0, 10)}...`);
  }

  isConfigured(): boolean {
    return !!(this.config.llm?.apiKey || this.config.llm?.baseURL);
  }

  async analyze(diff: GitDiff): Promise<LLMAnalysis> {
    try {
      // Build a concise prompt with the git diff information
      const prompt = this.buildPrompt(diff);

      console.log(`[LLM] Sending request to model: ${this.model}`);
      console.log(`[LLM] Prompt length: ${prompt.length} characters`);

      // Call OpenAI API with timeout
      const response = await Promise.race([
        this.client.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a senior software engineer reviewing code changes. Provide concise, actionable insights about the changes.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
        this.createTimeout(),
      ]);

      if (!response || typeof response === 'string') {
        throw new Error('Request timed out');
      }

      console.log(`[LLM] Received response from model`);

      // Parse the response
      const content = response.choices[0]?.message?.content || '';
      return this.parseResponse(content);
    } catch (error) {
      console.error(`[LLM] Error details:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          throw new Error(`LLM request timed out after ${this.timeout}ms`);
        }
        if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
          throw new Error('Failed to connect to LLM service. Please check your network connection.');
        }
        // Include more details from the error
        const errorDetails = (error as any).response?.data || error.message;
        throw new Error(`LLM analysis failed: ${JSON.stringify(errorDetails)}`);
      }
      throw new Error('LLM analysis failed with unknown error');
    }
  }

  private buildPrompt(diff: GitDiff): string {
    const filesList = diff.files
      .map(f => `- ${f.path} (${f.status}, +${f.additions}/-${f.deletions})`)
      .join('\n');

    const changesPreview = diff.files
      .slice(0, 5) // Limit to first 5 files to avoid token limits
      .map(f => {
        const preview = f.changes.split('\n').slice(0, 20).join('\n'); // First 20 lines
        return `\n### ${f.path}\n${preview}`;
      })
      .join('\n');

    return `Analyze this git diff and provide a semantic summary.

**Branch:** ${diff.baseBranch} → ${diff.headBranch}
**Total Changes:** ${diff.totalChanges} lines (+${diff.additions}/-${diff.deletions})
**Files Changed:** ${diff.files.length}

**Files:**
${filesList}

**Changes Preview:**
${changesPreview}

Please provide:
1. A concise summary (2-3 sentences) of what changed
2. Key insights about the changes (3-5 bullet points)
3. Any potential concerns or suggestions (optional)

Format your response as:
SUMMARY: [your summary]
INSIGHTS:
- [insight 1]
- [insight 2]
...
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
...`;
  }

  private parseResponse(content: string): LLMAnalysis {
    const lines = content.split('\n').filter(line => line.trim());
    
    let summary = '';
    const insights: string[] = [];
    const keyChanges: string[] = [];
    
    let currentSection: 'summary' | 'insights' | 'suggestions' | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('SUMMARY:')) {
        currentSection = 'summary';
        summary = trimmed.replace('SUMMARY:', '').trim();
      } else if (trimmed.startsWith('INSIGHTS:')) {
        currentSection = 'insights';
      } else if (trimmed.startsWith('SUGGESTIONS:')) {
        currentSection = 'suggestions';
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        const item = trimmed.replace(/^[-•]\s*/, '').trim();
        if (currentSection === 'insights' && item) {
          insights.push(item);
        } else if (currentSection === 'suggestions' && item) {
          keyChanges.push(item);
        }
      } else if (currentSection === 'summary' && trimmed) {
        summary += ' ' + trimmed;
      }
    }

    // Fallback if parsing fails
    if (!summary) {
      summary = content.split('\n').slice(0, 3).join(' ').trim();
    }
    if (insights.length === 0) {
      insights.push('Code changes detected');
    }

    return {
      summary: summary || 'Changes analyzed',
      insights,
      keyChanges,
    };
  }

  private createTimeout(): Promise<string> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out'));
      }, this.timeout);
    });
  }
}
