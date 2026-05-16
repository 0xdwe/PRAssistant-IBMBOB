# Clipboard Output

## Parent

[PRD.md](../PRD.md)

## What to build

Copy generated PR packet markdown to system clipboard automatically. User can paste directly into GitHub PR without opening file.

End-to-end: Developer runs `pr-ready` → markdown copied to clipboard → opens GitHub → pastes → PR description filled.

## Acceptance criteria

- [ ] OutputHandler module created
- [ ] Clipboard copy using clipboardy or similar cross-platform lib
- [ ] Copy happens after file write
- [ ] Success message: "✓ Copied to clipboard"
- [ ] Works on macOS, Linux, Windows
- [ ] Graceful failure if clipboard unavailable (headless environments)
- [ ] --no-clipboard flag to skip

## Blocked by

- [005-basic-pr-packet-markdown.md](005-basic-pr-packet-markdown.md)

## User stories covered

- US#10: Output copied to clipboard for direct paste