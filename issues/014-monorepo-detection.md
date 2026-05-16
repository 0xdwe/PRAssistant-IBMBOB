# Monorepo Detection

## Parent

[PRD.md](../PRD.md)

## What to build

Detect monorepo structure and identify affected packages from changed file paths. Support common monorepo tools (Lerna, Nx, Turborepo, pnpm workspaces). Show which packages changed in PR packet.

End-to-end: Developer in monorepo runs `pr-ready` → sees "Affected packages: @app/frontend, @app/api" → knows scope of changes.

## Acceptance criteria

- [ ] MonorepoDetector module created
- [ ] Detect monorepo from workspace config files
- [ ] Support: package.json workspaces, lerna.json, nx.json, pnpm-workspace.yaml
- [ ] Map changed files to packages
- [ ] Output affected packages list
- [ ] Works in non-monorepo (no-op)
- [ ] Config option to enable/disable
- [ ] Show package names in PR packet

## Blocked by

- [001-cli-scaffold-git-diff.md](001-cli-scaffold-git-diff.md)
- [007-config-system.md](007-config-system.md)

## User stories covered

- US#14: Monorepo support to see affected packages