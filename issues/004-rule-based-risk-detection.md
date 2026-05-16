# Rule-Based Risk Detection

## Parent

[PRD.md](../PRD.md)

## What to build

Pattern match changed files against risky patterns (migrations/, schema, auth/, *.config.js, package.json dependencies). Flag high-risk changes for reviewer attention. Output risk warnings.

End-to-end: Developer runs `pr-ready` → sees "⚠️ Risks: DB schema change, auth modification" → highlights dangerous changes.

## Acceptance criteria

- [ ] Risk pattern matching implemented
- [ ] Default patterns: migrations/, schema, auth/, security/, *.config.js, package.json deps
- [ ] Risk severity levels: high, medium, low
- [ ] Output shows risk flags with file paths
- [ ] No false positives on safe config changes
- [ ] Large refactors detected (>500 lines changed in single file)

## Blocked by

- [001-cli-scaffold-git-diff.md](001-cli-scaffold-git-diff.md)

## User stories covered

- US#6: Risk flags for dangerous changes
- US#26: Risk visibility for review prioritization