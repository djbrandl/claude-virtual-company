# Slash Commands Reference

Complete reference for all available slash commands in the Claude Virtual Company framework.

## Core Commands

### `/company [goal]`

**Purpose**: Start a new project with the virtual company.

**Usage**:
```
/company "Build a REST API for managing products with CRUD operations"
```

**What it does**:
1. Initializes `.company/` directory structure
2. Evaluates expertise needs
3. Sets up Git branch
4. Begins the workflow (CTO → Architect → etc.)

**Arguments**:
- `goal`: Description of what to build (required)

**Options**: None

---

### `/company-status`

**Purpose**: Check current workflow state and progress.

**Usage**:
```
/company-status
```

**What it shows**:
- Current phase
- Active goal
- Task summary
- Pending proposals
- Role inbox counts
- Recent activity

**Arguments**: None

---

### `/company-settings [path] [value]`

**Purpose**: View or modify configuration.

**Usage**:
```
# View all settings
/company-settings

# View specific setting
/company-settings quality.test_coverage_minimum

# Modify setting
/company-settings quality.test_coverage_minimum 90
```

**Common settings**:
| Path | Type | Description |
|------|------|-------------|
| `quality.test_coverage_minimum` | number | Min test coverage % |
| `quality.require_code_review` | boolean | Require code review |
| `git_flow.strategy` | string | gitflow, trunk-based |
| `git_flow.squash_on_merge` | boolean | Squash commits |
| `hiring.auto_hire` | boolean | Auto-create specialists |
| `testing.frameworks.e2e` | string | playwright, cypress |

---

### `/company-merge [branch]`

**Purpose**: Merge completed work to main branch.

**Usage**:
```
# Merge current branch
/company-merge

# Merge specific branch
/company-merge feature/user-auth
```

**Process**:
1. Validates clean state
2. Runs all tests
3. Checks code review status
4. Requests CEO approval
5. Executes merge
6. Cleans up branch

**Requirements**:
- All tests passing
- Code review approved
- No uncommitted changes

---

## Team Management

### `/company-roster`

**Purpose**: View current specialists and team composition.

**Usage**:
```
/company-roster
```

**Shows**:
- Core roles (CTO, Architect, etc.)
- Default specialists (Git Flow, Code Reviewer, Test Architect)
- Hired specialists (dynamically created)
- Available domains for hiring

---

### `/company-hire [domain]`

**Purpose**: Manually request a new specialist.

**Usage**:
```
/company-hire frontend-react
/company-hire backend-python
/company-hire testing-e2e
```

**Available domains**:

| Category | Domains |
|----------|---------|
| Frontend | `frontend-react`, `frontend-vue`, `frontend-angular`, `frontend-svelte`, `ui-css`, `ui-accessibility` |
| Backend | `backend-node`, `backend-python`, `backend-go`, `backend-rust`, `backend-java` |
| Database | `database-postgresql`, `database-mongodb`, `database-redis` |
| Infrastructure | `infra-docker`, `infra-kubernetes`, `cloud-aws`, `cloud-gcp` |
| Testing | `testing-unit`, `testing-e2e`, `testing-visual` |
| Security | `security-appsec`, `security-auth` |

---

## Proposals

### `/company-propose [type]`

**Purpose**: Submit a proposal for actions requiring approval.

**Usage**:
```
/company-propose create-task
/company-propose escalate
/company-propose request-expertise
/company-propose reject-handoff
/company-propose scope-change
```

**Proposal types**:

| Type | Purpose | Approval |
|------|---------|----------|
| `create-task` | Create task for another role | Auto/Review |
| `escalate` | Report blocker or issue | Auto (routed) |
| `request-expertise` | Need specialist help | Auto |
| `reject-handoff` | Return incomplete work | Review |
| `scope-change` | Change requirements | CEO |

**Interactive prompts** will gather:
- Target role (for tasks)
- Priority level
- Detailed description
- Justification

---

## Workflow Control

### Resuming Work

There's no explicit resume command. The framework automatically:
1. Reads state from `.company/state.json`
2. Checks pending proposals
3. Continues from last phase

Just run `/company-status` to see where you are.

### Resetting

To reset the workflow:

```bash
# Reset state only
echo '{"phase":"idle"}' > .company/state.json

# Full reset (careful!)
rm -rf .company/
npx claude-virtual-company init
```

---

## Examples

### Starting a Web App Project

```
/company "Build a task management web app with user authentication, task CRUD, and due date reminders"
```

### Checking Progress

```
/company-status
```

### Adjusting Quality Standards

