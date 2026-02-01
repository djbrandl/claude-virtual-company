# Configuration Reference

Complete reference for all configuration options in the Claude Virtual Company framework.

## Configuration File

Settings are stored in `.company/config.json`. This file is created during initialization and can be modified via `/company-settings` or direct editing.

## Configuration Schema

```json
{
  "company": {
    "name": "string",
    "initialized": "ISO datetime or null",

    "hiring": { ... },
    "quality": { ... },
    "git_flow": { ... },
    "testing": { ... },
    "specialists": { ... },
    "workflow": { ... },
    "notifications": { ... }
  }
}
```

---

## Company Settings

### `company.name`
- **Type**: `string`
- **Default**: `"Virtual Engineering Co."`
- **Description**: Name of your virtual company

### `company.initialized`
- **Type**: `string | null`
- **Description**: Timestamp when company was initialized

---

## Hiring Settings

### `hiring.auto_hire`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Automatically create specialists when expertise gaps are detected

### `hiring.require_ceo_approval_for_new_roles`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Ask CEO (you) before creating any new specialist

### `hiring.max_specialists`
- **Type**: `number`
- **Default**: `20`
- **Description**: Maximum number of specialists that can be created

### `hiring.expertise_evaluation.on_project_init`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Evaluate expertise needs when starting a project

### `hiring.expertise_evaluation.on_escalation`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Evaluate expertise when roles escalate issues

### `hiring.expertise_evaluation.on_task_assignment`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Evaluate expertise when assigning tasks

### `hiring.expertise_evaluation.self_evaluation_enabled`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Allow roles to self-evaluate and request expertise

---

## Quality Settings

### `quality.test_coverage_minimum`
- **Type**: `number`
- **Default**: `80`
- **Range**: `0-100`
- **Description**: Minimum test coverage percentage required

### `quality.require_tests.unit`
- **Type**: `string`
- **Default**: `"required"`
- **Options**: `"required"`, `"recommended"`, `"disabled"`
- **Description**: Unit test requirement level

### `quality.require_tests.integration`
- **Type**: `string`
- **Default**: `"required"`
- **Options**: `"required"`, `"recommended"`, `"disabled"`
- **Description**: Integration test requirement level

### `quality.require_tests.e2e`
- **Type**: `string`
- **Default**: `"required_for_user_flows"`
- **Options**: `"required"`, `"required_for_user_flows"`, `"recommended"`, `"disabled"`
- **Description**: E2E test requirement level

### `quality.require_tests.ui`
- **Type**: `string`
- **Default**: `"required_for_frontend"`
- **Options**: `"required"`, `"required_for_frontend"`, `"recommended"`, `"disabled"`
- **Description**: UI/visual test requirement level

### `quality.require_tests.accessibility`
- **Type**: `string`
- **Default**: `"recommended"`
- **Options**: `"required"`, `"recommended"`, `"disabled"`
- **Description**: Accessibility test requirement level

### `quality.require_code_review`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Require code review before merge

### `quality.review_approval_count`
- **Type**: `number`
- **Default**: `1`
- **Range**: `1-5`
- **Description**: Number of approvals required for code review

### `quality.block_merge_on_test_failure`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Prevent merge if any tests fail

### `quality.lint_on_commit`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Run linting on code changes

---

## Git Flow Settings

### `git_flow.enabled`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable git flow management

### `git_flow.strategy`
- **Type**: `string`
- **Default**: `"gitflow"`
- **Options**: `"gitflow"`, `"trunk-based"`, `"github-flow"`
- **Description**: Branching strategy to use

### `git_flow.branches.main`
- **Type**: `string`
- **Default**: `"main"`
- **Description**: Main/production branch name

### `git_flow.branches.develop`
- **Type**: `string`
- **Default**: `"develop"`
- **Description**: Development branch name

### `git_flow.branches.feature_prefix`
- **Type**: `string`
- **Default**: `"feature/"`
- **Description**: Prefix for feature branches

### `git_flow.branches.bugfix_prefix`
- **Type**: `string`
- **Default**: `"bugfix/"`
- **Description**: Prefix for bugfix branches

### `git_flow.branches.hotfix_prefix`
- **Type**: `string`
- **Default**: `"hotfix/"`
- **Description**: Prefix for hotfix branches

### `git_flow.branches.release_prefix`
- **Type**: `string`
- **Default**: `"release/"`
- **Description**: Prefix for release branches

### `git_flow.require_pr`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Require pull requests for merges

### `git_flow.pr_template`
- **Type**: `string`
- **Default**: `".github/pull_request_template.md"`
- **Description**: Path to PR template

### `git_flow.squash_on_merge`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Squash commits when merging

### `git_flow.delete_branch_on_merge`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Delete feature branch after merge

