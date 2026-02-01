# State Machine Documentation

This document describes the state machines that govern the Claude Virtual Company workflow.

## Company Workflow Phases

The main `/company` orchestrator progresses through these phases:

```
                              ┌─────────────┐
                              │    IDLE     │
                              │  (start)    │
                              └──────┬──────┘
                                     │
                           /company "goal"
                                     │
                                     ▼
                         ┌───────────────────┐
                         │   INITIALIZING    │
                         │ (setup structure) │
                         └─────────┬─────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        PHASE 0: EXPERTISE                           │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Analyze    │───▶│    Hire      │───▶│   Update     │          │
│  │ Requirements │    │ Specialists  │    │   Roster     │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PHASE 1: GIT FLOW SETUP                         │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Ensure     │───▶│   Create     │───▶│   Update     │          │
│  │   develop    │    │   feature/   │    │    State     │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PHASE 2: ARCHITECTURE (CTO)                     │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Spawn      │───▶│   Produce    │───▶│   Quality    │          │
│  │   CTO Agent  │    │  Artifacts   │    │    Gate      │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                 │                   │
│                                          Pass ──┼── Fail           │
│                                                 │     │            │
│                                                 ▼     └─► Feedback │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PHASE 3: DESIGN (Architect)                     │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Spawn      │───▶│   Create     │───▶│   Quality    │          │
│  │  Architect   │    │   Design     │    │    Gate      │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PHASE 4: PLANNING (Tech Lead)                    │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Spawn      │───▶│   Break      │───▶│   Create     │          │
│  │  Tech Lead   │    │   Down       │    │   Tasks      │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  PHASE 5: IMPLEMENTATION (Developers)               │
│                                                                     │
│         ┌──────────────────────────────────────────┐               │
│         │          Check Task Dependencies          │               │
│         └────────────────────┬─────────────────────┘               │
│                              │                                      │
│              ┌───────────────┴───────────────┐                     │
│              ▼                               ▼                      │
│    ┌─────────────────┐             ┌─────────────────┐             │
│    │    PARALLEL     │             │   SEQUENTIAL    │             │
│    │   (independent) │             │   (dependent)   │             │
│    └────────┬────────┘             └────────┬────────┘             │
│             │                               │                       │
│             ▼                               ▼                       │
│    ┌─────────────────────────────────────────────────┐             │
│    │  For each task:                                 │             │
│    │    1. Spawn Developer Agent                     │             │
│    │    2. Implement with tests                      │             │
│    │    3. Commit changes                            │             │
│    │    4. Mark task complete                        │             │
│    └─────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PHASE 6: CODE REVIEW                           │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Spawn      │───▶│   Review     │───▶│   Generate   │          │
│  │  Reviewer    │    │   Changes    │    │   Report     │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                 │                   │
│                               Approved ─────────┼──── Needs Work   │
│                                                 │          │       │
│                                                 ▼          └──►[5] │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PHASE 7: QA VERIFICATION                         │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Spawn      │───▶│   Run All    │───▶│   Verify     │          │
│  │  QA Agent    │    │   Tests      │    │  Criteria    │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                 │                   │
│                                   Pass ─────────┼──── Fail         │
│                                                 │        │         │
│                                                 ▼        └──►[5]   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       PHASE 8: MERGE READY                          │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Generate   │───▶│  CEO        │───▶│   Execute    │          │
│  │   Summary    │    │  Approval    │    │   Merge      │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                             │                                       │
│                   Approved ─┼── Review ── More Testing             │
│                             │     │            │                    │
│                             ▼     └──►[6]      └──►[7]             │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                          ┌───────────────┐
                          │   COMPLETE    │
                          │   (merged)    │
                          └───────────────┘
```

---

## Proposal Lifecycle

Proposals enable governance across role boundaries:

```
                    ┌─────────────────┐
                    │   SUBMITTED     │
                    │  (new proposal) │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   EVALUATION    │
                    │ (check matrix)  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  AUTO-APPROVE   │ │ NEEDS REVIEW    │ │   NEEDS CEO     │
│  (same-role or  │ │ (cross-role     │ │   (scope/block  │
│   downstream)   │ │  actions)       │ │    actions)     │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         │                   ▼                   ▼
         │          ┌─────────────────┐ ┌─────────────────┐
         │          │  Senior Role    │ │  CEO Decision   │
         │          │   Evaluates     │ │   Required      │
         │          └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         │       ┌───────────┴───────────┐      │
         │       ▼                       ▼      │
         │  ┌─────────┐            ┌─────────┐  │
         │  │ APPROVE │            │ REJECT  │  │
         │  └────┬────┘            └────┬────┘  │
         │       │                      │       │
         └───────┼──────────────────────┼───────┘
                 │                      │
                 ▼                      ▼
        ┌─────────────────┐    ┌─────────────────┐
        │    APPROVED     │    │    REJECTED     │
        │  (execute it)   │    │  (with reason)  │
        └────────┬────────┘    └─────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │    EXECUTED     │
        │  (action done)  │
        └─────────────────┘
```

### Governance Matrix

| Action Type | Auto-Approve | Senior Review | CEO Required |
|-------------|--------------|---------------|--------------|
| Create own subtask | Yes | - | - |
| Downstream handoff | Yes | - | - |
| Cross-role task | - | Yes | - |
| Reject handoff | - | Yes | - |
| Request escalation | - | Yes | - |
| Scope change | - | - | Yes |
| Block release | - | - | Yes |
| New role creation | - | - | Yes |

---

## PM Workflow (GSD-Inspired)

