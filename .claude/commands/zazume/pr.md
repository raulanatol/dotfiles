---
allowed-tools: Bash(git:*), Bash(gh:*)
description: Create a pull request for the current branch using the Zazume PR template
---

## Current State

Current branch: !`git rev-parse --abbrev-ref HEAD`

Change statistics:
!`git diff origin/main...HEAD --stat`

Modified files:
!`git diff --name-only origin/main...HEAD`

Detailed changes:
!`git diff origin/main...HEAD`

## Your Task

1. Analyze the changes above
2. Extract the Jira ticket number (ZZM-XXX format) from the branch name or commit messages if available
3. Generate a professional PR title in the format: `[ZZM-XXX] Title description` (max 72 characters total)
   - If no Jira ticket is found, just use: `Title description`
4. Write the filled template to `/tmp/pr_body.md`, remove if already exists
5. Execute the gh pr create command

Then execute this bash command to create the pull request:

```bash
gh pr create --title "YOUR_TITLE_HERE" --body-file /tmp/pr_body.md --base main
```

Replace YOUR_TITLE_HERE with the generated title and TEMPLATE_BODY_HERE with the filled template below.

## PR template to Fill

```markdown
## Pull request type

Please check the type of change your PR introduces:
- [x] Bugfix
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

## 🚨 Pay attention to:

- MENTION_ANY_IMPORTANT_NOTES_HERE

## Checklist

- [x] tested locally
- [ ] added new dependencies
- [ ] updated the docs
- [ ] added a test

## Issue

- [ZZM-XYZ](https://zazume.atlassian.net/browse/ZZM-XYZ)
```

Guidelines for the title:
- Look for ZZM-XXX pattern in the current branch name (e.g., ⁠feature/ZZM-123-my-feature)
- Look for ZZM-XXX pattern in recent commit messages
- If found, format as: ⁠[ZZM-XXX] Brief description of changes
- If not found, format as: ⁠Brief description of changes
- Keep the entire title under 72 characters
- Be concise and descriptive
- Use title case for the description part

Guidelines for the template:
- Check the appropriate PR type based on the changes
- Fill in the "Changes" section with a clear bullet-point list of what was modified
- Update the "Pay attention to" section with any important notes 	or delete if is not applicable 
- Check the checklist items that apply to this PR
- Update the issue link if applicable
- Keep the title concise and descriptive (max 72 characters)