### `git_flow.protect_main`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Protect main branch from direct commits

### `git_flow.require_linear_history`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Require linear history (no merge commits)

---

## Testing Settings

### `testing.frameworks.unit`
- **Type**: `string`
- **Default**: `"auto-detect"`
- **Options**: `"auto-detect"`, `"jest"`, `"vitest"`, `"mocha"`, `"pytest"`
- **Description**: Unit testing framework

### `testing.frameworks.e2e`
- **Type**: `string`
- **Default**: `"playwright"`
- **Options**: `"playwright"`, `"cypress"`, `"puppeteer"`
- **Description**: E2E testing framework

### `testing.frameworks.ui`
- **Type**: `string`
- **Default**: `"puppeteer"`
- **Options**: `"puppeteer"`, `"playwright"`, `"backstopjs"`
- **Description**: UI/visual testing framework

### `testing.frameworks.api`
- **Type**: `string`
- **Default**: `"supertest"`
- **Options**: `"supertest"`, `"rest-assured"`, `"pactum"`
- **Description**: API testing framework

### `testing.run_on.pre_commit`
- **Type**: `array`
- **Default**: `["lint", "unit"]`
- **Description**: Tests to run before commit

### `testing.run_on.pre_push`
- **Type**: `array`
- **Default**: `["unit", "integration"]`
- **Description**: Tests to run before push

### `testing.run_on.pre_merge`
- **Type**: `array`
- **Default**: `["all"]`
- **Description**: Tests to run before merge

### `testing.screenshot_on_failure`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Take screenshots when UI tests fail

### `testing.visual_regression`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable visual regression testing

---

## Specialists Settings

### `specialists.default`
- **Type**: `array`
- **Default**: `["git-flow", "code-reviewer", "test-architect"]`
- **Description**: Specialists included by default

### `specialists.on_demand`
- **Type**: `array`
- **Default**: `[]`
- **Description**: Specialists to create on-demand (not auto-hired)

---

## Workflow Settings

### `workflow.require_acceptance_criteria`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Require acceptance criteria for all tasks

### `workflow.require_handoff_validation`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Validate handoff documents between phases

### `workflow.auto_assign_tasks`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Automatically assign tasks to available roles

### `workflow.parallel_development`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Allow parallel development of independent tasks

### `workflow.max_parallel_developers`
- **Type**: `number`
- **Default**: `3`
- **Description**: Maximum developers working in parallel

---

## Notification Settings

### `notifications.on_blocker`
- **Type**: `string`
- **Default**: `"immediate"`
- **Options**: `"immediate"`, `"batch"`, `"silent"`
- **Description**: How to notify about blockers

### `notifications.on_phase_complete`
- **Type**: `string`
- **Default**: `"summary"`
- **Options**: `"immediate"`, `"summary"`, `"silent"`
- **Description**: How to notify about phase completion

### `notifications.on_test_failure`
- **Type**: `string`
- **Default**: `"immediate"`
- **Options**: `"immediate"`, `"batch"`, `"silent"`
- **Description**: How to notify about test failures

### `notifications.on_merge_ready`
- **Type**: `string`
- **Default**: `"ask_ceo"`
- **Options**: `"immediate"`, `"ask_ceo"`, `"silent"`
- **Description**: How to notify when ready to merge

---

## Example Configurations

### Rapid Prototyping

```json
{
  "company": {
    "quality": {
      "test_coverage_minimum": 50,
      "require_tests": {
        "unit": "recommended",
        "integration": "recommended",
        "e2e": "disabled",
        "ui": "disabled"
      },
      "require_code_review": false
    },
    "git_flow": {
      "strategy": "trunk-based",
      "require_pr": false
    }
  }
}
```

### Production Ready

```json
{
  "company": {
    "quality": {
      "test_coverage_minimum": 90,
      "require_tests": {
        "unit": "required",
        "integration": "required",
        "e2e": "required",
        "ui": "required_for_frontend",
        "accessibility": "required"
      },
      "require_code_review": true,
      "review_approval_count": 2
    },
    "git_flow": {
      "strategy": "gitflow",
      "require_pr": true,
      "protect_main": true
    },
    "testing": {
      "visual_regression": true
    }
  }
}
```

---

## Modifying Configuration

### Via Slash Command

```
/company-settings quality.test_coverage_minimum 85
```

### Via Direct Edit

```bash
# Edit the file
code .company/config.json

# Or use jq
cat .company/config.json | jq '.company.quality.test_coverage_minimum = 85' > tmp.json && mv tmp.json .company/config.json
```

### Via Reset

```bash
# Reset to defaults
cp node_modules/claude-virtual-company/templates/config.json .company/config.json
```
