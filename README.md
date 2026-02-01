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

## Commands

| Command | Description |
|---------|-------------|
| `/company [goal]` | Start a new project |
| `/company-status` | Check workflow state |
| `/company-settings [path] [value]` | View/modify configuration |
| `/company-merge [branch]` | Merge to main with validation |
| `/company-roster` | View specialists |
| `/company-hire [domain]` | Request new specialist |
| `/company-propose [type]` | Submit a proposal |

## Configuration

Configuration is stored in `.company/config.json`. Key settings:

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
