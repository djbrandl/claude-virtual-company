---
name: company-verify
description: Verify phase completion with automated checks and user acceptance testing.
context: fork
agent: general-purpose
argument-hint: [phase-number]
skills:
  - company-protocols
  - company-project-manager
  - company-playground
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

# Phase Verification

Verify phase $ARGUMENTS completion with automated checks and UAT.

## Context Loading

Before proceeding, load the following context:

1. **Phase Context**: Read `.planning/phase-{N}/CONTEXT.md` (first 30 lines) where {N} is the phase number from arguments
2. **Summaries**: List files matching `.planning/phase-{N}/*-SUMMARY.md`

---

## Target Phase
$ARGUMENTS

---

## Verification Protocol

### Layer 1: Automated Verification

#### 1.1 Artifact Check

Verify all must_have artifacts exist:

```bash
# Read must_haves from plan frontmatter
# Check each artifact exists
for artifact in "${ARTIFACTS[@]}"; do
  if [[ -f "$artifact" ]]; then
    echo "✓ $artifact"
  else
    echo "✗ $artifact MISSING"
    FAILED=true
  fi
done
```

#### 1.2 Test Execution

Run all relevant tests:

```bash
# Unit tests
npm test -- --coverage

# Integration tests (if applicable)
npm run test:integration

# E2E tests (if applicable)
npm run test:e2e
```

#### 1.3 Lint/Type Check

```bash
# TypeScript check
npx tsc --noEmit

# Linting
npm run lint

# Formatting
npm run format:check
```

#### 1.4 Coverage Check

```bash
# Check coverage meets threshold
npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'
```

#### 1.5 Verify Commands from Plans

Run all verify commands from each plan's tasks:

```bash
# Parse each PLAN.md for <verify> blocks
# Execute each command
# Collect results
```

### Layer 2: Goal-Backward Verification

Check against must_haves from plans:

#### Truths Verification
For each truth (observable behavior):
- Can we demonstrate this works?
- Does manual testing confirm?

#### Artifacts Verification
For each artifact:
- Does file exist?
- Does it contain expected content?

#### Key Links Verification
For each key link:
- Is the connection working?
- Can we trace the data flow?

---

## Write VERIFICATION.md

```markdown
# Phase $ARGUMENTS Verification Report

## Automated Checks

### Artifact Check
| Artifact | Status |
|----------|--------|
| path/to/file1.ts | ✓ Present |
| path/to/file2.ts | ✓ Present |

### Test Results
```
{test output}
```
- Unit Tests: {pass/fail} ({count} tests)
- Integration Tests: {pass/fail} ({count} tests)
- Coverage: {percentage}%

### Lint/Type Check
- TypeScript: {pass/fail}
- ESLint: {pass/fail}
- Formatting: {pass/fail}

### Plan Verification Commands
| Plan | Task | Verify Command | Result |
|------|------|----------------|--------|
| 1 | Task 1 | {command} | ✓ |
| 1 | Task 2 | {command} | ✓ |

## Goal-Backward Verification

### Truths
| Truth | Verified |
|-------|----------|
| "User can {behavior}" | {yes/no} |

### Artifacts
| Artifact | Verified |
|----------|----------|
| {artifact} | {yes/no} |

### Key Links
| Link | Verified |
|------|----------|
| {connection} | {yes/no} |

## Overall Status
{PASSED / FAILED}

## Issues Found
{List any issues}
```

Write to `.planning/phase-$ARGUMENTS/VERIFICATION.md`

---

## Layer 3: User Acceptance Testing

### Playground-Enhanced UAT (Optional)

Before using text-based UAT, check if a verification playground would be beneficial. Follow the **company-playground** preference protocol:

1. Read `.company/state.json` — check `playground_preference`
2. If `null`, ask the user if they want playgrounds (see company-playground protocol)
3. If `"disabled"` or Gemini CLI, skip to standard UAT Protocol below

**When to offer a verification playground:**
- Automated checks produced 1+ findings (failed tests, lint errors, missing artifacts, verification command failures)
- If 0 findings, skip to standard UAT Protocol

**Playground generation (if applicable):**

```bash
mkdir -p .company/artifacts/playground
```

Generate a **document-critique** playground HTML using the **company-playground** shared HTML skeleton:

- **Left panel (controls)**: List each finding as an interactive card with:
  - Finding title and category badge (Blocker/Issue/Suggestion)
  - File path and line number (if applicable)
  - Status toggle: Approve (accept finding) / Reject (disagree) / Needs Discussion
  - Comment textarea for notes
- **Right panel (preview)**: Summary dashboard showing:
  - Total findings count by category
  - Disposition counts (N approved, N rejected, N needs discussion)
  - Overall status indicator (PASS if no unresolved blockers, FAIL otherwise)
