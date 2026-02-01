# Architecture

This document describes the technical architecture of the Claude Virtual Company framework.

## Overview

The framework leverages Claude Code's skill system to create a hierarchical software development organization. Each role is implemented as a skill that runs in an isolated context (subagent).

## Core Concepts

### Skills

Skills are the building blocks. Each role and capability is a skill defined in a `SKILL.md` file with YAML frontmatter.

```yaml
---
name: company-developer
context: fork        # Run in isolated subagent
agent: general-purpose
skills:
  - company-protocols  # Preload shared protocols
---
```

### Context Isolation

Using `context: fork`, each role runs in a fresh context. This:
- Prevents context pollution between roles
- Enforces formal handoffs
- Allows parallel execution

### Subagent Types

| Type | Purpose | Tools |
|------|---------|-------|
| `Explore` | Read-only analysis | Read, Glob, Grep |
| `Plan` | Design and planning | Read-only + WebSearch |
| `general-purpose` | Full implementation | All tools |

### Task System

The framework uses Claude Code's task tools for dependency tracking:

```
TaskCreate → TaskUpdate → TaskList → TaskGet
```

Tasks have:
- Status: pending → in_progress → completed
- Owner: assigned role
- Dependencies: blockedBy / blocks
- Metadata: acceptance criteria, governance rules

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│                    (Slash commands in Claude)                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                        Orchestrator                              │
│                      (company skill)                             │
│  - Phase management                                              │
│  - Proposal processing                                           │
│  - Quality gate enforcement                                      │
│  - Subagent spawning                                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼───────┐      ┌───────▼───────┐      ┌───────▼───────┐
│  Role Skills  │      │  Specialists  │      │   Utilities   │
│               │      │               │      │               │
│ - CTO         │      │ - Git Flow    │      │ - Settings    │
│ - Architect   │      │ - Code Review │      │ - Status      │
│ - Tech Lead   │      │ - Test Arch   │      │ - Merge       │
│ - Developer   │      │ - [Dynamic]   │      │ - Roster      │
│ - QA          │      │               │      │               │
└───────────────┘      └───────────────┘      └───────────────┘
                               │
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      Shared Protocols                            │
│                   (company-protocols)                            │
│  - Governance matrix                                             │
│  - Handoff schema                                                │
│  - Quality standards                                             │
│  - Sync protocol                                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      File System State                           │
│                       (.company/)                                │
│                                                                  │
│  config.json    roster.json    state.json                        │
│  proposals/     artifacts/     inboxes/                          │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow Engine

### Phase State Machine

```
                    ┌──────────────┐
                    │     idle     │
                    └──────┬───────┘
                           │ /company
                           ▼
                    ┌──────────────┐
                    │  expertise   │
                    │  assessment  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ architecture │◄────────┐
                    └──────┬───────┘         │
                           │                 │ quality gate fail
                           ▼                 │
                    ┌──────────────┐         │
                    │    design    │◄────────┤
                    └──────┬───────┘         │
                           │                 │
                           ▼                 │
                    ┌──────────────┐         │
                    │   planning   │◄────────┤
                    └──────┬───────┘         │
                           │                 │
                           ▼                 │
                    ┌──────────────┐         │
                    │implementation│─────────┘
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    review    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ verification │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   complete   │
                    └──────────────┘
```

### Proposal Processing

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Submit    │────▶│   Evaluate   │────▶│   Execute   │
│  Proposal   │     │    Rules     │     │  or Reject  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Auto-   │ │  Review  │ │   CEO    │
        │ Approve  │ │ Required │ │ Approval │
        └──────────┘ └──────────┘ └──────────┘
```

## Communication Patterns

### Inbox/Outbox Pattern

Since subagents don't receive broadcasts, we use file-based messaging:

```
.company/inboxes/
├── orchestrator/   # Receives phase completions
├── developer/      # Receives assignments, feedback
├── qa/             # Receives verification requests
└── ...

.company/outboxes/
├── developer/      # Completion notifications
└── ...
```

### Sync Protocol

Agents poll for updates:

```
1. On start: Check inbox, TaskList()
2. Every N ops: TaskList()
3. On complete: Write to outbox, notify
```

### Handoff Protocol

Formal documents transfer work between roles:

```markdown
# Handoff: [From] → [To]

## Deliverables
- artifact1.md
- artifact2.md

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Verification
```bash
command to verify
```
```

## Governance System

### Permission Matrix

Encoded in `.company/governance-matrix.json`:

```json
{
  "handoff_allowed": {
    "cto": ["architect"],
    "architect": ["tech-lead"],
    "developer": ["qa"]
  },
  "task_permissions": {
    "create_task": {
      "developer": ["qa", "self"]
    }
  }
}
```

### Proposal Validation

Python scripts validate proposals:

```
proposals/pending/*.json
       │
       ▼
  validate_proposal.py
       │
       ├──▶ AUTO_APPROVE
       ├──▶ REVIEW_REQUIRED
       └──▶ CEO_REQUIRED
```

## Hooks Integration

Hooks enforce governance at tool level:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": { "tool": "TaskUpdate" },
        "command": "python validate_task_update.py"
      }
    ],
    "PostToolUse": [
      {
        "matcher": { "tool": "TaskUpdate" },
        "command": "python sync_notify.py"
      }
    ]
  }
}
```

## Specialist System

### Dynamic Creation

```
Goal Analysis
     │
     ▼
Hiring Manager ───▶ Expertise Assessment
     │
     ▼
Gap Detection
     │
     ▼
generate_specialist.py ───▶ New SKILL.md
     │
     ▼
Update roster.json
```

### Self-Evaluation

Each role evaluates expertise before work:

```markdown
## Expertise Self-Evaluation

### Check Your Domains
- What does this task require?
- Do you have that expertise?

### If Gap Detected
Submit expertise request proposal
```

## Quality Gates

### Gate Components

1. **Artifact Validation**: Required files exist
2. **Schema Validation**: Handoff has required sections
3. **Acceptance Criteria**: Previous phase criteria met
4. **Test Execution**: Tests pass
5. **Coverage Check**: Meets minimum threshold

### Gate Enforcement

```python
def validate_phase_transition(from_phase, to_phase):
    gate = QUALITY_GATES[f"{from_phase}_to_{to_phase}"]

    # Check artifacts
    for artifact in gate['required_artifacts']:
        if not Path(artifact).exists():
            return False, f"Missing: {artifact}"

    # Run validation script
    result = run(gate['validation_script'])
    if result.returncode != 0:
        return False, result.stderr

    return True, "Gate passed"
```

## Extensibility

### Adding New Roles

1. Create skill in `.claude/skills/company-[role]/SKILL.md`
2. Update orchestrator to spawn the role
3. Add to governance matrix
4. Define handoff paths

### Adding New Specialists

1. Add domain to `expertise-taxonomy.md`
2. Add patterns to `evaluate_expertise.py`
3. Add template to `generate_specialist.py`
4. Test with `/company-hire [domain]`

### Custom Governance Rules

Edit `.company/governance-matrix.json` to:
- Add/modify permissions
- Change auto-approve rules
- Adjust escalation paths
