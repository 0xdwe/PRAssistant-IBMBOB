import { RuleAnalysis, PRPacket, GitDiff, LLMAnalysis } from '@pr-ready/shared';

export class PRPacketGenerator {
  generate(diff: GitDiff, analysis: RuleAnalysis, llmAnalysis?: LLMAnalysis | null): PRPacket {
    const summary = this.generateSummary(diff, analysis, llmAnalysis);
    const checklist = this.generateChecklist(analysis);

    return {
      summary,
      filesChanged: analysis.categories,
      testStatus: analysis.testDetection,
      risks: analysis.risks,
      checklist,
      llmAnalysis: llmAnalysis || undefined,
      metadata: {
        baseBranch: diff.baseBranch,
        headBranch: diff.headBranch,
        totalFiles: diff.files.length,
        totalChanges: diff.totalChanges,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  generateMarkdown(packet: PRPacket): string {
    const sections: string[] = [];

    // Header
    sections.push('# PR Readiness Report\n');

    // Summary
    sections.push('## Summary\n');
    sections.push(packet.summary);
    sections.push('');

    // LLM Analysis (if available)
    if (packet.llmAnalysis) {
      sections.push('## AI Analysis\n');
      sections.push(packet.llmAnalysis.summary);
      sections.push('');
      
      if (packet.llmAnalysis.insights.length > 0) {
        sections.push('### Key Insights\n');
        for (const insight of packet.llmAnalysis.insights) {
          sections.push(`- ${insight}`);
        }
        sections.push('');
      }
      
      if (packet.llmAnalysis.suggestions && packet.llmAnalysis.suggestions.length > 0) {
        sections.push('### Suggestions\n');
        for (const suggestion of packet.llmAnalysis.suggestions) {
          sections.push(`- ${suggestion}`);
        }
        sections.push('');
      }
    }

    // Metadata
    sections.push('## Change Details\n');
    sections.push(`- **Base Branch**: \`${packet.metadata.baseBranch}\``);
    sections.push(`- **Head Branch**: \`${packet.metadata.headBranch}\``);
    sections.push(`- **Files Changed**: ${packet.metadata.totalFiles}`);
    sections.push(`- **Total Changes**: +${packet.metadata.totalChanges} lines`);
    sections.push(`- **Generated**: ${new Date(packet.metadata.generatedAt).toLocaleString()}`);
    sections.push('');

    // Files by Category
    sections.push('## Files Changed\n');
    if (packet.filesChanged.length === 0) {
      sections.push('_No files changed_\n');
    } else {
      for (const category of packet.filesChanged) {
        sections.push(`### ${this.formatCategoryName(category.name)} (${category.count})\n`);
        for (const file of category.files) {
          sections.push(`- \`${file}\``);
        }
        sections.push('');
      }
    }

    // Test Status
    sections.push('## Test Coverage\n');
    if (packet.testStatus.hasTests) {
      sections.push(`✅ **${packet.testStatus.testFiles.length} test file(s) modified**\n`);
      for (const testFile of packet.testStatus.testFiles) {
        sections.push(`- \`${testFile}\``);
      }
      sections.push('');
    } else if (packet.testStatus.missingTests) {
      sections.push('⚠️ **Warning: Source code changed but no test files modified**\n');
      sections.push('Please ensure appropriate tests are added or updated.\n');
    } else {
      sections.push('ℹ️ No source code changes detected (config/docs only)\n');
    }

    // Risk Flags
    sections.push('## Risk Assessment\n');
    if (packet.risks.length === 0) {
      sections.push('✅ No high-risk changes detected\n');
    } else {
      const highRisks = packet.risks.filter(r => r.level === 'high');
      const mediumRisks = packet.risks.filter(r => r.level === 'medium');
      const lowRisks = packet.risks.filter(r => r.level === 'low');

      if (highRisks.length > 0) {
        sections.push('### 🔴 High Risk\n');
        for (const risk of highRisks) {
          sections.push(`- **\`${risk.file}\`**: ${risk.reason}`);
        }
        sections.push('');
      }

      if (mediumRisks.length > 0) {
        sections.push('### 🟡 Medium Risk\n');
        for (const risk of mediumRisks) {
          sections.push(`- **\`${risk.file}\`**: ${risk.reason}`);
        }
        sections.push('');
      }

      if (lowRisks.length > 0) {
        sections.push('### 🟢 Low Risk\n');
        for (const risk of lowRisks) {
          sections.push(`- **\`${risk.file}\`**: ${risk.reason}`);
        }
        sections.push('');
      }
    }

    // Reviewer Checklist
    sections.push('## Reviewer Checklist\n');
    for (const item of packet.checklist) {
      sections.push(`- [ ] ${item}`);
    }
    sections.push('');

    return sections.join('\n');
  }

  private generateSummary(diff: GitDiff, analysis: RuleAnalysis, llmAnalysis?: LLMAnalysis | null): string {
    const parts: string[] = [];

    // Use LLM summary if available, otherwise use rule-based
    if (llmAnalysis?.summary) {
      return llmAnalysis.summary;
    }

    // Basic stats
    parts.push(`This PR modifies **${diff.files.length} file(s)** across **${analysis.categories.length} categor${analysis.categories.length === 1 ? 'y' : 'ies'}**.`);

    // Category breakdown
    const categoryNames = analysis.categories.map(c => `${c.name} (${c.count})`).join(', ');
    parts.push(`Changes include: ${categoryNames}.`);

    // Test status
    if (analysis.testDetection.hasTests) {
      parts.push(`Tests have been updated (${analysis.testDetection.testFiles.length} test file(s)).`);
    } else if (analysis.testDetection.missingTests) {
      parts.push('⚠️ No test changes detected despite source code modifications.');
    }

    // Risk summary
    const highRiskCount = analysis.risks.filter(r => r.level === 'high').length;
    if (highRiskCount > 0) {
      parts.push(`⚠️ Contains ${highRiskCount} high-risk change(s) requiring careful review.`);
    }

    return parts.join(' ');
  }

  private generateChecklist(analysis: RuleAnalysis): string[] {
    const checklist: string[] = [];

    // Standard items
    checklist.push('Code follows project style guidelines');
    checklist.push('Changes are well-documented');
    checklist.push('No unnecessary console.log or debug code');

    // Test-related
    if (analysis.testDetection.hasTests) {
      checklist.push('All tests pass locally');
      checklist.push('New tests cover edge cases');
    } else if (analysis.testDetection.sourceFilesChanged) {
      checklist.push('Tests added/updated for new functionality');
    }

    // Risk-specific items
    const hasDbChanges = analysis.risks.some(r => r.pattern === 'migrations/schema');
    if (hasDbChanges) {
      checklist.push('Database migrations are reversible');
      checklist.push('Migration tested on staging environment');
    }

    const hasAuthChanges = analysis.risks.some(r => r.pattern === 'auth/security');
    if (hasAuthChanges) {
      checklist.push('Security implications reviewed');
      checklist.push('Authentication flows tested');
    }

    const hasDependencyChanges = analysis.risks.some(r => r.pattern === 'dependencies');
    if (hasDependencyChanges) {
      checklist.push('Dependency changes reviewed for security vulnerabilities');
      checklist.push('Package lock file updated');
    }

    const hasConfigChanges = analysis.categories.some(c => c.name === 'config');
    if (hasConfigChanges) {
      checklist.push('Configuration changes documented');
      checklist.push('Environment variables updated if needed');
    }

    // Breaking changes
    checklist.push('No breaking changes (or documented in PR description)');

    return checklist;
  }

  private formatCategoryName(name: string): string {
    // Capitalize first letter and format common names
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
    
    const nameMap: Record<string, string> = {
      'Frontend': '🎨 Frontend',
      'Backend': '⚙️ Backend',
      'Tests': '🧪 Tests',
      'Docs': '📚 Documentation',
      'Config': '⚙️ Configuration',
      'Database': '🗄️ Database',
      'Tooling': '🔧 Tooling',
      'Root': '📁 Root',
    };

    return nameMap[formatted] || formatted;
  }
}

// Made with Bob
