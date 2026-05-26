---
name: pr-reviewer
description: >
  Use this skill whenever the user wants to review, name, describe, or validate a pull request (PR).
  Triggers include: "review my PR", "write a PR description", "name this PR", "check if my PR description matches the code",
  "validate my pull request", "write PR title", "summarize changes for PR", or any mention of pull request review,
  PR naming conventions, or PR description writing. Also trigger when the user pastes a diff, code changes, or
  commit list and asks for feedback, a summary, or a title. Use this skill even if the user only pastes a git diff
  without explicitly saying "PR" — they likely want PR-ready output.
---

# PR Reviewer Skill

A skill for generating well-named PR titles, writing concise and accurate descriptions, and validating that a PR's description faithfully reflects its actual code changes.

---

## Workflow Overview

When triggered, follow these phases in order:

1. **Ingest** — Collect the PR content (diff, commits, file list, or existing title/description)
2. **Name** — Generate a well-structured PR title
3. **Describe** — Write a concise, accurate PR description
4. **Validate** — Cross-check the description against the actual changes and flag mismatches

---

## Phase 1: Ingest

Accept any of the following as input:
- A raw `git diff` or patch
- A list of changed files + commit messages
- An existing PR title + description (for validation only)
- A GitHub/GitLab PR URL (if browser/fetch tools are available)

If the input is ambiguous or incomplete, ask:
> "Could you share the diff, changed files, or commit messages so I can work with the actual changes?"

---

## Phase 2: Naming the PR

### Title Format

```
<type>(<scope>): <short imperative summary>
```

| Field | Guidance |
|---|---|
| `type` | `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `ci`, `build`, `revert` |
| `scope` | The module, component, or area affected (optional but preferred) |
| `summary` | Imperative mood, ≤60 chars, no trailing period |

### Title Rules
- Use **imperative mood**: "Add", "Fix", "Remove", "Update" — not "Added", "Fixes", "Removes"
- Be **specific**: prefer `fix(auth): prevent token refresh race condition` over `fix: bug fix`
- Avoid noise words: "WIP", "misc", "various changes", "updates"
- If the PR spans multiple unrelated concerns, flag it: *"This PR appears to cover multiple concerns — consider splitting it."*

### Examples

| ❌ Poor | ✅ Good |
|---|---|
| `fixes` | `fix(api): handle 429 rate limit with exponential backoff` |
| `update stuff` | `chore(deps): upgrade axios to 1.7.2` |
| `new feature` | `feat(dashboard): add date range filter to analytics view` |
| `WIP: auth` | `feat(auth): implement OAuth2 PKCE flow` |

---

## Phase 3: Writing the Description

### Description Template

```markdown
## Summary
<!-- One or two sentences: what does this PR do and why? -->

## Changes
<!-- Bullet list of concrete changes. Be specific — name files, functions, or components where helpful. -->
- 
- 

## Testing
<!-- How was this tested? Unit tests, manual steps, edge cases covered. -->

## Notes (optional)
<!-- Breaking changes, follow-up tasks, known limitations, or reviewer guidance. -->
```

### Description Rules

- **Summary** must answer: *what changed* and *why it was needed*. Do not just restate the title.
- **Changes** should map 1:1 to actual diff content — do not invent or omit changes.
- Use **specific names**: function names, file paths, component names, config keys.
- Keep the whole description **under 300 words** unless the PR is unusually large.
- If a breaking change exists, call it out explicitly in Notes with a `⚠️ Breaking change:` prefix.
- Do not include generic filler like "various improvements" or "minor fixes" without specifics.

---

## Phase 4: Validation

After generating (or when reviewing an existing) title + description, perform a validation pass.

### Validation Checklist

Run through each check and report the result:

| Check | What to verify |
|---|---|
| **Coverage** | Every significant change in the diff is mentioned in the description |
| **Accuracy** | No claims in the description that don't appear in the diff |
| **Scope creep** | No unrelated changes are silently bundled in |
| **Title match** | The title accurately represents the primary change |
| **Type correctness** | The commit type (`feat`, `fix`, etc.) is appropriate |
| **Tone** | Imperative mood, no vague language |
| **Length** | Title ≤72 chars; description ≤300 words (warn, not block) |

### Validation Output Format

```
✅ Coverage       — All major changes are documented
✅ Accuracy       — Description matches the diff
⚠️ Scope creep   — Found unrelated change: `utils/logger.ts` modified but not mentioned in PR scope
✅ Title match    — Title reflects primary intent
✅ Type           — 'feat' is appropriate
✅ Tone           — Imperative mood used correctly
✅ Length         — Title: 54 chars | Description: 187 words
```

Flag levels:
- `✅` — Passed
- `⚠️` — Warning (should address, doesn't block merge)
- `❌` — Failure (should be fixed before merge)

---

## Output Structure

Always return results in this order:

```
### PR Title
<generated title>

### PR Description
<generated description using template>

### Validation Report
<checklist output>

### Recommendations (if any)
<numbered list of suggested improvements>
```

---

## Edge Cases

| Situation | Handling |
|---|---|
| PR has only config/dependency changes | Use `chore` type; describe exact packages/versions |
| PR is a revert | Use `revert:` prefix; reference the original PR/commit |
| Diff is very large (500+ lines) | Summarize by file group; note that manual review of edge cases is advised |
| Existing description is present | Run validation against it; suggest a rewrite only if ≥2 checks fail |
| No tests mentioned | Add a `⚠️` noting absence of test coverage detail |
| Breaking changes detected | Escalate to `❌` if not documented in description |
