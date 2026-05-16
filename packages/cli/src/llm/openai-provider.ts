import OpenAI from 'openai';
import { GitDiff, LLMProvider, LLMAnalysis } from '@pr-ready/shared';
import { SmartTruncator } from './smart-truncator';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI | null = null;
  private model: string;
  private apiKey: string | undefined;
  private timeout: number = 30000; // 30 seconds
  private truncator: SmartTruncator;

  constructor(apiKey?: string, model: string = 'gpt-4') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.model = model;
    this.truncator = new SmartTruncator({ maxTokens: 100000 });

    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        timeout: this.timeout,
      });
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client;
  }

  async analyze(diff: GitDiff): Promise<LLMAnalysis> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI provider is not configured. Set OPENAI_API_KEY environment variable or provide API key in config.');
    }

    try {
      // Apply smart truncation before sending to API
      const truncationResult = this.truncator.truncate(diff);
      
      // Log truncation warnings if any
      if (truncationResult.wasTruncated) {
        console.warn('\n' + this.truncator.getSummary(truncationResult) + '\n');
      }

      const prompt = this.buildPrompt(truncationResult.diff);
      
      const completion = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior software engineer reviewing code changes. Provide concise, actionable insights about the changes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI API');
      }

      return this.parseResponse(response);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private buildPrompt(diff: GitDiff): string {
    const filesList = diff.files.map(f => 
      `- ${f.path} (${f.status}): +${f.additions} -${f.deletions}`
    ).join('\n');

    const changesPreview = diff.files
      .slice(0, 5) // Limit to first 5 files to avoid token limits
      .map(f => `\n### ${f.path}\n${f.changes.slice(0, 500)}`) // Limit each file's changes
      .join('\n');

    return `Analyze this pull request:

**Branch:** ${diff.baseBranch} → ${diff.headBranch}
**Total Changes:** ${diff.totalChanges} lines (+${diff.additions} -${diff.deletions})
**Files Changed:** ${diff.files.length}

**Files:**
${filesList}

**Sample Changes:**
${changesPreview}

Provide:
1. A concise summary (2-3 sentences) of what this PR does
2. 3-5 key insights about the changes
3. 3-5 specific changes that reviewers should focus on
4. 2-4 context-specific checklist items for reviewers (things specific to these changes, not generic items)

Format your response as:
SUMMARY: [your summary]
INSIGHTS:
- [insight 1]
- [insight 2]
KEY_CHANGES:
- [change 1]
- [change 2]
CHECKLIST:
- [specific item 1]
- [specific item 2]`;
  }

  private parseResponse(response: string): LLMAnalysis {
    const lines = response.split('\n').filter(line => line.trim());
    
    let summary = '';
    const insights: string[] = [];
    const keyChanges: string[] = [];
    const checklistItems: string[] = [];
    
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('SUMMARY:')) {
        summary = trimmed.replace('SUMMARY:', '').trim();
        currentSection = 'summary';
      } else if (trimmed === 'INSIGHTS:') {
        currentSection = 'insights';
      } else if (trimmed === 'KEY_CHANGES:') {
        currentSection = 'keyChanges';
      } else if (trimmed === 'CHECKLIST:') {
        currentSection = 'checklist';
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        const content = trimmed.replace(/^[-•]\s*/, '').trim();
        if (currentSection === 'insights' && content) {
          insights.push(content);
        } else if (currentSection === 'keyChanges' && content) {
          keyChanges.push(content);
        } else if (currentSection === 'checklist' && content) {
          checklistItems.push(content);
        }
      } else if (currentSection === 'summary' && trimmed) {
        summary += ' ' + trimmed;
      }
    }

    // Fallback if parsing fails
    if (!summary) {
      summary = response.split('\n')[0] || 'Code changes analyzed';
    }
    if (insights.length === 0) {
      insights.push('Review the changes carefully');
    }
    if (keyChanges.length === 0) {
      keyChanges.push('Check all modified files');
    }

    return {
      summary: summary.trim(),
      insights,
      keyChanges,
      checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
    };
  }

  private handleError(error: any): never {
    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable or config.');
    }
    
    if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later or upgrade your plan.');
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Network error: Unable to connect to OpenAI API. Please check your internet connection.');
    }
    
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      throw new Error('OpenAI API request timed out after 30 seconds. Please try again.');
    }

    // Generic error
    throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
  }
}

// Made with Bob