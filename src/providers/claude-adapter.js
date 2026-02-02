/**
 * Claude Code Adapter
 * Provider implementation for Claude Code CLI
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const ProviderInterface = require('./provider-interface');

class ClaudeAdapter extends ProviderInterface {
  get name() {
    return 'claude';
  }

  get displayName() {
    return 'Claude Code';
  }

  /**
   * Get the skills directory path for Claude
   * @param {boolean} global - Whether to use global or local path
   * @param {string} cwd - Current working directory
   * @returns {string} Skills directory path
   */
  getSkillsPath(global = true, cwd = process.cwd()) {
    if (global) {
      return path.join(os.homedir(), '.claude', 'skills');
    }
    return path.join(cwd, '.claude', 'skills');
  }

  /**
   * Get the settings file path for Claude
   * @param {boolean} global - Whether to use global or local path
   * @param {string} cwd - Current working directory
   * @returns {string} Settings file path
   */
  getSettingsPath(global = true, cwd = process.cwd()) {
    if (global) {
      return path.join(os.homedir(), '.claude', 'settings.json');
    }
    return path.join(cwd, '.claude', 'settings.json');
  }

  /**
   * Install a single skill for Claude (copy SKILL.md directly)
   * @param {Object} skill - Skill definition { name, sourcePath }
   * @param {string} targetDir - Target installation directory
   * @param {Object} options - Installation options
   * @returns {Object} Installation result
   */
  async installSkill(skill, targetDir, options = {}) {
    const { overwrite = false } = options;
    const skillDir = path.join(targetDir, skill.name);
    const skillFile = path.join(skillDir, 'SKILL.md');

    // Create skill directory
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }

    // Check if file exists and we're not overwriting
    if (fs.existsSync(skillFile) && !overwrite) {
      return {
        status: 'skipped',
        path: skillFile,
        reason: 'File exists'
      };
    }

    // Copy the skill file
    fs.copyFileSync(skill.sourcePath, skillFile);

    return {
      status: 'installed',
      path: skillFile
    };
  }

  /**
   * Install all skills for Claude
   * @param {string} sourceDir - Source skills directory
   * @param {string} targetDir - Target installation directory
   * @param {Object} options - Installation options
   * @returns {Object} Installation results
   */
  async installSkills(sourceDir, targetDir, options = {}) {
    const results = { installed: [], skipped: [], errors: [] };

    if (!fs.existsSync(sourceDir)) {
      results.errors.push({ path: sourceDir, error: 'Source directory not found' });
      return results;
    }

    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillPath = path.join(sourceDir, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillPath)) continue;

      try {
        const result = await this.installSkill(
          { name: entry.name, sourcePath: skillPath },
          targetDir,
          options
        );

        if (result.status === 'installed') {
          results.installed.push(result.path);
        } else {
          results.skipped.push(result.path);
        }
      } catch (error) {
        results.errors.push({
          path: skillPath,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Configure Claude settings (hooks)
   * @param {Object} settings - Settings to merge
   * @param {string} settingsPath - Path to settings file
   * @returns {Object} Configuration result
   */
  async configureSettings(settings, settingsPath) {
    let existingSettings = {};

    // Read existing settings
    if (fs.existsSync(settingsPath)) {
      try {
        existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      } catch (e) {
        // Start fresh if invalid
        existingSettings = {};
      }
    }

    // Merge hooks
    if (settings.hooks) {
      existingSettings.hooks = existingSettings.hooks || {};

      for (const [hookType, hookList] of Object.entries(settings.hooks)) {
        existingSettings.hooks[hookType] = existingSettings.hooks[hookType] || [];

        for (const newHook of hookList) {
          // Check if hook already exists (by command or description)
          const exists = existingSettings.hooks[hookType].some(h =>
            h.command === newHook.command ||
            h.description === newHook.description
          );

          if (!exists) {
            existingSettings.hooks[hookType].push(newHook);
          }
        }
      }
    }

    // Merge MCP servers if specified
    if (settings.mcpServers) {
      existingSettings.mcpServers = existingSettings.mcpServers || {};
      Object.assign(existingSettings.mcpServers, settings.mcpServers);
    }

    // Ensure directory exists
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write settings
    fs.writeFileSync(settingsPath, JSON.stringify(existingSettings, null, 2));

    return {
      status: 'configured',
      path: settingsPath
    };
  }

  /**
   * Check if Claude Code is available
   * @returns {boolean} Whether Claude is installed
   */
  isAvailable() {
    const claudePath = path.join(os.homedir(), '.claude');
    return fs.existsSync(claudePath);
  }

  /**
   * Get feature support matrix for Claude
   * @returns {Object} Feature support flags
   */
  getFeatureSupport() {
    return {
      contextFork: true,        // Native context: fork support
      parallelExecution: true,  // Native Task tool parallel execution
      taskTools: true,          // Native TaskCreate, TaskUpdate, etc.
      hooks: true,              // Native PreToolUse, PostToolUse hooks
      toolRestrictions: true,   // Native allowed-tools in YAML
      userQuestions: true,      // Native AskUserQuestion tool
      mcpServers: true,         // Native MCP server support
      dynamicContext: true      // Backtick syntax for dynamic content
    };
  }

  /**
   * Transform skill content for Claude (pass-through)
   * @param {string} content - Original skill content
   * @param {Object} metadata - Skill metadata
   * @returns {string} Same content (no transformation needed)
   */
  transformSkillContent(content, metadata) {
    // Claude uses SKILL.md directly, no transformation needed
    return content;
  }

  /**
   * Get additional files for Claude (none needed)
   * @param {Object} skill - Skill definition
   * @returns {Array} Empty array (no additional files)
   */
  getAdditionalFiles(skill) {
    return [];
  }
}

module.exports = ClaudeAdapter;
