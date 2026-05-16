# Anthropic LLM Provider

## Parent

[PRD.md](../PRD.md)

## What to build

Anthropic Claude adapter following same LLMProvider interface as OpenAI. Support Claude models for developers who prefer Anthropic.

End-to-end: Developer sets ANTHROPIC_API_KEY → runs `pr-ready --llm anthropic` → gets Claude-generated summary → sees in PR packet.

## Acceptance criteria

- [ ] AnthropicProvider implementation
- [ ] Same interface as OpenAIProvider
- [ ] API key from config or ANTHROPIC_API_KEY env var
- [ ] Model selection (claude-3-opus, claude-3-sonnet) from config
- [ ] Same prompt as OpenAI for consistency
- [ ] Error handling: invalid key, rate limit, network error
- [ ] Timeout handling (30s default)
- [ ] --llm anthropic flag to enable

## Blocked by

- [008-openai-llm-provider.md](008-openai-llm-provider.md)

## User stories covered

- US#15: Anthropic provider support