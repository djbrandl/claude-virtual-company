# Provider Comparison: Claude Code vs Gemini CLI

This document compares the features and capabilities of Claude Virtual Company (CVC) across different AI coding assistants.

## Feature Support Matrix

| Feature | Claude Code | Gemini CLI | Notes |
|---------|-------------|------------|-------|
| **Core Functionality** ||||
| Slash commands | ✅ Full | ✅ Full | TOML-based on Gemini |
| Task management | ✅ Native | ✅ MCP Server | Same API, different backend |
| Role execution | ✅ Full | ✅ Full | All roles work on both |
| State persistence | ✅ Full | ✅ Full | Shared `.company/` directory |
| Artifact generation | ✅ Full | ✅ Full | Same output structure |
| **Execution Model** ||||
| Subagent isolation | ✅ Native (`context: fork`) | ⚠️ Simulated | Sequential with checkpoints |
| Parallel execution | ✅ Native (background tasks) | ❌ Sequential | Parallel on Claude only |
| Tool restrictions | ✅ Native (`allowed-tools`) | ⚠️ Trust-based | Guidance only on Gemini |
| Per-role model selection | ✅ Full | ❌ Not supported | See limitation below |
| **Developer Experience** ||||
| Hooks | ✅ Native | ❌ None | No equivalent on Gemini |
| Dynamic context loading | ✅ Backtick syntax | ⚠️ Pre-loaded | Manual file reads on Gemini |
| User questions | ✅ Native (`AskUserQuestion`) | ✅ Text prompts | Simpler on Gemini |
| MCP servers | ✅ Native | ✅ Native | Both support MCP |
| **Installation** ||||
| Global install | ✅ `~/.claude/skills/` | ✅ `~/.gemini/` | Different locations |
| Local install | ✅ `.claude/skills/` | ✅ `.gemini/` | Project-specific |
| Dual provider | ✅ Default | ✅ Default | Both installed by default |

## Detailed Comparisons

### Model Selection

**Claude Code:**
```json
// In .company/config.json
{
  "company": {
    "models": {
      "cto": "opus",
      "architect": "opus",
      "developer": "sonnet",
      "qa": "opus"
    }
  }
}
```
- Per-role model selection (opus/sonnet/haiku)
- Strategic roles use more capable models
- Implementation roles use faster models

**Gemini CLI:**
- ❌ **Not supported** - Model selection is stripped during transpilation
- Gemini CLI uses whatever model is configured globally
- All roles run on the same model
- Configure your preferred model in Gemini CLI settings

This is a known limitation. The `.company/config.json` model settings only affect Claude Code.

### Context Isolation

**Claude Code:**
```yaml
# In SKILL.md
context: fork  # Creates isolated execution context
```
- Each role runs in a completely separate context
- No cross-contamination between roles
- Native memory management

**Gemini CLI:**
```markdown
# In context file
Save important context to files before moving to the next role.
Read context files from previous roles before starting.
```
- Sequential execution with explicit handoffs
- Roles write checkpoint files
- Manual context management through file system

### Parallel Execution

**Claude Code:**
```javascript
// Spawn multiple agents in parallel
Task(subagent_type: "company-architect", run_in_background: true)
Task(subagent_type: "company-ui-designer", run_in_background: true)
// Both run simultaneously
```

**Gemini CLI:**
```markdown
# Execute sequentially
1. Run architect role, wait for completion
2. Then run UI designer role
# No native parallel execution
```

### Task Management

**Claude Code:**
```javascript
// Native tools
TaskCreate(subject: "Implement feature", description: "...")
TaskList()
TaskUpdate(taskId: "1", status: "completed")
```

**Gemini CLI:**
```javascript
// Via MCP server - same interface
cvc_task_create(subject: "Implement feature", description: "...")
cvc_task_list()
cvc_task_update(taskId: "1", status: "completed")
```

### Dynamic Context

**Claude Code:**
```markdown
## Current State
!`cat .company/state.json 2>/dev/null || echo '{"phase":"init"}'`

## Your Inbox
!`find .company/inboxes/cto -name "*.json" -exec cat {} \;`
```
- Inline bash commands execute at runtime
- Results embedded in prompt context

**Gemini CLI:**
```markdown
## Context Loading

Before executing this role, load the following context:

### Required State Files
- .company/state.json
- .company/config.json

**[Load State]** Read `.company/state.json` and use its contents here.
```
- Instructions to manually load files
- No automatic injection

### Tool Restrictions

**Claude Code:**
```yaml
# In SKILL.md
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - WebSearch
```
- Enforced by the runtime
- Tools outside list are blocked

**Gemini CLI:**
```markdown
### Recommended Tools
This role is designed to use these tools:
- Read
- Glob
- Grep
- Bash
- WebSearch

**Guidance**: Stick to these tools to match the original role's behavior.
```
- Trust-based guidance
- Not enforced by runtime

## When to Use Each Provider

### Choose Claude Code When:
- You need parallel execution for faster workflows
- Strict tool restrictions are important
- You're already using Claude Code for other work
- You want native hook support for automation
- Context isolation is critical for your workflow

### Choose Gemini CLI When:
- You're already invested in the Google AI ecosystem
- You prefer Gemini's model characteristics
- Sequential execution is acceptable
- You want to use Gemini 3 Flash for faster responses
- Cost considerations favor Google's pricing

### Use Both When:
- You want flexibility to switch between providers
- Different team members prefer different tools
- You want to compare results across models
- You're building provider-agnostic workflows

## Migration Guide

### Claude Code → Gemini CLI

1. Run the installer with Gemini provider:
   ```bash
   npx claude-virtual-company init --provider gemini
   ```

2. Your existing `.company/` state is preserved
3. Workflow continues from current state
4. No data migration needed

### Gemini CLI → Claude Code

1. Run the installer with Claude provider:
   ```bash
   npx claude-virtual-company init --provider claude
   ```

2. Your existing `.company/` state is preserved
3. Workflow continues from current state
4. Tasks work the same way

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Command                             │
│                    /company "task"                           │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                Provider Abstraction Layer                    │
│           (detects Claude vs Gemini, routes calls)           │
└──────────────┬─────────────────────────┬────────────────────┘
               │                         │
┌──────────────▼──────────────┐ ┌────────▼─────────────────────┐
│      Claude Adapter          │ │      Gemini Adapter           │
│                              │ │                               │
│  - Native SKILL.md           │ │  - GEMINI.md context          │
│  - context: fork             │ │  - TOML commands              │
│  - Task tools native         │ │  - MCP task server            │
│  - Hooks native              │ │  - Sequential execution       │
└──────────────┬──────────────┘ └────────┬─────────────────────┘
               │                         │
┌──────────────┴─────────────────────────┴─────────────────────┐
│                       Shared Core                             │
│   - .company/ state files       - Governance matrix           │
│   - .planning/ artifacts        - Handoff schemas             │
│   - File-based task storage     - Role definitions            │
└──────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Claude Code
- Parallel execution reduces total workflow time
- Native context management is memory-efficient
- Hook overhead is minimal

### Gemini CLI
- Sequential execution takes longer for multi-role workflows
- File-based context requires more I/O
- MCP server adds slight latency to task operations

### Recommendations
- For complex projects: Claude Code (parallel execution)
- For simple tasks: Either works well
- For quick iterations: Gemini 3 Flash may be faster per-call
