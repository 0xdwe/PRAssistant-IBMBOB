# CLI Help + Comprehensive Docs

## Parent

[PRD.md](../PRD.md)

## What to build

Comprehensive --help text, README with examples, sample config files. Clear documentation for all features, flags, config options.

End-to-end: Developer runs `pr-ready --help` → sees all options explained → reads README → understands how to use tool → copies sample config.

## Acceptance criteria

- [ ] --help flag shows all options with descriptions
- [ ] --version flag shows version
- [ ] README.md with: installation, quick start, usage examples, config guide
- [ ] Sample configs in examples/ directory
- [ ] Config for: basic usage, with LLM, monorepo, custom test command
- [ ] Document all CLI flags
- [ ] Document config schema
- [ ] Troubleshooting section
- [ ] Contributing guide
- [ ] License (MIT recommended)

## Blocked by

- [001-cli-scaffold-git-diff.md](001-cli-scaffold-git-diff.md)
- [007-config-system.md](007-config-system.md)

## User stories covered

- US#18: Clear error messages
- US#30: Comprehensive help text