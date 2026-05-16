
import { GitDiff, HybridAnalysis, LLMProvider, Config } from '@pr-ready/shared';
import { RuleBasedAnalyzer } from './rule-based-analyzer';
import { OpenAIProvider } from './llm/openai-provider';
import { AnthropicProvider } from './llm/anthropic-provider';
import { OllamaProvider } from './llm/ollama-provider';
import { CacheManager } from './cache-manager';

export class HybridAnalyzer {
  private ruleAnalyzer: RuleBasedAnalyzer;
  private llmProvider: LLMProvider | null = null;
  private cacheManager: CacheManager;
  private config?: Config;

  constructor(config?: Config, useCache: boolean = true) {
    this.ruleAnalyzer = new RuleBasedAnalyzer();
    this.config = config;
    this.cacheManager = new CacheManager('.pr-ready-cache', useCache);
    
    // Initialize LLM provider if configured
    if (config?.llm?.provider && config.llm.provider !== 'none') {
      this.llmProvider = this.createLLMProvider(config);
    }
  }

  private createLLMProvider(config: Config): LLMProvider | null {
    const provider = config.llm?.provider;
    
    switch (provider) {
      case 'openai':
        return new OpenAIProvider(config.llm?.apiKey, config.llm?.model);
      case 'anthropic':
        return new AnthropicProvider(config.llm?.apiKey, config.llm?.model);
      case 'ollama':
        return new OllamaProvider(config.llm?.endpoint, config.llm?.model);
      default:
        return null;
    }
  }

  async analyze(diff: GitDiff): Promise<HybridAnalysis> {
    // Always run rule-based analysis first
    const ruleAnalysis = this.ruleAnalyzer.analyze(diff);

    // Create base hybrid analysis with rule-based results
    const hybridAnalysis: HybridAnalysis = {
      ...ruleAnalysis,
    };

    // Optionally run LLM analysis if provider is configured
    if (this.llmProvider && this.llmProvider.isConfigured()) {
      try {
        // Try to get cached result first
        const cachedAnalysis = await this.cacheManager.get(diff, this.config);
        
        if (cachedAnalysis) {
          // Cache hit - use cached result
          hybridAnalysis.llmAnalysis = cachedAnalysis;
          
          // Enhance file categorization with LLM insights
          this.enhanceCategories(hybridAnalysis, cachedAnalysis);
          
          // Enhance risk flags with LLM context
          this.enhanceRisks(hybridAnalysis, cachedAnalysis);
        } else {
          // Cache miss - run LLM analysis
          console.log('Running LLM analysis...');
          const llmAnalysis = await this.llmProvider.analyze(diff);
          
          // Save to cache
          await this.cacheManager.set(diff, llmAnalysis, this.config);
          
          // Merge LLM analysis into hybrid result
          hybridAnalysis.llmAnalysis = llmAnalysis;
          
          // Enhance file categorization with LLM insights
          this.enhanceCategories(hybridAnalysis, llmAnalysis);
          
          // Enhance risk flags with LLM context
          this.enhanceRisks(hybridAnalysis, llmAnalysis);
          
          console.log('✓ LLM analysis completed');
        }
      } catch (error) {
        // LLM error doesn't break analysis - strict fail with clear message
        const errorMessage = error instanceof Error ? error.message : 'Unknown LLM error';
        hybridAnalysis.llmError = errorMessage;
        console.error(`✗ LLM analysis failed: ${errorMessage}`);
        console.log('Continuing with rule-based analysis only...');
      }
    }

    return hybridAnalysis;
  }

  private enhanceCategories(hybridAnalysis: HybridAnalysis, llmAnalysis: any): void {
    // LLM enhances file categorization with purpose descriptions
    // This is done by adding context from LLM insights to categories
    // The structure remains rule-based, but we can add metadata
    
    // For now, we keep the rule-based structure intact
    // Future enhancement: Add purpose field to FileCategory type
    // and populate it with LLM-generated descriptions
  }

  private enhanceRisks(hybridAnalysis: HybridAnalysis, llmAnalysis: any): void {
    // LLM adds context to risk flags
    // Check if LLM identified any key changes that relate to existing risks
    
    if (!llmAnalysis.keyChanges || llmAnalysis.keyChanges.length === 0) {
      return;
    }

    // Add LLM context to existing risks by matching patterns
    for (const risk of hybridAnalysis.risks) {
      // Find related key changes from LLM
      const relatedChanges = llmAnalysis.keyChanges.filter((change: string) => {
        const changeLower = change.toLowerCase();
        const fileLower = risk.file.toLowerCase();
        
        // Match if the change mentions the file or related keywords
        return changeLower.includes(fileLower) || 
               changeLower.includes(risk.pattern) ||
               (risk.pattern === 'auth/security' && (changeLower.includes('auth') || changeLower.includes('security'))) ||
               (risk.pattern === 'migrations/schema' && (changeLower.includes('database') || changeLower.includes('migration'))) ||
               (risk.pattern === 'dependencies' && (changeLower.includes('package') || changeLower.includes('dependency')));
      });

      // If LLM provided context, we could enhance the reason
      // For now, the structure remains as-is
      // Future enhancement: Add llmContext field to RiskFlag type
    }
  }

  /**
   * Check if LLM analysis is enabled and configured
   */
  isLLMEnabled(): boolean {
    return this.llmProvider !== null && this.llmProvider.isConfigured();
  }
}
