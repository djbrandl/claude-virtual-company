# Claude Virtual Company

A Claude Code skill framework that simulates a hierarchical software development company. You act as the CEO, delegating work through a structured engineering organization with proper governance, quality gates, and dynamic specialist hiring.

## Features

- **Hierarchical Role System**: CTO, Architect, Tech Lead, Senior Dev, Developer, QA
- **Dynamic Specialist Hiring**: Automatically creates specialists based on project needs
- **Proposal-Based Governance**: Cross-role actions require approval
- **Quality Gates**: Mandatory testing, code review, and acceptance criteria
- **Git Flow Integration**: Built-in branching strategy and PR workflows
- **Task Dependency Tracking**: Manage complex work with dependencies
- **Fresh Context Windows**: Each role operates in isolation with explicit handoffs
- **GSD-Inspired Project Management**: Phase-based workflow with discuss→plan→execute→verify cycles
- **State Persistence**: Pause and resume work across sessions with full context
- **Automatic Context Management**: Tiered document loading, context decay, and archival to prevent bloat

## Quick Start

### Installation

```bash
npx claude-virtual-company init
```

Or install globally:

```bash
npx claude-virtual-company init --global
```

### Start a Project

1. Open Claude Code in your project directory
2. Start a new project:

```
/company "Build a user authentication system with email/password login"
```

3. The orchestrator will:
   - Evaluate expertise needs and hire specialists
   - Create a feature branch
   - Guide work through the hierarchy
   - Ensure quality at each phase

### Check Status

```
/company-status
```

### Merge When Complete

```
/company-merge
```

## How It Works

### The Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         CEO (You)                                │
│                    Provides Vision/Goal                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    /company Orchestrator                         │
│              (Manages workflow, tracks state)                    │
└─────────────────────────────────────────────────────────────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
    ┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐
    │  CTO  │──▶│ Arch  │──▶│ Lead  │──▶│ Dev   │──▶│  QA   │
    └───────┘   └───────┘   └───────┘   └───────┘   └───────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
    [Strategy] [Design]    [Plan]     [Code]    [Verified]
