# Ollama Local LLM Provider

## Parent

[PRD.md](../PRD.md)

## What to build

Ollama adapter for local LLM support. No API costs, runs models locally. Support common code models (CodeLlama, DeepSeek Coder).

End-to-end: Developer installs Ollama → runs `pr-ready --llm ollama` → local model analyzes diff → free analysis, no API key needed.

## Acceptance criteria

- [ ] OllamaProvider implementation
- [ ] Same interface as OpenAI/Anthropic providers
- [ ] Connect to local Ollama server (default: http://localhost:11434)
- [ ] Model selection from config (default: codellama)
- [ ] Check Ollama running, helpful error if not
- [ ] Slower than cloud LLMs (acceptable tradeoff)
- [ ] --llm ollama flag to enable
- [ ] Config for custom Ollama endpoint

## Blocked by

- [008-openai-llm-provider.md](008-openai-llm-provider.md)

## User stories covered

- US#15: Local LLM provider support
- US#28: Free local LLM option for open source maintainers