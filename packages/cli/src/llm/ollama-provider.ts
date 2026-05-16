import { GitDiff, LLMProvider, LLMAnalysis } from '@pr-ready/shared';
import { SmartTruncator } from './smart-truncator';

export class OllamaProvider implements LLMProvider {
  private endpoint: string;
  private model: string;
  private timeout: number = 60000; // 60 seconds (local models are slower)
  private truncator: SmartTruncator;

  constructor(endpoint?: string, model: string = 'codellama') {
    this.endpoint = endpoint || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    this.model = model;
    this.truncator = new SmartTruncator({ maxTokens: 100000 });
  }

  isConfigured(): boolean {
    // Ollama doesn't require API key, just needs to be running
    return true;
  }

  async analyze(diff: GitDiff): Promise<LLMAnalysis> {
    // Check if Ollama is running
    await this.checkOllamaRunning();

    try {
      // Apply smart truncation before sending to API
      const truncationResult = this.truncator.truncate(diff);
      
      // Log truncation warnings if any
      if (truncationResult.wasTruncated) {
        console.warn('\n' + this.truncator.getSummary(truncationResult) + '\n');
      }

      const prompt = this.buildPrompt(truncationResult.diff);
      
      const response = await this.generateCompletion(prompt);

      return this.parseResponse(response);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private async checkOllamaRunning(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

      const response = await fetch(`${this.endpoint}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama server returned status ${response.status}`);
      }

      // Check if the model is available
      const data = await response.json() as { models?: Array<{ name: string }> };
      const models = data.models || [];
      const modelExists = models.some((m) => m.name.includes(this.model));

      if (!modelExists) {
        console.warn(`\nWarning: Model '${this.model}' not found in Ollama.`);
        console.warn(`Available models: ${models.map((m: any) => m.name).join(', ') || 'none'}`);
        console.warn(`Ollama will attempt to pull the model automatically.\n`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(
          `Cannot connect to Ollama server at ${this.endpoint}.\n` +
          `Please ensure Ollama is running:\n` +
          `  1. Install Ollama from https://ollama.ai\n` +
          `  2. Run: ollama serve\n` +
          `  3. Pull a model: ollama pull ${this.model}`
        );
      }

      if (error.code === 'ECONNREFUSED') {
        throw new Error(
          `Ollama server is not running at ${this.endpoint}.\n` +
          `Please start Ollama:\n` +
          `  1. Run: ollama serve\n` +
          `  2. Or start Ollama desktop app`
        );
      }

      throw new Error(`Failed to connect to Ollama: ${error.message}`);
    }
  }

  private async generateCompletion(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 1000, // Max tokens to generate
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as { response?: string };
      
      if (!data.response) {
        throw new Error('No response from Ollama API');
      }

      return data.response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(
          `Ollama request timed out after ${this.timeout / 1000} seconds.\n` +
          `Local models can be slow. Consider:\n` +
          `  1. Using a smaller model\n` +
          `  2. Reducing the diff size\n` +
          `  3. Upgrading your hardware`
        );
      }

      throw error;
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

    return `You are a senior software engineer reviewing code changes. Provide concise, actionable insights about the changes.

Analyze this pull request:

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
    // Handle specific Ollama errors
    if (error.message?.includes('Cannot connect to Ollama')) {
      throw error; // Already formatted
    }

    if (error.message?.includes('not running')) {
      throw error; // Already formatted
    }

    if (error.message?.includes('timed out')) {
      throw error; // Already formatted
    }

    if (error.code === 'ENOTFOUND') {
      throw new Error(
        `Cannot resolve Ollama endpoint: ${this.endpoint}\n` +
        `Please check your OLLAMA_ENDPOINT configuration.`
      );
    }

    // Generic error
    throw new Error(`Ollama error: ${error.message || 'Unknown error'}`);
  }
}

// Made with Bob