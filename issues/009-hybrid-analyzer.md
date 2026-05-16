# Hybrid Analyzer

## Parent

[PRD.md](../PRD.md)

## What to build

Combine rule-based analysis with optional LLM enhancement. Merge results intelligently. Update PR packet with LLM summary while keeping rule-based categorization, tests, risks.

End-to-end: Developer runs `pr-ready --llm openai` → gets rule-based + AI analysis → PR packet has both structured data and natural language summary.

## Acceptance criteria

- [ ] HybridAnalyzer module created
- [ ] Runs rule-based analysis first (always)
- [ ] Optionally runs LLM analysis if --llm flag set
- [ ] Merges results: LLM summary + rule-based structure
- [ ] LLM enhances file categorization with purpose descriptions
- [ ] LLM adds context to risk flags
- [ ] Works without LLM (rule-based only mode)
- [ ] Error in LLM doesn't break entire analysis (strict fail)

## Blocked by

- [002-rule-based-file-categorization.md](002-rule-based-file-categorization.md)
- [003-rule-based-test-detection.md](003-rule-based-test-detection.md)
- [004-rule-based-risk-detection.md](004-rule-based-risk-detection.md)
- [008-openai-llm-provider.md](008-openai-llm-provider.md)

## User stories covered

- US#7: LLM-enhanced analysis
- US#8: Rule-based fallback when LLM unavailable