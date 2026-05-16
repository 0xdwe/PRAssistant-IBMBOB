# VS Code Extension Scaffold

## Parent

[PRD.md](../PRD.md)

## What to build

VS Code extension package in monorepo. Activation on git repo detection. Command palette commands. Status bar item. Import CLI core for analysis.

End-to-end: Developer installs extension → opens git repo → sees status bar item → runs command from palette → analysis triggered.

## Acceptance criteria

- [ ] Extension package created in packages/extension
- [ ] Extension manifest (package.json) configured
- [ ] Activation event: onStartupFinished + workspace contains .git
- [ ] Commands registered: prReady.analyze, prReady.configure
- [ ] Status bar item created (shows "PR Ready")
- [ ] Import CLI core from packages/cli
- [ ] Run analysis when command triggered
- [ ] Show progress notification during analysis
- [ ] F5 debug works (Extension Development Host)
- [ ] Basic error handling

## Blocked by

- [005-basic-pr-packet-markdown.md](005-basic-pr-packet-markdown.md)

## User stories covered

- US#19: Sidebar panel for viewing PR packet
- US#20: Command palette integration
- US#21: Status bar indicator
- US#27: CLI tool for CI/CD integration