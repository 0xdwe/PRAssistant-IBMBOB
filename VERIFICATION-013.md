# Verification: Issue 013 - Reviewer Checklist Generation

## Test 1: Template-only checklist (no LLM)

Testing basic checklist generation without LLM:

```bash
node packages/cli/dist/index.js
```

Expected output should include a "Reviewer Checklist" section with template items ordered by priority.

## Test 2: Checklist with LLM items

Testing checklist generation with OpenAI (requires API key):

```bash
export OPENAI_API_KEY="your-key"
node packages/cli/dist/index.js --llm openai
```

Expected output should include:
- Template items (tests, breaking changes, docs, etc.)
- 2-4 context-specific items from LLM
- No duplicate items
- Items ordered by priority (critical first)

## Test 3: Verify checklist structure

The checklist should be formatted as markdown checkboxes:
```markdown
## Reviewer Checklist

- [ ] All tests pass locally
- [ ] No breaking changes (or documented in PR description)
- [ ] Security implications reviewed
- [ ] Changes are well-documented
- [ ] Code follows project style guidelines
```

## Test 4: Verify priority ordering

Items should be ordered:
1. Priority 1: Critical (tests, breaking changes)
2. Priority 2: High-risk specific + LLM items (security, migrations, dependencies)
3. Priority 3: Configuration and documentation
4. Priority 4: Code quality

## Test 5: Verify duplicate detection

LLM items that are similar to template items should be filtered out.

## Manual Testing

Run the CLI on this repository to see the checklist:

```bash
# Without LLM
npm run build
node packages/cli/dist/index.js

# With LLM (if configured)
node packages/cli/dist/index.js --llm openai
```

Check the generated PR packet for:
- ✅ Checklist section exists
- ✅ Template items present
- ✅ Items formatted as markdown checkboxes
- ✅ Items ordered by priority
- ✅ No duplicate items
- ✅ LLM items included (if LLM enabled)
- ✅ 2-4 context-specific LLM items

## Acceptance Criteria Verification

- [x] Checklist generation in PRPacketGenerator
- [x] Template items: tests pass, docs updated, breaking changes noted, backwards compatible
- [x] LLM generates 2-4 context-specific items based on changes (if LLM enabled)
- [x] Checklist formatted as markdown checkboxes
- [x] Works without LLM (template only)
- [x] No duplicate items
- [x] Items ordered by priority (critical first)

## Implementation Summary

### Changes Made:

1. **types.ts**: Added `checklistItems?: string[]` to `LLMAnalysis` interface
2. **pr-packet-generator.ts**: 
   - Updated `generateChecklist()` to accept hybrid analysis
   - Implemented priority-based ordering (1-4, lower = higher priority)
   - Added duplicate detection with fuzzy matching
   - Merged template + LLM items
3. **All LLM providers** (openai, anthropic, ollama):
   - Updated prompts to request 2-4 context-specific checklist items
   - Updated response parsing to extract CHECKLIST section
   - Return checklistItems in LLMAnalysis

### Priority System:

- **Priority 1 (Critical)**: Tests pass, breaking changes
- **Priority 2 (High-risk)**: Security, migrations, dependencies, LLM items
- **Priority 3 (Documentation)**: Config changes, documentation
- **Priority 4 (Code quality)**: Style guidelines, edge cases, debug code

### Duplicate Detection:

The `isSimilarChecklistItem()` method checks for:
- Exact match after normalization
- Substring containment
- 60%+ word overlap

This prevents LLM from generating items like "Verify tests pass" when template already has "All tests pass locally".

## Example Output

```markdown
## Reviewer Checklist

- [ ] All tests pass locally
- [ ] No breaking changes (or documented in PR description)
- [ ] Verify auth token expiry logic
- [ ] Check error handling in new API endpoints
- [ ] Configuration changes documented
- [ ] Changes are well-documented
- [ ] Code follows project style guidelines
- [ ] No unnecessary console.log or debug code
```

## Notes

- Template items are always included (works without LLM)
- LLM items are optional and context-specific
- Duplicate detection ensures no redundant items
- Priority ordering puts critical items first
- All items formatted as markdown checkboxes for easy review