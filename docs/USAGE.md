# Usage Guide

This guide walks you through using the Claude Virtual Company framework from start to finish.

## Getting Started

### Installation

```bash
# Install in current project
npx claude-virtual-company init

# Or install globally
npx claude-virtual-company init --global
```

### Verify Installation

```bash
npx claude-virtual-company status
```

## Starting a Project

### 1. Define Your Goal

Think about what you want to build. Be specific:

**Good goals:**
- "Build a user authentication system with email/password login and JWT tokens"
- "Create a REST API for managing blog posts with CRUD operations"
- "Implement a dashboard with user analytics and charts"

**Vague goals (less effective):**
- "Make an app"
- "Do some backend stuff"

### 2. Start the Project

In Claude Code:

```
/company "Build a user authentication system with email/password login, JWT tokens, and password reset via email"
```

### 3. What Happens Next

The orchestrator will:

1. **Initialize** the `.company/` directory structure
2. **Evaluate expertise** and create needed specialists
3. **Set up Git** with a feature branch
4. **Start the CTO** to define architecture

You'll see progress as each phase completes.

## Monitoring Progress

### Check Status

```
/company-status
```

This shows:
- Current phase
- Active tasks
- Pending proposals
- Recent activity

### View Artifacts

Each role produces artifacts in `.company/artifacts/[role]/`:

```bash
# CTO decisions
cat .company/artifacts/cto/architecture-decision-record.md

# Design documents
cat .company/artifacts/architect/component-design.md

# Feature specs
cat .company/artifacts/tech-lead/feature-spec.md
```

## Interacting with the Workflow

### Responding to Escalations

When a role needs CEO input, you'll be asked via `AskUserQuestion`:

```
Blocker: Cannot determine database choice. Options:
1. PostgreSQL (recommended for relational data)
2. MongoDB (if document store preferred)
3. SQLite (for simplicity)
```

Select an option to continue.

### Reviewing Proposals

Proposals requiring approval appear in `.company/proposals/pending/`:

```bash
ls .company/proposals/pending/
cat .company/proposals/pending/[proposal-file].json
```

Approve or reject through the orchestrator.

### Adjusting Settings

Modify behavior on the fly:

```
/company-settings quality.test_coverage_minimum 70
/company-settings git_flow.squash_on_merge false
```

## Phase Details

### Phase 1: Architecture (CTO)

**What happens:**
- Technology stack selection
- High-level architecture decisions
- Risk identification

**Artifacts produced:**
- `architecture-decision-record.md`
- `tech-stack.md`
- `constraints.md`
- `risks.md`

**Your role:** Review decisions if escalated.

### Phase 2: Design (Architect)

**What happens:**
- Component design
- API contract definition
- Data modeling

**Artifacts produced:**
- `component-design.md`
- `api-contracts.md`
- `data-model.md`

**Your role:** Review if scope questions arise.

### Phase 3: Planning (Tech Lead)

**What happens:**
- Feature breakdown
- Task creation
- Dependency mapping

**Artifacts produced:**
- `feature-spec.md`
- `task-breakdown.md`
- Formal tasks in task system

**Your role:** Review feature priorities if asked.

### Phase 4: Implementation (Developer)

**What happens:**
- Code implementation
- Unit test writing
- Self-review

**Artifacts produced:**
- Source code changes
- Test files
- `implementation-complete.md`

**Your role:** May be asked about edge cases.

### Phase 5: Code Review

**What happens:**
- Quality check
- Security review
- Standards verification

**Artifacts produced:**
- `review.md` with findings

**Your role:** Final approval if blocking issues.

### Phase 6: QA Verification

**What happens:**
- Test execution
- Acceptance criteria verification
- Bug reporting

**Artifacts produced:**
- `qa-report.md`
- Test results

**Your role:** Decide on any found issues.

### Phase 7: Merge

**What happens:**
- Final checks
- CEO approval request
- Merge execution

**Your role:** Approve the merge.

## Completing a Project

### When Ready to Merge

The orchestrator will ask:

```
All quality gates passed. Approve merge to develop?
1. Approve & Merge
2. Review First
3. More Testing
4. Defer
```

### After Merge

```
/company-merge
```

This will:
1. Run final tests
2. Merge to develop/main
3. Clean up branches
4. Update state

## Working with Specialists

### View Current Team

```
/company-roster
```

### Add a Specialist

```
/company-hire frontend-react
```

### Specialist Self-Evaluation

Specialists automatically evaluate if they can handle tasks. If not, they request additional expertise through proposals.

## Common Workflows

### Pause and Resume

The framework saves state in `.company/state.json`. You can:
1. Close Claude Code
2. Return later
3. Run `/company-status` to see where you left off

### Scope Change

If requirements change mid-project:

```
/company-propose scope-change
```

This creates a proposal requiring CEO approval.

### Parallel Development

For independent features, multiple developers work simultaneously:

```
# Tasks without dependencies run in parallel
# Task system tracks progress
TaskList()
```

## Tips for Success

### 1. Clear Requirements

The more specific your initial goal, the better the results.

### 2. Trust the Process

Let each phase complete before intervening.

### 3. Review Artifacts

Check the artifacts to understand decisions and progress.

### 4. Respond Promptly

When escalated to, respond to keep workflow moving.

### 5. Adjust Settings

Tune quality/testing settings to match your project needs.

## Troubleshooting

### "No tasks found"

Run `/company` to start a new project.

### "Specialist not available"

Use `/company-hire [domain]` to add the needed specialist.

### "Tests failing"

Check test configuration:
```
/company-settings testing
```

Ensure frameworks are installed in your project.

### "Merge blocked"

Check for:
- Failing tests
- Pending code review
- Unresolved QA issues

Use `/company-status` for details.
