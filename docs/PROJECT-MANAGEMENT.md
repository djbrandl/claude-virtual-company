# Project Management (GSD-Inspired)

The Claude Virtual Company includes a Project Manager that uses methodology inspired by [Get Shit Done](https://github.com/glittercowboy/get-shit-done) for structured, reliable project execution.

## Core Philosophy

- **Context Engineering**: Deliberate management of what information is available at each stage
- **Plans as Executable Prompts**: PLAN.md IS the prompt, not a document that becomes one
- **Phase-Based Workflow**: discuss → plan → execute → verify cycles
- **Goal-Backward Verification**: Derive truths, artifacts, and key links from success criteria
- **Atomic Commits**: One commit per task with traceable history

---

## Directory Structure

```
.planning/
├── config.json              # PM configuration
├── PROJECT.md               # Vision and objectives
├── REQUIREMENTS.md          # Scoped v1/v2 features
├── ROADMAP.md               # Phase breakdown with status
├── STATE.md                 # Decisions, blockers, session history
├── research/                # Domain research outputs
├── phase-{N}/               # Per-phase artifacts
│   ├── CONTEXT.md           # Phase-specific context
│   ├── RESEARCH.md          # Technical research
│   ├── {N}-PLAN.md          # Executable plans (2-3 tasks each)
│   ├── {N}-SUMMARY.md       # Completion summaries
│   ├── VERIFICATION.md      # Verification results
│   └── UAT.md               # User acceptance testing
├── quick/                   # Ad-hoc task tracking
│   └── {N}-{task}/
└── archive/                 # Completed milestones
    └── v{version}/
```

---

## Workflow Overview

```
┌────────────────────────────────────────────────────────────────┐
│                     /company-new-project                       │
│            Define vision, requirements, roadmap                │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PHASE CYCLE                               │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Discuss    │───▶│    Plan      │───▶│   Execute    │      │
│  │ Gray areas   │    │ 2-3 tasks    │    │ Parallel     │      │
│  │ Preferences  │    │ XML format   │    │ Atomic       │      │
│  └──────────────┘    └──────────────┘    └──────┬───────┘      │
│                                                 │               │
│                                                 ▼               │
│                                          ┌──────────────┐      │
│                                          │   Verify     │      │
│                                          │ Auto + UAT   │      │
│                                          └──────────────┘      │
│                                                 │               │
│                          ┌──────────────────────┴───────┐      │
│                          │                              │      │
│                     Pass │                         Fail │      │
│                          ▼                              ▼      │
│                    Next Phase                    Fix & Retry   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (All phases complete)
┌─────────────────────────────────────────────────────────────────┐
│                     /company-milestone                          │
│              Archive, tag, merge, start next                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Commands

### Initialization

| Command | Description |
|---------|-------------|
| `/company-init-pm` | Initialize PM directory structure |
| `/company-new-project` | Start new project with vision capture |

### Phase Workflow

| Command | Description |
|---------|-------------|
| `/company-discuss [N]` | Capture implementation preferences for phase N |
| `/company-plan-phase [N]` | Create PLAN.md with atomic tasks |
| `/company-execute [N]` | Execute plans with parallel waves |
| `/company-verify [N]` | Verify phase completion (automated + UAT) |

### Progress & State

| Command | Description |
|---------|-------------|
| `/company-progress` | Check progress, route to next action |
| `/company-pause` | Create context handoff for session break |
| `/company-resume` | Resume from previous session |

### Milestones

| Command | Description |
|---------|-------------|
| `/company-milestone` | Complete current milestone and archive |

### Quick Mode

| Command | Description |
|---------|-------------|
| `/company-quick [task]` | Fast execution for ad-hoc tasks |

---

## Phase Workflow Detail

### 1. Discuss Phase

Before planning, identify gray areas specific to what's being built:

**For UI/Frontend:**
- Layout preferences
- Component hierarchy
- Responsive breakpoints

**For APIs:**
- Request/response formats
- Error handling patterns
- Authentication flow

**For Data:**
- Schema structure
- Validation rules
- Migration strategy

The discuss phase produces `CONTEXT.md` with decisions and preferences.

### 2. Plan Phase

Create executable plans using goal-backward methodology:

1. **Define Success Criteria** - What does "done" look like?
2. **Derive Truths** - Observable behaviors from user perspective
3. **Derive Artifacts** - Files/objects that must exist
4. **Map Key Links** - Critical connections between components
5. **Break Into Tasks** - Atomic, verifiable steps (max 2-3 per plan)

### 3. Execute Phase

Execute plans in waves:

```
Wave 1: Independent tasks (parallel)
  ├── Task 1.1 (Developer A)
  ├── Task 1.2 (Developer B)
  └── Task 1.3 (Developer C)

Wave 2: Dependent tasks
  └── Task 2.1 (requires 1.1, 1.2)

Wave 3: Integration
  └── Task 3.1 (requires all)
```

Each task produces an atomic commit.

### 4. Verify Phase

Two-layer verification:

**Automated:**
- Tests pass
- Lint passes
- Coverage threshold met
- Verify commands from plans

**User Acceptance (UAT):**
- User confirms behavior matches requirements
- Edge cases verified manually

---

## Task XML Format

Plans use strict XML structure for unambiguous execution:

```xml
<task type="auto">
  <name>Task 1: Create User Service</name>
  <files>src/services/user.ts</files>
  <action>
    Create UserService class that:
    1. Implements createUser(email, password) method
    2. Hashes password with bcrypt
    3. Returns user object without password

    Constraints:
    - Use existing DatabaseService for persistence
    - Follow repository pattern from src/services/base.ts
  </action>
  <verify>
    ```bash
    npx tsc --noEmit src/services/user.ts
    grep -q "createUser" src/services/user.ts
    ```
  </verify>
  <done>
    - UserService class exists in src/services/user.ts
    - createUser method implemented
    - Password hashing included
  </done>
</task>
```

### Task Types

| Type | Description |
|------|-------------|
| `auto` | Claude executes autonomously |
| `checkpoint:human-verify` | Requires user verification |
| `checkpoint:decision` | User chooses from options |

---

## Plan Constraints

1. **Maximum 2-3 tasks per plan**
2. **Complete within ~50% of context window**
3. **15-60 minute execution time per plan**
4. **Stop before quality degradation begins**

For complex phases, create multiple sequential plans.

---

## State Management

### STATE.md

Living document tracking:
- Current phase and progress
- Session log with timestamps
- Active decisions and rationale
- Open blockers
- Resume point for next session

### Resume Point Format

```markdown
## ▶ Resume Point

**Paused:** 2024-01-15T10:30:00Z

**Last completed:** Phase 2, Plan 1

**In progress:** Phase 2, Plan 2, Task 1

**Next action:** Complete Task 1, then run Plan 2 Task 2

**Command to resume:**
`/company-resume`
```

---

## Quick Mode

For ad-hoc work without full ceremony:

```
/company-quick "Fix login button alignment"
```

Quick mode:
- Skips research phase
- Skips plan verification
- Maintains atomic commits
- Tracks state in `.planning/quick/`

**Use for:**
- Bug fixes
- Small features (< 3 files)
- Config changes
- Documentation updates

---

## Commit Conventions

**Format:** `{type}({phase}-{plan}): {description}`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `test` - Tests only
- `refactor` - Code cleanup
- `docs` - Documentation
- `chore` - Config/dependencies

**Example:**
```
feat(phase-2-1): Implement user authentication service

- Add UserService with createUser/authenticateUser methods
- Include password hashing with bcrypt
- Add JWT token generation

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Integration with Company Hierarchy

The PM coordinates with company roles:

| Phase | Primary Role | PM Responsibility |
|-------|-------------|-------------------|
| Discuss | CTO/Architect | Capture requirements |
| Plan | Tech Lead | Create task breakdown |
| Execute | Developer(s) | Track progress, parallel waves |
| Verify | QA | Coordinate testing |
| Review | Code Reviewer | Gate quality |

---

## Best Practices

### 1. Clear Project Definition
Invest time in PROJECT.md and REQUIREMENTS.md. Clarity here prevents issues later.

### 2. Discuss Before Planning
Identify gray areas before creating plans. Unknown decisions during execution cause problems.

### 3. Small Plans
Keep plans to 2-3 tasks. Quality degrades with context accumulation.

### 4. Verify Everything
Don't skip verification. Automated checks catch regressions, UAT confirms intent.

### 5. Use Quick Mode Appropriately
Quick mode is for small, well-understood changes. Use full workflow for anything complex.

### 6. Pause Properly
When stepping away, use `/company-pause` to create proper handoff context.

---

## Troubleshooting

### "No state file"
Run `/company-init-pm` to create PM directory structure.

### "No roadmap"
Run `/company-new-project` to define project vision and create roadmap.

### "Phase not verified"
Each phase must pass verification before proceeding. Check VERIFICATION.md for failures.

### "Context budget exceeded"
Plans are too large. Break into smaller plans with fewer tasks.

### "Task failed verification"
Review verify commands in PLAN.md. Either fix the implementation or update verify if it's incorrect.
