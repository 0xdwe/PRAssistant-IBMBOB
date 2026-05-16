# CLI Scaffold + Git Diff Extraction

## Parent

[PRD.md](../PRD.md)

## What to build

Create monorepo structure with CLI package that can extract git diffs between branches. User runs `pr-ready` command, tool detects current branch, auto-detects upstream branch (or accepts --base flag), extracts structured diff with file paths and changes.

End-to-end: Developer runs `pr-ready` in terminal → sees diff extracted → exits cleanly with success/error message.

## Acceptance criteria

- [ ] Monorepo structure created (`packages/cli`, `packages/shared`)
- [ ] TypeScript configured for both packages
- [ ] CLI entry point with commander.js
- [ ] Git diff extraction using simple-git
- [ ] Auto-detect upstream branch (origin/main, origin/master, etc)
- [ ] Support --base and --head flags for custom branch comparison
- [ ] Structured GitDiff type with file paths, changes, metadata
- [ ] Error handling for: not a git repo, no diff found, invalid branches
- [ ] CLI outputs diff summary (files changed count) to console

## Blocked by

None - can start immediately

## User stories covered

- US#1: Run single command to analyze branch changes
- US#11: Compare any two branches
- US#12: Auto-detection of upstream branch
- US#29: npm global install