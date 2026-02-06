---
name: company-playground
description: Interactive HTML playground integration for visual decision-making. Provides shared patterns for generating playgrounds across skills.
context: preloaded
user-invocable: false
---

# Playground Integration

Shared context for generating interactive HTML playgrounds that open in the user's browser for visual decision-making. Playgrounds are self-contained single-file HTML with inline CSS/JS, no external dependencies.

---

## User Preference Protocol

Before generating any playground, check the user's preference:

1. **Read** `.company/state.json` and check the `playground_preference` field
2. If `null` (not yet asked), ask the user:
   ```
   AskUserQuestion({
     questions: [{
       header: "Playgrounds",
       question: "Would you like to use interactive HTML playgrounds for visual decision-making in this session? (Playgrounds open in your browser. You can change this anytime by telling me.)",
       options: [
         { label: "Yes, use playgrounds", description: "Open interactive HTML files in browser for design decisions, reviews, and discussions" },
         { label: "No, text-only", description: "Use standard text-based AskUserQuestion for all interactions" }
       ]
     }]
   })
   ```
3. Write the preference to `.company/state.json` (`"enabled"` or `"disabled"`)
4. If `"disabled"` — skip playground, use AskUserQuestion fallback
5. If `"enabled"` — proceed with playground generation

**Mid-session changes**: If the user says "enable playgrounds" or "disable playgrounds", update `.company/state.json` immediately.

---

## Gemini CLI Fallback

If running under Gemini CLI (check for `.gemini/` directory presence or absence of `AskUserQuestion` tool), ALWAYS skip playgrounds and use text-based interaction. Gemini has no browser-open capability.

---

## When NOT to Use Playgrounds

Skip playground generation and use AskUserQuestion when:
- **Discussion**: Fewer than 3 gray areas identified
- **Verification**: 0 findings from automated checks
- **Code review**: Diff is under 20 lines
- User preference is `"disabled"` or Gemini CLI detected

---

## Cross-Platform Browser Open

Use this command to open HTML files in the default browser:

```bash
# Detect platform and open browser
PLAYGROUND_FILE="$1"
case "$(uname -s 2>/dev/null || echo Windows)" in
  MINGW*|MSYS*|CYGWIN*|Windows*)
    start "" "$PLAYGROUND_FILE" 2>/dev/null || cmd.exe /c start "" "$PLAYGROUND_FILE"
    ;;
  Darwin*)
    open "$PLAYGROUND_FILE"
    ;;
  Linux*)
    xdg-open "$PLAYGROUND_FILE" 2>/dev/null || sensible-browser "$PLAYGROUND_FILE"
    ;;
esac
```

On Windows with Claude Code, prefer: `start "" "path/to/file.html"`

---

## Paste-Back Workflow Protocol

After generating and opening a playground:

1. **Inform the user** what the playground shows and how to interact
2. **Ask for paste-back or skip**:
   ```
   AskUserQuestion({
     questions: [{
       header: "Playground",
       question: "I've opened the interactive playground in your browser. Use the controls to configure your preferences, then click 'Copy Prompt' and paste the output here. Or skip to use text-based input instead.",
       options: [
         { label: "Paste Output", description: "I'll paste the playground output (use 'Other' to paste)" },
         { label: "Skip Playground", description: "Use text-based AskUserQuestion instead" }
       ]
     }]
   })
   ```
3. If user selects **"Paste Output"** (via "Other" text input) — parse the pasted prompt and incorporate as resolved decisions
4. If user selects **"Skip Playground"** — fall back to standard AskUserQuestion for each gray area

---

## Shared HTML Skeleton

