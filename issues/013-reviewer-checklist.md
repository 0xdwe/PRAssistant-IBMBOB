# Reviewer Checklist Generation

## Parent

[PRD.md](../PRD.md)

## What to build

Generate reviewer checklist combining template items with LLM-generated context-specific items. Template covers basics (tests, docs, breaking changes). LLM adds items based on actual changes.

End-to-end: Developer runs `pr-ready --llm openai` → checklist generated → includes "Verify auth token expiry logic" (context-specific) + "Tests pass" (template).

## Acceptance criteria

- [ ] Checklist generation in PRPacketGenerator
- [ ] Template items: tests pass, docs updated, breaking changes noted, backwards compatible
- [ ] LLM generates 2-4 context-specific items based on changes
- [ ] Checklist formatted as markdown checkboxes
- [ ] Works without LLM (template only)
- [ ] No duplicate items
- [ ] Items ordered by priority (critical first)

## Blocked by

- [005-basic-pr-packet-markdown.md](005-basic-pr-packet-markdown.md)
- [009-hybrid-analyzer.md](009-hybrid-analyzer.md)

## User stories covered

- US#23: Generated checklist for reviewers
- US#24: Context-specific checklist items