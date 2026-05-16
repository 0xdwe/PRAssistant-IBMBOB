# Config System

## Parent

[PRD.md](../PRD.md)

## What to build

Load configuration from package.json "prReady" field, fallback to .pr-ready.json file. Merge with CLI flags (flags override config). Support test commands, risk patterns, LLM settings, output options.

End-to-end: Developer adds config to package.json → runs `pr-ready` → tool uses custom settings → can override with flags.

## Acceptance criteria

- [ ] ConfigManager module created
- [ ] Load from package.json "prReady" field first
- [ ] Fallback to .pr-ready.json if package.json field missing
- [ ] Config schema validation
- [ ] CLI flags override config values
- [ ] Default values for all settings
- [ ] Config sections: llm, test, risks, output, monorepo
- [ ] Error on invalid config with helpful message
- [ ] --config flag for custom config file path

## Blocked by

- [001-cli-scaffold-git-diff.md](001-cli-scaffold-git-diff.md)

## User stories covered

- US#13: Project-specific configuration