# OpenAI LLM Provider

## Parent

[PRD.md](../PRD.md)

## What to build

OpenAI adapter for LLM-enhanced analysis. Send diff to GPT-4, get semantic change summary. Handle API errors, rate limits. Support API key from config or env var.

End-to-end: Developer sets OPENAI_API_KEY → runs `pr-ready --llm openai` → gets AI-generated summary → sees in PR packet.

## Acceptance criteria

- [ ] LLMProvider interface defined in shared package
- [ ] OpenAIProvider implementation
- [ ] API key from config or OPENAI_API_KEY env var
- [ ] Model selection (gpt-4, gpt-3.5-turbo) from config
- [ ] Prompt engineering for change summary
- [ ] Error handling: invalid key, rate limit, network error
- [ ] Timeout handling (30s default)
- [ ] Return structured LLMAnalysis with summary, insights
- [ ] --llm openai flag to enable

## Blocked by

- [001-cli-scaffold-git-diff.md](001-cli-scaffold-git-diff.md)
- [007-config-system.md](007-config-system.md)

## User stories covered

- US#7: LLM-enhanced analysis for semantic understanding
- US#15: OpenAI provider support