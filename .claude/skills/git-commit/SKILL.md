---
name: git-commit
description: >
  Generates a well-structured git commit message based on staged changes in the current branch.
  Use this skill whenever the user wants to commit staged files, write a commit message, describe
  their changes for git, or asks what to write in a commit. Trigger on phrases like "write a commit
  message", "commit my changes", "what should my commit say", "generate commit", "staged files",
  or any mention of git commit workflow. Even if the user just says "help me commit this", use this
  skill — don't try to wing it without the structured workflow below.
---

# Git Commit Message Skill

Generates clear, concise, and conventional git commit messages by inspecting staged changes
and applying git best practices.

---

## Workflow

### Step 1 — Gather Context

Run the following commands to understand the staged changes:

```bash
# Show a summary of staged files
git diff --cached --stat

# Show the full staged diff (content-level)
git diff --cached

# Get the current branch name
git branch --show-current

# Show recent commit history for style/context reference
git log --oneline -10
```

If `git diff --cached` is empty, inform the user that there are no staged changes and suggest
they run `git add <files>` first. Do not proceed to generate a commit message.

---

### Step 2 — Analyze the Changes

Before writing anything, reason through:

1. **What changed?** — Files added, deleted, modified, renamed.
2. **Why did it change?** — Infer intent from the diff (bug fix, new feature, refactor, config update, etc.).
3. **What is the scope?** — Is this one logical unit of work, or multiple concerns mixed together?
4. **What is the impact?** — Does this affect behavior, performance, style, tests, or documentation?

---

### Step 3 — Write the Commit Message

Apply the following rules strictly:

#### Subject Line (required)
- **50 characters or fewer** (hard limit: 72)
- **Imperative mood**: "Add", "Fix", "Update", "Remove", "Refactor" — not "Added", "Fixes", "Updated"
- **No period** at the end
- **Format**: If the project uses Conventional Commits, use the prefix format:
  ```
  <type>(<optional scope>): <short description>
  ```
  Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`

  Example:
  ```
  feat(auth): add OAuth2 login support
  fix(api): handle null response from payments endpoint
  docs: update README with setup instructions
  ```

  If the project does **not** use Conventional Commits (check recent log history), write a plain
  imperative subject:
  ```
  Add OAuth2 login support
  Fix null response crash in payments endpoint
  ```

#### Blank Line (required if body present)
- Always separate subject from body with a blank line.

#### Body (optional, use when the "why" is non-obvious)
- **Wrap at 72 characters**
- Explain **why** the change was made, not just what (the diff shows what)
- Use bullet points (`-`) for multiple distinct points
- Reference issue/ticket numbers if evident from branch name or context (e.g., `Closes #42`)

#### Footer (optional)
- Breaking changes: `BREAKING CHANGE: <description>`
- Issue references: `Fixes #123`, `Closes #456`, `Refs #789`

---

### Step 4 — Output the Commit Message

Present the commit message in a code block so the user can copy it easily:

```
feat(scope): short imperative description

Optional body explaining the why, not the what. Wrap lines
at 72 characters for readability in terminals and GitHub.

- Bullet point for distinct sub-changes if needed
- Another point

Closes #123
```

Then offer the ready-to-run git command:

```bash
git commit -m "subject line" -m "body paragraph if needed"
```

Or, if the message has a body, recommend using the editor form:

```bash
git commit
```

...and paste the full message.

---

## Quality Checklist

Before presenting the output, verify:

- [ ] Subject line is ≤ 50 chars (warn if 51–72, reject if > 72)
- [ ] Subject uses imperative mood
- [ ] Subject has no trailing period
- [ ] Type prefix matches the actual nature of the change
- [ ] Body explains *why*, not just *what*
- [ ] No line in the body exceeds 72 characters
- [ ] Breaking changes are explicitly flagged in footer
- [ ] Message covers all staged changes (nothing silently omitted)

---

## Common Patterns

| Change type | Subject example |
|---|---|
| New feature | `feat(cart): add quantity selector to product page` |
| Bug fix | `fix(auth): prevent redirect loop on token expiry` |
| Refactor | `refactor(db): extract query builder into helper module` |
| Dependency update | `chore(deps): bump axios from 1.6.0 to 1.7.2` |
| Tests | `test(payments): add unit tests for refund edge cases` |
| Documentation | `docs(api): document rate limiting headers` |
| Style/formatting | `style: apply prettier formatting to src/` |
| CI/build | `ci: add GitHub Actions workflow for PRs` |
| Performance | `perf(images): lazy-load below-the-fold thumbnails` |

---

## Edge Cases

**Multiple unrelated changes staged together**
→ Warn the user that mixing unrelated concerns in one commit is discouraged. Suggest splitting
  with `git add -p` or `git restore --staged <file>`. If they want to proceed anyway, write the
  best possible message covering all changes with a body listing each concern.

**Binary files or generated files only**
→ Note this in the message (e.g., `chore: update compiled assets`). Do not try to describe
  binary diffs semantically.

**Large diffs (500+ lines)**
→ Focus on the high-level intent visible from file names and structure; note in the body that
  the change is large and reviewers should examine the diff directly.

**No conventional commits pattern in repo**
→ Check `git log --oneline -10`. If no `type:` prefixes appear, default to plain imperative
  style without prefixes.