The Project Manager mode uses a phase-based state machine:

```
                         ┌──────────────────┐
                         │  UNINITIALIZED   │
                         └────────┬─────────┘
                                  │
                      /company-new-project
                                  │
                                  ▼
                    ┌───────────────────────┐
                    │   PROJECT DEFINITION  │
                    │   - PROJECT.md        │
                    │   - REQUIREMENTS.md   │
                    │   - ROADMAP.md        │
                    └───────────┬───────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PHASE CYCLE                                  │
│                                                                     │
│    ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────┐ │
│    │  DISCUSS  │────▶│   PLAN    │────▶│  EXECUTE  │────▶│VERIFY │ │
│    └───────────┘     └───────────┘     └───────────┘     └───────┘ │
│          │                 │                 │                │     │
│          ▼                 ▼                 ▼                ▼     │
│    ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────┐ │
│    │CONTEXT.md │     │ PLAN.md   │     │SUMMARY.md │     │  UAT  │ │
│    │ produced  │     │ produced  │     │ produced  │     │ done  │ │
│    └───────────┘     └───────────┘     └───────────┘     └───────┘ │
│                                                                │    │
│                                                     ┌──────────┘    │
│                                                     ▼               │
│                                              ┌─────────────┐        │
│                                              │ Next Phase? │        │
│                                              └──────┬──────┘        │
│                                                     │               │
│                                        Yes ─────────┼───── No       │
│                                                     │        │      │
│                                    ┌────────────────┘        │      │
│                                    ▼                         │      │
│                              Back to DISCUSS                 │      │
│                              for next phase                  │      │
└──────────────────────────────────────────────────────────────│──────┘
                                                               │
                                                               ▼
                                                    ┌──────────────────┐
                                                    │ MILESTONE COMPLETE│
                                                    │  /company-milestone│
                                                    └──────────────────┘
```

### Phase State Details

```
DISCUSS Phase:
┌───────────────────────────────────────────────────┐
│  Input: Phase goal from ROADMAP.md                │
│  Output: CONTEXT.md with decisions                │
│                                                   │
│  Activities:                                      │
│    - Gather implementation preferences            │
│    - Resolve ambiguities                          │
│    - Document constraints                         │
│    - Identify dependencies                        │
│                                                   │
│  Exit Criteria:                                   │
│    - All gray areas resolved                      │
│    - CONTEXT.md complete                          │
└───────────────────────────────────────────────────┘

PLAN Phase:
┌───────────────────────────────────────────────────┐
│  Input: CONTEXT.md                                │
│  Output: {N}-PLAN.md with tasks                   │
│                                                   │
│  Constraints:                                     │
│    - Max 2-3 tasks per plan                       │
│    - Each task must be atomic                     │
│    - Include verification steps                   │
│                                                   │
│  Activities:                                      │
│    - Research implementation approach             │
│    - Define task breakdown                        │
│    - Identify parallel opportunities              │
│    - Set verification criteria                    │
│                                                   │
│  Exit Criteria:                                   │
│    - Plan verified by plan-checker                │
│    - All tasks have clear scope                   │
└───────────────────────────────────────────────────┘

EXECUTE Phase:
┌───────────────────────────────────────────────────┐
│  Input: {N}-PLAN.md                               │
│  Output: {N}-SUMMARY.md + code changes            │
│                                                   │
│  Wave Execution:                                  │
│    Wave 1: Independent tasks (parallel)           │
│    Wave 2: Dependent tasks (after Wave 1)         │
│    Wave 3: Integration tasks (after Wave 2)       │
│                                                   │
│  Each Task:                                       │
│    1. Read task definition                        │
│    2. Implement changes                           │
│    3. Atomic commit                               │
│    4. Update summary                              │
│                                                   │
│  Exit Criteria:                                   │
│    - All tasks completed                          │
│    - All commits made                             │
│    - Summary updated                              │
└───────────────────────────────────────────────────┘

VERIFY Phase:
┌───────────────────────────────────────────────────┐
│  Input: Completed phase work                      │
│  Output: VERIFICATION.md + UAT.md                 │
│                                                   │
│  Automated Verification:                          │
│    - Run test suite                               │
│    - Check coverage                               │
│    - Lint/type check                              │
│    - Build verification                           │
│                                                   │
│  User Acceptance Testing:                         │
│    - Present changes to user                      │
│    - Gather feedback                              │
│    - Document acceptance                          │
│                                                   │
│  Exit Criteria:                                   │
│    - All checks pass                              │
│    - UAT approved                                 │
└───────────────────────────────────────────────────┘
```

---

## Quick Mode State Machine

For ad-hoc tasks without full ceremony:

```
        ┌───────────────────┐
        │      START        │
        │ /company-quick    │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │   TASK CAPTURE    │
        │  (parse request)  │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │     EXECUTE       │
        │ (skip research,   │
        │  skip plan-check) │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │  ATOMIC COMMIT    │
        │ (still required)  │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │   TRACK IN        │
        │ .planning/quick/  │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │     COMPLETE      │
        └───────────────────┘
```

---

## State File Locations

| File | Purpose | Key Fields |
|------|---------|------------|
| `.company/state.json` | Workflow state | `phase`, `goal`, `branch`, `blockers` |
| `.company/config.json` | Configuration | `quality`, `git_flow`, `hiring` |
| `.company/roster.json` | Specialists | `specialists[]` with skills |
| `.planning/STATE.md` | PM session state | Status, decisions, blockers, next action |
| `.planning/ROADMAP.md` | Phase overview | Phases with status and goals |
