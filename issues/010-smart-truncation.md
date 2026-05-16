# Smart Truncation for Large Diffs

## Parent

[PRD.md](../PRD.md)

## What to build

Truncate large diffs intelligently before sending to LLM. Skip generated files (package-lock.json, dist/, build/). Prioritize source code over config. Stay within LLM context limits.

End-to-end: Developer has 10k line diff → runs `pr-ready --llm openai` → tool truncates to 8k lines → LLM analyzes important parts → summary generated.

## Acceptance criteria

- [ ] SmartTruncator module created
- [ ] Skip patterns: package-lock.json, yarn.lock, dist/, build/, .next/, node_modules/
- [ ] Prioritize: src/, lib/, app/ over config files
- [ ] Token counting (approximate: 1 token ≈ 4 chars)
- [ ] Max tokens configurable (default: 100k for GPT-4)
- [ ] Preserve file structure context (keep file paths even if content truncated)
- [ ] Warning message when truncation happens
- [ ] Show which files were skipped

## Blocked by

- [008-openai-llm-provider.md](008-openai-llm-provider.md)

## User stories covered

- US#17: Smart truncation for large diffs