```
# Lower coverage requirement for prototype
/company-settings quality.test_coverage_minimum 60

# Disable E2E for now
/company-settings quality.require_tests.e2e disabled
```

### Adding React Expertise

```
/company-hire frontend-react
```

### Completing and Merging

```
# Check everything is ready
/company-status

# Merge when approved
/company-merge
```

### Changing Scope

```
/company-propose scope-change
# Follow prompts to describe the change
```

---

## Command Availability

| Command | Phase | Available |
|---------|-------|-----------|
| `/company` | Any | Always |
| `/company-status` | Any | Always |
| `/company-settings` | Any | Always |
| `/company-merge` | complete | After QA pass |
| `/company-roster` | Any | Always |
| `/company-hire` | Any | Always |
| `/company-propose` | Active workflow | During work |

---

---

## Project Manager Commands (GSD-Inspired)

### `/company-init-pm`

**Purpose**: Initialize the project manager directory structure.

**Usage**:
```
/company-init-pm
```

**What it does**:
- Creates `.planning/` directory structure
- Initializes `config.json` and `STATE.md`
- Prepares for project definition

---

### `/company-new-project`

**Purpose**: Start a new project with vision capture, requirements, and roadmap.

**Usage**:
```
/company-new-project "Build a task management app"
```

**What it does**:
1. Captures project vision interactively
2. Creates PROJECT.md with objectives
3. Creates REQUIREMENTS.md with v1/v2 scope
4. Runs domain research
5. Creates ROADMAP.md with phases

---

### `/company-discuss [phase]`

**Purpose**: Capture implementation preferences and resolve gray areas before planning.

**Usage**:
```
/company-discuss phase-1
```

**What it does**:
- Identifies decision points for the phase
- Asks clarifying questions
- Documents decisions in CONTEXT.md

---

### `/company-plan-phase [phase]`

**Purpose**: Create detailed executable plans with atomic tasks.

**Usage**:
```
/company-plan-phase phase-1
```

**What it does**:
- Researches implementation approach
- Defines success criteria (goal-backward)
- Creates PLAN.md files with XML tasks
- Verifies plan before execution

---

### `/company-execute [phase]`

**Purpose**: Execute phase plans with parallel waves and atomic commits.

**Usage**:
```
/company-execute phase-1
```

**What it does**:
- Loads plans for the phase
- Executes in parallel waves
- Creates atomic commits per task
- Tracks progress in SUMMARY.md

---

### `/company-verify [phase]`

**Purpose**: Verify phase completion with automated checks and UAT.

**Usage**:
```
/company-verify phase-1
```

**What it does**:
- Runs automated verification (tests, lint, coverage)
- Checks goal-backward criteria
- Conducts user acceptance testing
- Creates VERIFICATION.md and UAT.md

---

### `/company-progress`

**Purpose**: Check project progress and get recommended next action.

**Usage**:
```
/company-progress
```

**What it shows**:
- Current milestone and phase
- Phase completion status
- Open tasks and blockers
- Recommended next command

---

### `/company-pause`

**Purpose**: Create context handoff for pausing work.

**Usage**:
```
/company-pause
```

**What it does**:
- Documents current position
- Lists uncommitted changes
- Creates resume instructions in STATE.md

---

### `/company-resume`

**Purpose**: Resume work from previous session.

**Usage**:
```
/company-resume
```

**What it does**:
- Loads pause context
- Confirms resumption point
- Continues execution

---

### `/company-milestone`

**Purpose**: Complete current milestone and prepare for next.

**Usage**:
```
/company-milestone
```

**What it does**:
- Verifies all phases complete
- Creates milestone summary
- Merges and tags release
- Archives phase artifacts
- Updates roadmap for next milestone

---

### `/company-quick [task]`

**Purpose**: Quick mode for ad-hoc tasks without full ceremony.

**Usage**:
```
/company-quick "Fix button alignment on login page"
```

**What it does**:
- Skips research and plan verification
- Maintains atomic commits
- Logs in `.planning/quick/`

**Good for**:
- Bug fixes
- Small features
- Config changes
- Documentation

---

## Tips

1. **Use `/company-status` frequently** to track progress
2. **Respond to escalations** promptly to keep workflow moving
3. **Adjust settings** before starting if needed
4. **Check artifacts** to understand decisions made by roles
5. **Use proposals** for any cross-role needs
6. **Use `/company-progress`** to see recommended next action
7. **Use `/company-pause`** before ending a session
8. **Use `/company-quick`** for small ad-hoc tasks
