# VS Code Sidebar Panel

## Parent

[PRD.md](../PRD.md)

## What to build

Webview sidebar panel displaying PR packet. Click-to-copy buttons for each section. Clean UI matching VS Code theme. Updates when analysis completes.

End-to-end: Developer runs analysis → sidebar shows PR packet → clicks "Copy Summary" → summary copied → pastes into GitHub.

## Acceptance criteria

- [ ] Sidebar webview panel registered
- [ ] Panel shows in Activity Bar (custom icon)
- [ ] Display PR packet sections: Summary, Files, Tests, Risks, Checklist
- [ ] Copy button per section
- [ ] Copy all button
- [ ] Syntax highlighting for code blocks
- [ ] Respects VS Code theme (light/dark)
- [ ] Updates when new analysis completes
- [ ] Empty state when no analysis yet
- [ ] Error state if analysis fails

## Blocked by

- [017-vscode-extension-scaffold.md](017-vscode-extension-scaffold.md)

## User stories covered

- US#19: Sidebar panel to view PR packet without leaving editor
- US#22: Click-to-copy sections for selective copying