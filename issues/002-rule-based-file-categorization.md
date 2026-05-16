# Rule-Based File Categorization

## Parent

[PRD.md](../PRD.md)

## What to build

Analyze git diff and categorize changed files by directory structure. Group files into logical categories (frontend, backend, tests, config, docs) based on path patterns. Output categorized file list.

End-to-end: Developer runs `pr-ready` → sees files grouped by category → understands change structure at a glance.

## Acceptance criteria

- [ ] RuleBasedAnalyzer module created
- [ ] Categorization logic based on directory patterns
- [ ] Common categories: frontend/, backend/, tests/, config/, docs/, root
- [ ] Handle nested directories correctly
- [ ] Output shows files grouped by category
- [ ] Empty categories not displayed
- [ ] File count per category shown

## Blocked by

- [001-cli-scaffold-git-diff.md](001-cli-scaffold-git-diff.md)

## User stories covered

- US#3: Files grouped by purpose for reviewer understanding