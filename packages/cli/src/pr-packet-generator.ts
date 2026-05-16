import { RuleAnalysis, HybridAnalysis, PRPacket, GitDiff, TestResult, MonorepoDetection } from '@pr-ready/shared';

export class PRPacketGenerator {
  generate(
    diff: GitDiff,
    analysis: RuleAnalysis | HybridAnalysis,
    testResults?: TestResult,
    monorepo?: MonorepoDetection
  ): PRPacket {
    const summary = this.generateSummary(diff, analysis, monorepo);
    const hybridAnalysis = 'llmAnalysis' in analysis ? analysis : undefined;
    const checklist = this.generateChecklist(analysis, hybridAnalysis);

    return {
      summary,
      filesChanged: analysis.categories,
      testStatus: analysis.testDetection,
      testResults,
      risks: analysis.risks,
      checklist,
      monorepo,
      metadata: {
        baseBranch: diff.baseBranch,
        headBranch: diff.headBranch,
        totalFiles: diff.files.length,
        totalChanges: diff.totalChanges,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  generateMarkdown(packet: PRPacket, hybridAnalysis?: HybridAnalysis): string {
    const sections: string[] = [];

    // Header
    sections.push('# PR Readiness Report\n');

    // LLM Summary (if available)
    if (hybridAnalysis?.llmAnalysis) {
      sections.push('## AI Summary\n');
      sections.push(hybridAnalysis.llmAnalysis.summary);
      sections.push('');

      // Key Insights
      if (hybridAnalysis.llmAnalysis.insights.length > 0) {
        sections.push('### Key Insights\n');
        for (const insight of hybridAnalysis.llmAnalysis.insights) {
          sections.push(`- ${insight}`);
        }
        sections.push('');
      }

      // Key Changes to Review
      if (hybridAnalysis.llmAnalysis.keyChanges.length > 0) {
        sections.push('### Key Changes to Review\n');
        for (const change of hybridAnalysis.llmAnalysis.keyChanges) {
          sections.push(`- ${change}`);
        }
        sections.push('');
      }
    }

    // Rule-based Summary
    sections.push('## Summary\n');
    sections.push(packet.summary);
    sections.push('');

    // Metadata
    sections.push('## Change Details\n');
    sections.push(`- **Base Branch**: \`${packet.metadata.baseBranch}\``);
    sections.push(`- **Head Branch**: \`${packet.metadata.headBranch}\``);
    sections.push(`- **Files Changed**: ${packet.metadata.totalFiles}`);
    sections.push(`- **Total Changes**: +${packet.metadata.totalChanges} lines`);
    sections.push(`- **Generated**: ${new Date(packet.metadata.generatedAt).toLocaleString()}`);
    
    // Monorepo info
    if (packet.monorepo?.isMonorepo && packet.monorepo.affectedPackages.length > 0) {
      sections.push(`- **Affected Packages**: ${packet.monorepo.affectedPackages.join(', ')}`);
    }
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

    // Test Execution Results
    if (packet.testResults) {
      sections.push('## Test Execution Results\n');
      if (packet.testResults.passed) {
        sections.push(`✅ **All tests passed**\n`);
        sections.push(`- Total: ${packet.testResults.totalTests} test(s)`);
        sections.push(`- Passed: ${packet.testResults.passedTests}`);
        if (packet.testResults.skippedTests) {
          sections.push(`- Skipped: ${packet.testResults.skippedTests}`);
        }
        sections.push(`- Duration: ${(packet.testResults.duration / 1000).toFixed(2)}s`);
      } else {
        sections.push(`❌ **Tests failed**\n`);
        sections.push(`- Total: ${packet.testResults.totalTests} test(s)`);
        sections.push(`- Passed: ${packet.testResults.passedTests}`);
        sections.push(`- Failed: ${packet.testResults.failedTests}`);
        if (packet.testResults.skippedTests) {
          sections.push(`- Skipped: ${packet.testResults.skippedTests}`);
        }
        sections.push(`- Duration: ${(packet.testResults.duration / 1000).toFixed(2)}s`);
        if (packet.testResults.error) {
          sections.push(`\n**Error**: ${packet.testResults.error}`);
        }
      }
      sections.push('');
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

  private generateSummary(diff: GitDiff, analysis: RuleAnalysis | HybridAnalysis, monorepo?: MonorepoDetection): string {
    const parts: string[] = [];

    // Basic stats
    parts.push(`This PR modifies **${diff.files.length} file(s)** across **${analysis.categories.length} categor${analysis.categories.length === 1 ? 'y' : 'ies'}**.`);

    // Monorepo info
    if (monorepo?.isMonorepo && monorepo.affectedPackages.length > 0) {
      parts.push(`Affects **${monorepo.affectedPackages.length} package(s)**: ${monorepo.affectedPackages.join(', ')}.`);
    }

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

  private generateChecklist(analysis: RuleAnalysis | HybridAnalysis, hybridAnalysis?: HybridAnalysis): string[] {
    const allItems: Array<{ item: string; priority: number }> = [];

    // Template items with priority (lower number = higher priority)
    // Priority 1: Critical items (tests, breaking changes)
    if (analysis.testDetection.hasTests) {
      allItems.push({ item: 'All tests pass locally', priority: 1 });
    } else if (analysis.testDetection.sourceFilesChanged) {
      allItems.push({ item: 'Tests added/updated for new functionality', priority: 1 });
    }
    
    allItems.push({ item: 'No breaking changes (or documented in PR description)', priority: 1 });

    // Priority 2: High-risk specific items
    const hasDbChanges = analysis.risks.some(r => r.pattern === 'migrations/schema');
    if (hasDbChanges) {
      allItems.push({ item: 'Database migrations are reversible', priority: 2 });
      allItems.push({ item: 'Migration tested on staging environment', priority: 2 });
    }

    const hasAuthChanges = analysis.risks.some(r => r.pattern === 'auth/security');
    if (hasAuthChanges) {
      allItems.push({ item: 'Security implications reviewed', priority: 2 });
      allItems.push({ item: 'Authentication flows tested', priority: 2 });
    }

    const hasDependencyChanges = analysis.risks.some(r => r.pattern === 'dependencies');
    if (hasDependencyChanges) {
      allItems.push({ item: 'Dependency changes reviewed for security vulnerabilities', priority: 2 });
      allItems.push({ item: 'Package lock file updated', priority: 2 });
    }

    // Priority 3: Configuration and documentation
    const hasConfigChanges = analysis.categories.some(c => c.name === 'config');
    if (hasConfigChanges) {
      allItems.push({ item: 'Configuration changes documented', priority: 3 });
      allItems.push({ item: 'Environment variables updated if needed', priority: 3 });
    }

    allItems.push({ item: 'Changes are well-documented', priority: 3 });

    // Priority 4: Code quality
    if (analysis.testDetection.hasTests) {
      allItems.push({ item: 'New tests cover edge cases', priority: 4 });
    }
    allItems.push({ item: 'Code follows project style guidelines', priority: 4 });
    allItems.push({ item: 'No unnecessary console.log or debug code', priority: 4 });

    // Add LLM-generated context-specific items (Priority 2 - treat as important)
    if (hybridAnalysis?.llmAnalysis?.checklistItems) {
      for (const llmItem of hybridAnalysis.llmAnalysis.checklistItems) {
        // Check for duplicates (case-insensitive, fuzzy match)
        const isDuplicate = allItems.some(existing =>
          this.isSimilarChecklistItem(existing.item, llmItem)
        );
        
        if (!isDuplicate) {
          allItems.push({ item: llmItem, priority: 2 });
        }
      }
    }

    // Sort by priority (ascending), then alphabetically within same priority
    allItems.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.item.localeCompare(b.item);
    });

    // Return just the items (without priority)
    return allItems.map(item => item.item);
  }

  /**
   * Check if two checklist items are similar enough to be considered duplicates
   */
  private isSimilarChecklistItem(item1: string, item2: string): boolean {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
    const normalized1 = normalize(item1);
    const normalized2 = normalize(item2);
    
    // Exact match after normalization
    if (normalized1 === normalized2) {
      return true;
    }
    
    // Check if one contains the other (for variations like "Tests pass" vs "All tests pass")
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return true;
    }
    
    // Check for key phrase overlap (at least 60% of words in common)
    const words1 = normalized1.split(/\s+/);
    const words2 = normalized2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));
    const overlapRatio = commonWords.length / Math.min(words1.length, words2.length);
    
    return overlapRatio >= 0.6;
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
