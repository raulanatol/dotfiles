---
name: pr
description: Create a pull request for the current branch. Commits pending changes, creates a new branch if on main, pushes to remote, and opens a PR with a structured template.
user_invocable: true
---

Create a pull request for the current branch with a structured template.

## Current State

Gather the current state of the repository by running these commands in parallel:

1. `git status` — to see all untracked and modified files
2. `git diff` and `git diff --staged` — to see all changes
3. `git log --oneline -10` — to see recent commit messages
4. `git branch --show-current` — to get the current branch name
5. `git log origin/main..HEAD --oneline` — to see commits not yet on main

## Your Task

1. **If there are uncommitted changes** (staged or unstaged):
   - Stage all relevant changes (exclude `.env`, credentials, or sensitive files)
   - Create a commit with a descriptive message summarizing the changes
   - Use conventional commit format: `type(scope): description` (e.g., `feat(dashboard): add releases page`)

2. **If on `main` branch**:
   - Create a new branch with a descriptive name based on the changes (e.g., `feat/add-releases-page`)
   - Switch to it before proceeding

3. **Analyze all changes** between the current branch and `main`:
   - Look at ALL commits, not just the latest one
   - Understand the full scope of changes

4. **Generate a PR title** (max 72 characters):
   - Be concise and descriptive
   - Use title case

5. **Create the PR body** using the template below, writing it to `/tmp/pr_body.md` using Bash with `cat >`

6. **Push the branch** to remote if not already pushed (`git push -u origin <branch>`)

7. **Create the PR** using `gh pr create --title "..." --body-file /tmp/pr_body.md --base main`

8. **Return the PR URL** to the user

## PR Template

```markdown
## Pull request type

Please check the type of change your PR introduces:
- [ ] Bugfix
- [ ] Feature
- [ ] Code style update (formatting, renaming)
- [ ] Refactoring (no functional changes, no API changes)
- [ ] Build related changes
- [ ] Documentation content changes
- [ ] Other (please describe):

## Changes

- DESCRIBE_YOUR_CHANGES_HERE

## Screenshots

(prefer animated gif, loom...)

## Pay attention to:

- MENTION_ANY_IMPORTANT_NOTES_HERE

## Checklist

- [x] tested locally
- [ ] added new dependencies
- [ ] updated the docs
- [ ] added a test
```

## Guidelines for filling the template

- Check the appropriate PR type based on the changes (can be multiple)
- Fill in the "Changes" section with a clear bullet-point list of what was modified
- Update the "Pay attention to" section with any important notes, or remove the section if not applicable
- Check the checklist items that apply to this PR
- Keep the description concise and focused on the "why" not just the "what"