All playgrounds share this base structure. Customize the `CONTROLS_HTML`, `PREVIEW_HTML`, and `buildPrompt()` function per playground type.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{TITLE}}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1117; color: #e0e0e0; min-height: 100vh; }
  .header { background: #1a1b26; border-bottom: 1px solid #2a2b3d; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { font-size: 18px; color: #7aa2f7; }
  .header .meta { font-size: 13px; color: #565f89; }
  .container { display: grid; grid-template-columns: 340px 1fr; grid-template-rows: 1fr auto; height: calc(100vh - 57px); }
  .controls { background: #1a1b26; border-right: 1px solid #2a2b3d; padding: 20px; overflow-y: auto; }
  .preview { padding: 24px; overflow-y: auto; }
  .output { grid-column: 1 / -1; background: #1a1b26; border-top: 1px solid #2a2b3d; padding: 16px 24px; }
  .section-title { font-size: 13px; font-weight: 600; color: #7aa2f7; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
  .control-group { margin-bottom: 20px; }
  .control-group label { display: block; font-size: 13px; color: #a9b1d6; margin-bottom: 6px; }
  .control-group select, .control-group input[type="text"], .control-group input[type="range"], .control-group textarea {
    width: 100%; padding: 8px 10px; background: #24283b; border: 1px solid #2a2b3d; border-radius: 6px; color: #e0e0e0; font-size: 13px;
  }
  .control-group select:focus, .control-group input:focus, .control-group textarea:focus { outline: none; border-color: #7aa2f7; }
  .control-group textarea { min-height: 60px; resize: vertical; }
  .radio-group { display: flex; flex-direction: column; gap: 6px; }
  .radio-group label { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 8px; border-radius: 6px; }
  .radio-group label:hover { background: #24283b; }
  .radio-group input[type="radio"] { accent-color: #7aa2f7; }
  .card { background: #1a1b26; border: 1px solid #2a2b3d; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
  .card:hover { border-color: #3d4466; }
  .card h3 { font-size: 14px; color: #c0caf5; margin-bottom: 8px; }
  .card p { font-size: 13px; color: #a9b1d6; line-height: 1.5; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .badge-blue { background: #1e2640; color: #7aa2f7; }
  .badge-green { background: #1a2e1a; color: #9ece6a; }
  .badge-red { background: #2e1a1a; color: #f7768e; }
  .badge-yellow { background: #2e2a1a; color: #e0af68; }
  .btn { padding: 10px 20px; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .btn-primary { background: #7aa2f7; color: #1a1b26; }
  .btn-primary:hover { background: #89b4fa; }
  .btn-copy { background: #9ece6a; color: #1a1b26; }
  .btn-copy:hover { background: #a6da7a; }
  .prompt-output { background: #24283b; border: 1px solid #2a2b3d; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 12px; white-space: pre-wrap; max-height: 120px; overflow-y: auto; margin-top: 8px; color: #a9b1d6; }
  .output-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .copy-status { font-size: 13px; color: #9ece6a; opacity: 0; transition: opacity 0.3s; }
  .copy-status.show { opacity: 1; }
</style>
</head>
<body>
<div class="header">
  <h1>{{TITLE}}</h1>
  <div class="meta">{{META}}</div>
</div>
<div class="container">
  <div class="controls">
    <div class="section-title">Configuration</div>
    {{CONTROLS_HTML}}
  </div>
  <div class="preview">
    <div class="section-title">Preview</div>
    {{PREVIEW_HTML}}
  </div>
  <div class="output">
    <div class="output-bar">
      <div class="section-title" style="margin-bottom:0">Generated Prompt</div>
      <div>
        <span class="copy-status" id="copyStatus">Copied!</span>
        <button class="btn btn-copy" onclick="copyPrompt()">Copy Prompt</button>
      </div>
    </div>
    <div class="prompt-output" id="promptOutput"></div>
  </div>
</div>
<script>
function buildPrompt() {
  // Override per playground type
  return 'No prompt configured';
}
function updatePreview() {
  // Override per playground type
}
function copyPrompt() {
  const output = document.getElementById('promptOutput');
  const text = output.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const status = document.getElementById('copyStatus');
    status.classList.add('show');
    setTimeout(() => status.classList.remove('show'), 2000);
  });
}
function refresh() {
  updatePreview();
  document.getElementById('promptOutput').textContent = buildPrompt();
}
// Init on load
document.addEventListener('DOMContentLoaded', refresh);
// Auto-refresh on any input change
document.addEventListener('input', refresh);
document.addEventListener('change', refresh);
</script>
</body>
</html>
```

---

## Playground Type: Discussion (Design)

For **UI/Frontend phases** — generate a design-playground with controls for each gray area.

**Controls**: For each gray area, add a control group with radio options or dropdowns for the choices. Include text inputs for custom preferences (colors, spacing, component density).

**Preview**: Show a live wireframe-style preview that updates as the user changes controls. Use CSS grid and simple box elements to represent layout choices.

**buildPrompt()**: Collect all control values and format as:
```
PLAYGROUND DECISIONS:
- Gray Area 1: [chosen option]
- Gray Area 2: [chosen option]
- Custom notes: [text input value]
```

**File path**: `.company/artifacts/playground/discuss-phase-{N}.html`

---

## Playground Type: Discussion (Architecture)

For **Architecture phases with 4+ gray areas** — generate a concept-map playground.

**Controls**: Service/component nodes with enable/disable toggles, connection type selectors (sync/async/event), technology selectors per node.

**Preview**: Simple visual graph with nodes and labeled connections. Use positioned divs with CSS lines/borders to represent connections.

**buildPrompt()**: Format as service topology decisions:
```
PLAYGROUND DECISIONS:
- Services: [enabled services]
- Connections: [service A] --[type]--> [service B]
- Technology choices: [per service]
```

**File path**: `.company/artifacts/playground/discuss-phase-{N}.html`

---

## Playground Type: Verification (Document Critique)

For **verification with findings** — generate a document-critique playground.

**Layout**: Two-panel. Left: verification results with line numbers and categories. Right: each finding as an interactive card with Approve / Reject / Comment actions.

**Controls**: Each finding card has:
- Status toggle: Approve (green) / Reject (red) / Needs Discussion (yellow)
- Comment textarea for notes
- Severity badge (Blocker / Issue / Suggestion)

**Preview**: Summary counts — N approved, N rejected, N needs discussion.

**buildPrompt()**: Format as finding dispositions:
```
PLAYGROUND DECISIONS:
- Finding 1: [APPROVED/REJECTED/DISCUSS] - [comment]
- Finding 2: [APPROVED/REJECTED/DISCUSS] - [comment]
- Overall: [PASS/FAIL/CONDITIONAL]
```

**File path**: `.company/artifacts/playground/verify-phase-{N}.html`

---

## Playground Type: Code Review (Diff Review)

For **code review** — generate a diff-review playground.

**Layout**: Left panel: diff hunks with file names and line numbers. Right panel: review comments as cards aligned to corresponding diff hunks.

**Controls**: Each review comment card has:
- Severity selector: Blocker / Issue / Suggestion / Nit / Praise
- Action: Acknowledge / Disagree / Will Fix
- Comment textarea for response

**Preview**: Review summary with counts by severity and action.

**buildPrompt()**: Format as review responses:
```
PLAYGROUND DECISIONS:
- [file:line] [finding]: [ACKNOWLEDGE/DISAGREE/WILL_FIX] - [response]
- Overall: [APPROVE/REQUEST_CHANGES]
```

**File path**: `.company/artifacts/playground/code-review.html`

---

## Playground Type: UI Design

For **UI designer** — generate a design-playground with design system tokens.

**Controls**: Color pickers for primary/secondary/accent colors, spacing scale slider, typography selectors, shadow presets, border-radius slider.

**Preview**: Live component gallery showing buttons, cards, inputs, and typography with the selected tokens applied.

**buildPrompt()**: Format as design tokens:
```
PLAYGROUND DECISIONS:
- Colors: primary=#xxx, secondary=#xxx, accent=#xxx
- Spacing: base=Npx, scale=[values]
- Typography: heading=[font], body=[font], scale=[values]
- Border radius: small=Npx, medium=Npx, large=Npx
- Shadows: [preset name]
```

**File path**: `.company/artifacts/playground/ui-design.html`

---

## Playground Type: Architecture (Code Map)

For **architect** — generate a code-map playground with component topology.

**Controls**: Component nodes with toggle visibility, connection type selectors, layer assignment (presentation/business/data), technology labels.

**Preview**: Layered architecture diagram with components positioned in their layers and connections drawn between them.

**buildPrompt()**: Format as architecture topology:
```
PLAYGROUND DECISIONS:
- Components: [list with layers]
- Connections: [component A] --[type]--> [component B]
- Patterns: [selected patterns per layer]
```

**File path**: `.company/artifacts/playground/architecture-map.html`
