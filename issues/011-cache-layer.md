# Cache Layer

## Parent

[PRD.md](../PRD.md)

## What to build

Cache LLM analysis results by diff hash. Skip expensive LLM calls if same diff analyzed before. Store in `.pr-ready-cache/` directory.

End-to-end: Developer runs `pr-ready --llm openai` → analysis cached → runs again with no changes → instant result from cache → no API cost.

## Acceptance criteria

- [ ] CacheManager module created
- [ ] Hash diff content using SHA-256
- [ ] Cache key = diff hash
- [ ] Store in `.pr-ready-cache/` directory as JSON
- [ ] Cache hit: load from file, skip LLM call
- [ ] Cache miss: call LLM, save result
- [ ] --no-cache flag to bypass cache
- [ ] Cache invalidation on config change (different LLM settings)
- [ ] Add `.pr-ready-cache/` to .gitignore recommendation

## Blocked by

- [009-hybrid-analyzer.md](009-hybrid-analyzer.md)

## User stories covered

- US#16: Cached analysis results to avoid duplicate LLM costs