- **buildPrompt()**: Collect all dispositions into:
  ```
  PLAYGROUND DECISIONS:
  - Finding 1: [APPROVED/REJECTED/DISCUSS] - [comment]
  - Overall: [PASS/FAIL/CONDITIONAL]
  ```

Write to `.company/artifacts/playground/verify-phase-{N}.html` where `{N}` is the phase number.

**Open and ask for paste-back:**
```bash
case "$(uname -s 2>/dev/null || echo Windows)" in
  MINGW*|MSYS*|CYGWIN*|Windows*)
    start "" ".company/artifacts/playground/verify-phase-{N}.html"
    ;;
  Darwin*)
    open ".company/artifacts/playground/verify-phase-{N}.html"
    ;;
  Linux*)
    xdg-open ".company/artifacts/playground/verify-phase-{N}.html"
    ;;
esac
```

```
AskUserQuestion({
  questions: [{
    header: "Verification",
    question: "I've opened a verification playground with the findings from automated checks. Review each finding, mark as Approve/Reject/Discuss, then click 'Copy Prompt' and paste here. Or skip to review findings one by one.",
    options: [
      { label: "Paste Output", description: "I'll paste the playground output (use 'Other' to paste)" },
      { label: "Skip Playground", description: "Review findings via text questions instead" }
    ]
  }]
})
```

- If user pastes output: Parse dispositions, apply to VERIFICATION.md, continue to UAT.md creation
- If user skips: Continue to standard UAT Protocol below

---

### UAT Protocol

For each requirement covered by this phase:

```
AskUserQuestion({
  questions: [{
    header: "UAT",
    question: "Requirement: {requirement}. Does the implementation meet acceptance criteria: {criteria}?",
    options: [
      { label: "Accepted", description: "Works as expected" },
      { label: "Partial", description: "Works but needs minor fixes" },
      { label: "Failed", description: "Does not meet criteria" }
    ]
  }]
})
```

### Interactive Verification

For UI/frontend phases, guide user through testing:

```markdown
## UAT Checklist

Please verify the following:

1. [ ] Navigate to {page}
2. [ ] Perform action: {action}
3. [ ] Observe: {expected behavior}
4. [ ] Confirm: {acceptance criteria}

When complete, select verification status.
```

### Write UAT.md

```markdown
# Phase $ARGUMENTS User Acceptance Testing

## Test Date
{ISO timestamp}

## Requirements Tested
| Requirement | Acceptance Criteria | Result |
|-------------|---------------------|--------|
| FR-1 | {criteria} | Accepted |
| FR-2 | {criteria} | Accepted |

## User Verification
- Tested by: CEO
- Date: {date}
- Status: ACCEPTED

## Notes
{Any observations or feedback}
```

Write to `.planning/phase-$ARGUMENTS/UAT.md`

---

## Handle Failures

### Automated Check Failure

1. Document failure in VERIFICATION.md
2. Create fix tasks:
   ```
   TaskCreate(
     subject: "Fix: {issue}",
     description: "Verification failed: {details}"
   )
   ```
3. Route back to execution

### UAT Failure

1. Document in UAT.md
2. Clarify issue with user
3. Create remediation tasks
4. Re-execute and re-verify

---

## Update State

```bash
cat >> .planning/STATE.md << EOF

## Session Update: $(date -Iseconds)
- Verified Phase $ARGUMENTS
- Automated checks: {pass/fail}
- UAT: {accepted/failed}
- Status: {complete/needs-fixes}
EOF
```

---

## Output

### On Success

```markdown
# Phase $ARGUMENTS Verification Complete

## Results
- Automated Checks: ✓ PASSED
- Goal Verification: ✓ PASSED
- User Acceptance: ✓ ACCEPTED

## Artifacts
- `.planning/phase-$ARGUMENTS/VERIFICATION.md`
- `.planning/phase-$ARGUMENTS/UAT.md`

## Phase Status
COMPLETE

## ▶ What's Next?

| Option | Command | When to use |
|--------|---------|-------------|
| Continue workflow | `/company-progress` | See recommended next phase |
| Complete milestone | `/company-milestone` | All phases done, ready to release |
| Pause work | `/company-pause` | Need to stop for now |
| Report feedback | `/company-reply "..."` | Have additional observations |
```

### On Failure

```markdown
# Phase $ARGUMENTS Verification Failed

## Issues Found
1. {Issue 1}: {details}
2. {Issue 2}: {details}

## Remediation Tasks Created
- Task {id}: Fix {issue 1}
- Task {id}: Fix {issue 2}

## ▶ What's Next?

| Option | Command | When to use |
|--------|---------|-------------|
| Report the issues | `/company-reply "..."` | Describe what's wrong in detail |
| Re-execute phase | `/company-execute $ARGUMENTS` | After fixes are applied |
| Check progress | `/company-progress` | See overall status |
| Debug manually | `/company-quick "investigate..."` | Need ad-hoc investigation |
```
