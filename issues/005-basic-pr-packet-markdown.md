# Basic PR Packet Markdown Output

## Parent

[PRD.md](../PRD.md)

## What to build

Generate markdown PR packet with sections: summary, files by category, test status, risk flags. Write to `.pr-ready.md` file. Format for easy copy-paste to GitHub PR.

End-to-end: Developer runs `pr-ready` → `.pr-ready.md` created → opens file → sees formatted PR description → copies to GitHub.

## Acceptance criteria

- [ ] PRPacketGenerator module created
- [ ] Markdown template with sections: Summary, Files Changed, Tests, Risks, Checklist
- [ ] Files section uses categorization from #002
- [ ] Tests section uses detection from #003
- [ ] Risks section uses flags from #004
- [ ] Basic checklist template (tests pass, docs updated, breaking changes noted)
- [ ] Write to `.pr-ready.md` in project root
- [ ] Clean markdown formatting (headers, lists, code blocks)
- [ ] Summary section placeholder (rule-based: "X files changed across Y categories")

## Blocked by

- [002-rule-based-file-categorization.md](002-rule-based-file-categorization.md)
- [003-rule-based-test-detection.md](003-rule-based-test-detection.md)
- [004-rule-based-risk-detection.md](004-rule-based-risk-detection.md)

## User stories covered

- US#2: Automatic change summaries
- US#9: Output saved to markdown file
- US#25: Consistent PR descriptions