```

### Workflow Phases

1. **Expertise Assessment**: Hiring manager evaluates what specialists are needed
2. **Architecture (CTO)**: Technical strategy and technology decisions
3. **Design (Architect)**: Component design, API contracts, data models
4. **Planning (Tech Lead)**: Feature breakdown, task creation, dependency mapping
5. **Implementation (Developer)**: Code implementation with tests
6. **Review (Code Reviewer)**: Quality, security, and standards check
7. **Verification (QA)**: Comprehensive testing and validation
8. **Merge**: PR creation and merge to main

### Quality Gates

Each phase transition requires:
- Completed artifacts in `.company/artifacts/[role]/`
- Handoff document with acceptance criteria
- Passing verification commands
- No blocking issues

### Project Manager Workflow (GSD-Inspired)

For larger projects, use the full PM workflow:

```
/company-new-project "Build a task management app"
```

This initiates a structured cycle:

1. **Discuss** - Capture implementation preferences and resolve gray areas
2. **Plan** - Create atomic tasks (max 2-3 per plan) with XML format
3. **Execute** - Parallel wave execution with atomic commits
4. **Verify** - Automated checks + User Acceptance Testing

Each phase produces artifacts in `.planning/phase-{N}/`:
- `CONTEXT.md` - Decisions from discuss phase
- `{N}-PLAN.md` - Executable task plans
- `{N}-SUMMARY.md` - Completion records
- `VERIFICATION.md` - Test results
- `UAT.md` - User acceptance confirmation

Use `/company-progress` to see current state and recommended next action.

Use `/company-quick "task"` for ad-hoc work without full ceremony.

## Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `/company [goal]` | Start a new project |
| `/company-status` | Check workflow state |
| `/company-settings [path] [value]` | View/modify configuration |
| `/company-merge [branch]` | Merge to main with validation |
| `/company-roster` | View specialists |
| `/company-hire [domain]` | Request new specialist |
| `/company-propose [type]` | Submit a proposal |

### Project Manager Commands (GSD-Inspired)

| Command | Description |
|---------|-------------|
| `/company-new-project` | Start new project with roadmap |
| `/company-progress` | Check progress, route to next action |
| `/company-discuss [N]` | Capture phase requirements |
| `/company-plan-phase [N]` | Create executable plans |
| `/company-execute [N]` | Execute plans with parallel waves |
| `/company-verify [N]` | Verify phase completion + UAT |
| `/company-quick [task]` | Quick mode for ad-hoc tasks |
| `/company-pause` | Create context handoff |
| `/company-resume` | Resume from previous session |
| `/company-milestone` | Complete and archive milestone |

## Configuration

Configuration is stored in `.company/config.json`. Key settings:

### Model Settings

Configure which Claude model to use for each role. More capable models (opus) are used for strategic roles, while faster models (sonnet/haiku) handle implementation tasks.

```json
{
  "company": {
    "models": {
      "cto": "opus",
      "architect": "opus",
      "tech-lead": "opus",
      "developer": "sonnet",
      "senior-dev": "sonnet",
      "code-reviewer": "sonnet",
      "qa": "opus",
      "hiring-manager": "haiku"
    }
  }
}
```

Available models: `opus`, `sonnet`, `haiku`

Modify model for a role:

```
/company-settings company.models.developer haiku
```

### Quality Settings

```json
{
  "quality": {
    "test_coverage_minimum": 80,
    "require_tests": {
      "unit": "required",
      "integration": "required",
      "e2e": "required_for_user_flows",
      "ui": "required_for_frontend"
    },
    "require_code_review": true
  }
}
```

### Git Flow Settings

```json
{
  "git_flow": {
    "strategy": "gitflow",
    "require_pr": true,
    "squash_on_merge": true
  }
}
```

### Hiring Settings

```json
{
  "hiring": {
    "auto_hire": true,
    "require_ceo_approval_for_new_roles": false,
    "expertise_evaluation": {
      "on_project_init": true,
      "on_escalation": true,
      "self_evaluation_enabled": true
    }
  }
}
```

Modify settings:

```
/company-settings quality.test_coverage_minimum 90
```

## Specialists

### Default Specialists

- **Git Flow**: Branching strategy, commit conventions, PR workflows
- **Code Reviewer**: Code quality, security, best practices
- **Test Architect**: Testing strategy, unit/integration/E2E

### Available Domains

The hiring manager can create specialists for:

- **Frontend**: React, Vue, Angular, Svelte, CSS, Accessibility
- **Backend**: Node.js, Python, Go, Rust, Java, .NET
- **Database**: PostgreSQL, MongoDB, Redis
- **Infrastructure**: Docker, Kubernetes, AWS, GCP
- **Testing**: Unit, Integration, E2E, Visual
- **Security**: Application security, Authentication

### Manual Hiring

```
/company-hire frontend-react
```

## Governance

### Proposal System

Cross-role actions require proposals:

| Action | Auto-Approve | Needs Review | Needs CEO |
|--------|--------------|--------------|-----------|
| Create own subtask | ✅ | | |
| Developer → QA task | ✅ | | |
| Cross-role task | | ✅ | |
| Reject handoff | | ✅ | |
| Scope change | | | ✅ |
| Block release | | | ✅ |

### Escalation

Issues are escalated based on severity:
- **Low**: Orchestrator resolves
- **Medium**: Senior role consulted
- **High**: CEO notified
- **Blocking**: Immediate CEO decision

## Project Structure

After installation:

```
.claude/
└── skills/
    ├── company/              # Main orchestrator
    ├── company-protocols/    # Shared standards
    ├── company-git-flow/     # Git expertise
    ├── company-[role]/       # Role skills
    └── company-specialists/  # Dynamic specialists

.company/
├── config.json              # Configuration
├── roster.json              # Specialists roster
├── state.json               # Workflow state
├── proposals/               # Pending/approved/rejected
├── artifacts/               # Role outputs
└── inboxes/                 # Role communication

.planning/                   # Project Manager (GSD-inspired)
├── config.json              # PM configuration
├── PROJECT.md               # Vision and objectives
├── REQUIREMENTS.md          # Scoped requirements
├── ROADMAP.md               # Phase breakdown
├── STATE.md                 # Session state and decisions
├── phase-{N}/               # Phase artifacts
│   ├── CONTEXT.md           # Phase decisions
│   ├── {N}-PLAN.md          # Executable plans
│   ├── {N}-SUMMARY.md       # Completion summaries
│   └── VERIFICATION.md      # Verification results
└── quick/                   # Ad-hoc task tracking
```

## Best Practices

### For Best Results

1. **Clear Goals**: Provide specific, well-defined project goals
2. **Let It Work**: Allow the workflow to progress through phases
3. **Review Escalations**: Respond to CEO-level decisions promptly
4. **Check Status**: Use `/company-status` to monitor progress

### Customization

1. **Adjust Quality**: Set appropriate coverage and test requirements
2. **Configure Git**: Match your team's branching strategy
3. **Manage Specialists**: Add domain-specific expertise as needed

## Context Management

The framework includes automatic context management to keep Claude's context fresh and prevent bloat during long projects.

### Tiered Document Loading

Handoffs and artifacts use tier markers for progressive loading:

```markdown
<!-- TIER:SUMMARY -->
TL;DR in ~50 words - always loaded
<!-- /TIER:SUMMARY -->

