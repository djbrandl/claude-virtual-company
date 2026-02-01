---
name: company-milestone
description: Complete current milestone, archive work, and prepare for next version.
context: fork
agent: general-purpose
skills:
  - company-protocols
  - company-project-manager
  - company-git-flow
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - AskUserQuestion
---

# Complete Milestone

Archive completed milestone and prepare for next version.

## Current Milestone

!`cat .planning/ROADMAP.md 2>/dev/null`

## Phase Verification Status

!`for phase in .planning/phase-*/; do echo "=== $phase ===" && cat "$phase/VERIFICATION.md" 2>/dev/null | head -10 || echo "Not verified"; done`

---

## Milestone Completion Protocol

### Step 1: Verify All Phases Complete

Check each phase in roadmap:

```bash
# All phases should have:
# - CONTEXT.md (discussed)
# - *-PLAN.md (planned)
# - *-SUMMARY.md (executed)
# - VERIFICATION.md (verified)
# - UAT.md (accepted)
```

If any phase incomplete, stop and report.

### Step 2: Run Final Verification

```bash
# All tests pass
npm test

# Build succeeds
npm run build

# No uncommitted changes
git status
```

### Step 3: Create Milestone Summary

```markdown
# Milestone Complete: v{version}

## Completed: {date}

## Requirements Delivered
| Requirement | Phase | Status |
|-------------|-------|--------|
| FR-1 | Phase 1 | ✓ |
| FR-2 | Phase 2 | ✓ |
| FR-3 | Phase 3 | ✓ |

## Phases Completed
| Phase | Name | Plans | Tasks | Duration |
|-------|------|-------|-------|----------|
| 1 | Foundation | 2 | 5 | — |
| 2 | Core | 3 | 8 | — |
| 3 | Integration | 2 | 4 | — |
| 4 | Polish | 1 | 2 | — |

## Code Changes
- Files created: {count}
- Files modified: {count}
- Lines added: {count}
- Lines removed: {count}

## Test Coverage
- Overall: {percentage}%
- Unit tests: {count} passing
- Integration tests: {count} passing
- E2E tests: {count} passing

## Commits
{List of commits in milestone}

## Contributors
- CEO: Vision and decisions
- CTO: Architecture
- Architect: Design
- Tech Lead: Planning
- Developer(s): Implementation
- QA: Verification
- Claude: All of the above
```

Write to `.planning/MILESTONE-v{version}.md`

### Step 4: Git Tag and Merge

```bash
# Ensure on feature branch
git checkout {feature-branch}

# Merge to develop
git checkout develop
git merge --no-ff {feature-branch} -m "Merge milestone v{version}"

# Tag release
git tag -a v{version} -m "Milestone v{version} complete

{summary of what's included}"

# Optionally merge to main
git checkout main
git merge --no-ff develop -m "Release v{version}"
```

### Step 5: Archive Phase Artifacts

```bash
# Create archive directory
mkdir -p .planning/archive/v{version}

# Move phase directories
mv .planning/phase-* .planning/archive/v{version}/

# Move research
mv .planning/research .planning/archive/v{version}/

# Keep PROJECT.md and REQUIREMENTS.md (will update for next milestone)
```

### Step 6: Update ROADMAP.md

Mark milestone complete:

```markdown
# ROADMAP.md

## Completed Milestones
- [x] v1.0 - {name} (completed {date})

## Current Milestone: v1.1
{Ready for new phases}
```

### Step 7: Update STATE.md

```markdown
# Project State

## Current Milestone
v1.1 (planning)

## Previous Milestone
v1.0 completed {date}

## Session Log
| Timestamp | Action | Details |
|-----------|--------|---------|
| {now} | milestone-complete | v1.0 archived, v1.1 ready |
```

---

## CEO Approval

Before final merge:

```
AskUserQuestion({
  questions: [{
    header: "Milestone Complete",
    question: "Milestone v{version} ready. All phases verified. Approve completion?",
    options: [
      { label: "Approve & Merge", description: "Complete milestone, merge to main" },
      { label: "Merge to Develop Only", description: "Complete but don't merge to main yet" },
      { label: "Review Details", description: "Show full milestone summary" },
      { label: "Hold", description: "Not ready yet" }
    ]
  }]
})
```

---

## Output

```markdown
# Milestone v{version} Complete

## Summary
- Phases completed: {count}
- Requirements delivered: {count}
- Total commits: {count}

## Git Status
- Branch merged: {feature-branch} → develop
- Tag created: v{version}
- Main updated: {yes/no}

## Archived To
`.planning/archive/v{version}/`

## ▶ Next Up

**Start Milestone v{next}** — Define next version scope

`/company-new-milestone`

Or continue with:
`/company-progress`
```
