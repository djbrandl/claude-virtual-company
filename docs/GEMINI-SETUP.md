# Gemini CLI Setup Guide

This guide covers installing and configuring Claude Virtual Company (CVC) for Gemini CLI.

## Prerequisites

- Node.js 18 or higher
- Gemini CLI installed and configured
- A Google AI API key (for Gemini)

## Installation

### Install for Both Providers (Recommended)

```bash
# Default: installs for both Claude Code and Gemini CLI
npx claude-virtual-company init
```

### Install for Gemini Only

```bash
npx claude-virtual-company init --provider gemini
```

### Global Installation

For system-wide availability:

```bash
npx claude-virtual-company init --global --provider gemini
```

## What Gets Installed

### Directory Structure

After installation, your project will have:

```
your-project/
├── GEMINI.md                    # Project context (root level)
├── .gemini/                     # Gemini CLI configuration
│   ├── context/                 # Role context files
│   │   ├── company.md
│   │   ├── company-cto.md
│   │   ├── company-architect.md
│   │   └── ... (all roles)
│   ├── commands/company/        # TOML command definitions
│   │   ├── company.toml
│   │   ├── company-cto.toml
│   │   └── ... (all commands)
│   └── settings.json            # MCP server configuration
├── .company/                    # Shared state (works with both providers)
│   ├── config.json
│   ├── state.json
│   ├── roster.json
│   ├── artifacts/
│   ├── tasks/
│   └── ...
└── .planning/                   # Project management state
```

### MCP Task Server

The installation configures an MCP server that provides task management tools:

- `cvc_task_create` - Create a new task
- `cvc_task_list` - List all tasks
- `cvc_task_get` - Get task details
- `cvc_task_update` - Update task status

Tasks are stored in `.company/tasks/` and persist across sessions.

## Using CVC with Gemini CLI

### Starting a Project

```bash
# Start Gemini CLI
gemini

# In Gemini, use the company command
/company "Build a REST API for user management"
```

### Available Commands

| Command | Description |
|---------|-------------|
| `/company` | Main orchestrator - routes work through the hierarchy |
| `/company-cto` | Technical strategy and architecture decisions |
| `/company-architect` | System design and component architecture |
| `/company-ui-designer` | UI/UX design specifications |
| `/company-tech-lead` | Feature breakdown and task planning |
| `/company-developer` | Implementation and coding |
| `/company-qa` | Quality assurance and verification |
| `/company-new-project` | Initialize a new project with full PM workflow |
| `/company-progress` | Check project status |
| `/company-status` | System status |

### Task Management

The MCP task server integrates with Gemini CLI. Use these tools:

```
# Create a task
cvc_task_create with subject="Implement login" description="Create login form with validation"

# List tasks
cvc_task_list

# Update task status
cvc_task_update with taskId="1" status="in_progress"
```

## Configuration

### Company Configuration

Edit `.company/config.json` to customize:

```json
{
  "company": {
    "name": "My Virtual Company",
    "initialized": true
  },
  "models": {
    "cto": "opus",
    "architect": "opus",
    "developer": "sonnet",
    "qa": "opus"
  },
  "quality": {
    "test_coverage_minimum": 80,
    "require_code_review": true
  }
}
```

### Gemini Settings

The `.gemini/settings.json` file configures the MCP task server:

```json
{
  "mcpServers": {
    "cvc-task-server": {
      "command": "node",
      "args": ["node_modules/claude-virtual-company/mcp/task-server/index.js"],
      "description": "Claude Virtual Company task management tools"
    }
  }
}
```

## Limitations on Gemini CLI

### Model Selection Not Supported

The per-role model selection feature (`.company/config.json` → `company.models`) only works on Claude Code. On Gemini CLI:

- Model configuration in `config.json` is ignored
- All roles use your globally configured Gemini model
- Model references are automatically stripped during skill transpilation

To change the model used by Gemini CLI, configure it in your Gemini CLI settings, not in CVC.

## Workflow Differences from Claude Code

### Sequential Execution

Gemini CLI executes roles sequentially rather than in parallel. The workflow maintains state through:

1. **State files** - `.company/state.json` tracks current phase
2. **Artifact handoffs** - Roles write to `.company/artifacts/*/handoff-*.md`
3. **Inbox messages** - Roles communicate via `.company/inboxes/*/`

### No Context Isolation

Unlike Claude Code's `context: fork`, Gemini CLI doesn't isolate agent contexts. Instead:

- Each role reads state files to understand context
- Roles write detailed handoff documents
- The next role loads these files before starting

### No Native Hooks

Gemini CLI doesn't support hooks like Claude Code. The framework provides:

- Clear instructions in context files
- Reminder prompts in TOML commands
- Trust-based guidance instead of enforced restrictions

## Troubleshooting

### MCP Server Not Working

1. Verify the server is configured in `.gemini/settings.json`
2. Check the path to the server is correct
3. Ensure Node.js 18+ is available

```bash
# Test the server manually
node node_modules/claude-virtual-company/mcp/task-server/index.js
```

### Commands Not Found

1. Verify `.gemini/commands/company/` contains TOML files
2. Check TOML syntax is valid
3. Restart Gemini CLI after installation

### Context Not Loading

1. Verify `.gemini/context/` contains the role's `.md` file
2. Check the file isn't empty
3. Ensure GEMINI.md exists in project root

## Upgrading

To upgrade to a newer version:

```bash
npx claude-virtual-company upgrade
```

Or force reinstall:

```bash
npx claude-virtual-company init --force --provider gemini
```

## Uninstalling

To remove CVC files for Gemini:

```bash
npx claude-virtual-company uninstall --provider gemini
```

Note: The `.company/` directory is preserved. Remove it manually if you want to completely remove all CVC data.

## Support

- Documentation: https://github.com/djbrandl/claude-virtual-company
- Issues: https://github.com/djbrandl/claude-virtual-company/issues
