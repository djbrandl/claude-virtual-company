---
name: company-discuss
description: Discuss phase implementation preferences and identify gray areas before planning.
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

# Phase Discussion

Capture implementation preferences and identify gray areas for phase $ARGUMENTS.

## Context Loading

Before proceeding, load the following context:

1. **Project**: Read `.planning/PROJECT.md` if it exists
2. **Requirements**: Read `.planning/REQUIREMENTS.md` (first 60 lines)
3. **Roadmap**: Read `.planning/ROADMAP.md` if it exists

---

## Phase Target
$ARGUMENTS

---

## Discussion Protocol

### Step 1: Identify Phase Requirements

Read ROADMAP.md to find the phase:
- What requirements are mapped to this phase?
- What are the dependencies?
- What is the stated goal?

### Step 2: Analyze Gray Areas

Based on the phase type, identify gray areas:

**For UI/Frontend phases:**
- Layout structure and component hierarchy
- Responsive breakpoints and behavior
- Animation/interaction patterns
- State management approach
- Styling methodology (CSS modules, Tailwind, etc.)

**For API/Backend phases:**
- Request/response format specifics
- Error handling and status codes
- Authentication/authorization flow
- Database schema decisions
- Caching strategy

**For Data/Infrastructure phases:**
- Schema structure and relationships
- Migration approach
- Backup/recovery strategy
- Scaling considerations

**For Integration phases:**
- API contract specifics
- Event/message formats
- Retry/failure handling
- Monitoring approach

### Step 2.5: Offer Interactive Playground (Optional)

Before falling back to text-based questions, check if an interactive playground would be beneficial. Follow the **company-playground** preference protocol:

1. Read `.company/state.json` — check `playground_preference`
2. If `null`, ask the user if they want playgrounds (see company-playground protocol)
3. If `"disabled"` or Gemini CLI, skip to Step 3

**When to offer a playground:**
- **UI/Frontend phases** (3+ gray areas about layout, colors, spacing, components): Generate a **design-playground** HTML
- **Architecture phases** (4+ gray areas about services, connections, patterns): Generate a **concept-map** HTML
- **All other cases** or < 3 gray areas: Skip to Step 3

**Playground generation (if applicable):**

```bash
# Ensure playground directory exists
mkdir -p .company/artifacts/playground
```

Generate a self-contained HTML file using the **company-playground** shared HTML skeleton. Customize:
- **Controls**: One control group per gray area with the identified options as radio buttons or dropdowns
- **Preview**: For UI phases, show a wireframe preview that updates with selections. For architecture phases, show a node/connection diagram
- **buildPrompt()**: Collect all selections into a structured `PLAYGROUND DECISIONS:` block

Write the HTML to `.company/artifacts/playground/discuss-phase-{N}.html` where `{N}` is the phase number.

**Open in browser:**
```bash
# Open the playground (cross-platform)
case "$(uname -s 2>/dev/null || echo Windows)" in
  MINGW*|MSYS*|CYGWIN*|Windows*)
    start "" ".company/artifacts/playground/discuss-phase-{N}.html"
    ;;
  Darwin*)
    open ".company/artifacts/playground/discuss-phase-{N}.html"
    ;;
  Linux*)
    xdg-open ".company/artifacts/playground/discuss-phase-{N}.html"
    ;;
esac
```

**Ask for paste-back:**
```
AskUserQuestion({
  questions: [{
    header: "Playground",
    question: "I've opened a discussion playground in your browser with controls for each gray area. Configure your preferences, click 'Copy Prompt', and paste the output here. Or skip to use text questions instead.",
    options: [
      { label: "Paste Output", description: "I'll paste the playground output (use 'Other' to paste)" },
      { label: "Skip Playground", description: "Use text-based questions instead" }
    ]
  }]
})
```

- If user pastes output: Parse the `PLAYGROUND DECISIONS:` block, treat each decision as a resolved gray area, skip to Step 4
- If user skips: Continue to Step 3

---

### Step 3: Ask Clarifying Questions

Use AskUserQuestion to resolve gray areas:

```
AskUserQuestion({
  questions: [
    {
      header: "Gray Area 1",
      question: "{Specific question about implementation choice}",
      options: [
        { label: "Option A", description: "Approach and tradeoffs" },
        { label: "Option B", description: "Approach and tradeoffs" },
        { label: "Option C", description: "Approach and tradeoffs" }
      ]
    }
  ]
})
```

### Step 4: Document Decisions

Create phase CONTEXT.md:

```markdown
# Phase {N} Context

## Phase Goal
{From roadmap}

## Requirements Covered
- FR-X: {requirement}
- FR-Y: {requirement}

## Gray Areas Resolved

### {Gray Area 1}
**Question:** {What needed to be decided}
**Decision:** {What was chosen}
**Rationale:** {Why this choice}

### {Gray Area 2}
**Question:** {What needed to be decided}
**Decision:** {What was chosen}
**Rationale:** {Why this choice}

## Implementation Preferences
- Preference 1: {Specific choice}
- Preference 2: {Specific choice}

## Constraints Identified
- Constraint 1: {Limitation to work within}
- Constraint 2: {Dependency to respect}

## Ready for Planning
[x] All gray areas resolved
[x] User preferences captured
[x] Constraints documented
```

Write to `.planning/phase-{N}/CONTEXT.md`

---

## Update State

```bash
# Update STATE.md with discussion completion
cat >> .planning/STATE.md << EOF

## Session Update: $(date -Iseconds)
- Completed discussion for Phase $ARGUMENTS
- Gray areas resolved: {count}
- Decisions captured in phase-{N}/CONTEXT.md
EOF
```

---

## Output

```markdown
# Phase {N} Discussion Complete

## Gray Areas Resolved
1. {Area 1}: {Decision}
2. {Area 2}: {Decision}
3. {Area 3}: {Decision}

## Key Decisions
- {Decision 1}
- {Decision 2}

## Artifacts Created
- `.planning/phase-{N}/CONTEXT.md`

## ▶ What's Next?

| Option | Command | When to use |
|--------|---------|-------------|
| Plan the phase | `/company-plan-phase {N}` | Ready to create task breakdown |
| More discussion | `/company-reply "..."` | Have more questions or preferences |
| Check progress | `/company-progress` | See overall project status |
| Pause work | `/company-pause` | Need to stop for now |
```