<!-- TIER:DECISIONS -->
Acceptance criteria, verification commands, key constraints - loaded by default
<!-- /TIER:DECISIONS -->

<!-- TIER:FULL -->
Full rationale, alternatives considered - loaded only when blocked
<!-- /TIER:FULL -->
```

Each role skill automatically loads the appropriate tier (usually SUMMARY + DECISIONS) from upstream artifacts. If you need full context while working, run:

```bash
cat .company/artifacts/[role]/[file].md
```

### Automatic Context Decay

- **Session Log Trimming**: When `STATE.md` exceeds 500 lines, old session entries are archived to `.planning/archive/sessions/` and only the 10 most recent entries are kept
- **Milestone Archival**: When completing a milestone, all phase directories move to `.planning/archive/v{version}/`
- **Quick Task Cleanup**: Quick tasks older than 7 days are automatically archived
- **Proposal Archival**: Approved/rejected proposals older than 30 days are archived

### Configuration

Context management settings in `templates/pm-config.json`:

```json
{
  "context_management": {
    "session_log_max_entries": 25,
    "summarize_after_entries": 20,
    "archive_completed_phases": true,
    "handoff_max_lines": 100,
    "default_tier": "decisions",
    "quick_task_retention_days": 7
  }
}
```

### Platform Utilities

For programmatic context management, `src/platform.js` provides:

```javascript
const { readTier, trimSessionLog, archiveAndResetState } = require('./src/platform');

// Read specific tier from a tiered document
const decisions = readTier('.company/artifacts/architect/handoff.md', 'decisions');

// Trim session log keeping only recent entries
trimSessionLog('.planning/STATE.md', 10);

// Archive STATE.md and create fresh one for new milestone
archiveAndResetState('.planning/STATE.md', '.planning/archive/v1.0/');
```

### Writing Tiered Documents

When creating handoffs or key artifacts, structure them with tiers:

1. **SUMMARY tier**: One-liner decisions, tech choices, key constraints
2. **DECISIONS tier**: Acceptance criteria, verification commands, must-know details
3. **FULL tier**: Rationale, alternatives considered, detailed context

This ensures downstream roles get exactly the context they need without loading historical rationale they don't.

## Windows Compatibility

The skill files (`.claude/skills/company*/SKILL.md`) contain bash commands that Claude executes. While the Node.js CLI (`cvc`) works on all platforms, the skill commands assume a Unix-like shell environment.

### Recommended Environments

For full compatibility on Windows, use one of these terminals:

- **Git Bash** (included with Git for Windows) - Recommended
- **WSL/WSL2** (Windows Subsystem for Linux)
- **PowerShell with Unix tools** (via chocolatey or scoop)

### Commands That May Need Alternatives

Some bash commands used in skill files have Windows equivalents:

| Bash Command | Purpose | Windows Alternative |
|--------------|---------|---------------------|
| `date -Iseconds` | ISO timestamp | Use `src/platform.js:getISOTimestamp()` |
| `tr \| sed \| cut` | String slugify | Use `src/platform.js:slugify()` |
| `cat file \|\| echo '{}'` | Safe JSON read | Use `src/platform.js:readJsonSafe()` |
| `mkdir -p` | Create nested dirs | Works in PowerShell 5+ |
| `find` / `ls` | File listing | Works in Git Bash |

### Cross-Platform Utilities

For programmatic use, the `src/platform.js` module provides cross-platform Node.js alternatives:

```javascript
const { getISOTimestamp, slugify, readJsonSafe } = require('./src/platform');

// Instead of: date -Iseconds
const timestamp = getISOTimestamp();

// Instead of: echo "$str" | tr ... | sed ... | cut ...
const branchName = slugify('My Feature Name', 40);

// Instead of: cat file.json 2>/dev/null || echo '{}'
const config = readJsonSafe('.company/config.json', {});
```

## Troubleshooting

### Workflow Stuck

1. Check `/company-status` for current state
2. Look for pending proposals in `.company/proposals/pending/`
3. Check role inboxes for blocked messages
4. Reset state if needed: `echo '{"phase":"idle"}' > .company/state.json`

### Tests Failing

1. Ensure test frameworks are installed
2. Check test configuration in `.company/config.json`
3. Review test output in QA artifacts

### Specialist Not Found

1. Check roster with `/company-roster`
2. Manually hire with `/company-hire [domain]`
3. Verify skill files exist in `.claude/skills/company-specialists/`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built for [Claude Code](https://claude.ai/code) by Anthropic.

Uses the [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) framework.
