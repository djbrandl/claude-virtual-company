/**
 * Gemini CLI Adapter
 * Provider implementation for Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const ProviderInterface = require('./provider-interface');

class GeminiAdapter extends ProviderInterface {
  get name() {
    return 'gemini';
  }

  get displayName() {
    return 'Gemini CLI';
  }

  /**
   * Get the context directory path for Gemini
   * @param {boolean} global - Whether to use global or local path
   * @param {string} cwd - Current working directory
   * @returns {string} Context directory path
   */
  getSkillsPath(global = false, cwd = process.cwd()) {
    // Gemini uses project-local .gemini directory by default
    // Global installation puts context in ~/.gemini/context/
    if (global) {
      return path.join(os.homedir(), '.gemini', 'context');
    }
    return path.join(cwd, '.gemini', 'context');
  }

  /**
   * Get the commands directory path for Gemini
   * @param {boolean} global - Whether to use global or local path
   * @param {string} cwd - Current working directory
   * @returns {string} Commands directory path
   */
  getCommandsPath(global = false, cwd = process.cwd()) {
    if (global) {
      return path.join(os.homedir(), '.gemini', 'commands', 'company');
    }
    return path.join(cwd, '.gemini', 'commands', 'company');
  }

  /**
   * Get the settings file path for Gemini
   * @param {boolean} global - Whether to use global or local path
   * @param {string} cwd - Current working directory
   * @returns {string} Settings file path
   */
  getSettingsPath(global = false, cwd = process.cwd()) {
    if (global) {
      return path.join(os.homedir(), '.gemini', 'settings.json');
    }
    return path.join(cwd, '.gemini', 'settings.json');
  }

  /**
   * Get the main GEMINI.md path
   * @param {string} cwd - Current working directory
   * @returns {string} GEMINI.md path
   */
  getMainContextPath(cwd = process.cwd()) {
    return path.join(cwd, 'GEMINI.md');
  }

  /**
   * Install a single skill for Gemini (transpile SKILL.md to GEMINI.md)
   * @param {Object} skill - Skill definition { name, sourcePath, content }
   * @param {string} targetDir - Target installation directory
   * @param {Object} options - Installation options
   * @returns {Object} Installation result
   */
  async installSkill(skill, targetDir, options = {}) {
    const { overwrite = false, transpiler } = options;

    // Read skill content if not provided
    let content = skill.content;
    if (!content && skill.sourcePath) {
      content = fs.readFileSync(skill.sourcePath, 'utf8');
    }

    // Transpile to Gemini format
    const transformed = transpiler
      ? transpiler.transpileSkill(content, skill.name)
      : this.basicTranspile(content, skill.name);

    // Write context file
    const contextDir = targetDir;
    if (!fs.existsSync(contextDir)) {
      fs.mkdirSync(contextDir, { recursive: true });
    }

    const contextFile = path.join(contextDir, `${skill.name}.md`);

    if (fs.existsSync(contextFile) && !overwrite) {
      return {
        status: 'skipped',
        path: contextFile,
        reason: 'File exists'
      };
    }

    fs.writeFileSync(contextFile, transformed.contextContent);

    // Write TOML command file if user-invocable
    const files = [{ status: 'installed', path: contextFile, type: 'context' }];

    if (transformed.tomlContent) {
      const commandsDir = path.join(path.dirname(targetDir), 'commands', 'company');
      if (!fs.existsSync(commandsDir)) {
        fs.mkdirSync(commandsDir, { recursive: true });
      }

      const tomlFile = path.join(commandsDir, `${skill.name}.toml`);
      if (!fs.existsSync(tomlFile) || overwrite) {
        fs.writeFileSync(tomlFile, transformed.tomlContent);
        files.push({ status: 'installed', path: tomlFile, type: 'command' });
      }
    }

    return {
      status: 'installed',
      files
    };
  }

  /**
   * Basic transpilation without full transpiler
   * @param {string} content - SKILL.md content
   * @param {string} skillName - Skill name
   * @returns {Object} { contextContent, tomlContent }
   */
  basicTranspile(content, skillName) {
    // Parse YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let frontmatter = {};
    let body = content;

    if (frontmatterMatch) {
      try {
        // Simple YAML parsing for basic fields
        const yamlStr = frontmatterMatch[1];
        frontmatter = this.parseSimpleYaml(yamlStr);
        body = frontmatterMatch[2];
      } catch (e) {
        // Use full content if parsing fails
      }
    }

    // Transform body
    const transformedBody = this.transformBody(body);

    // Generate context content
    const contextContent = this.generateContextContent(frontmatter, transformedBody, skillName);

    // Generate TOML if user-invocable
    let tomlContent = null;
    if (frontmatter['user-invocable'] !== false) {
      tomlContent = this.generateTomlContent(frontmatter, skillName);
    }

    return { contextContent, tomlContent };
  }

  /**
   * Parse simple YAML (key: value pairs)
   * @param {string} yaml - YAML string
   * @returns {Object} Parsed object
   */
  parseSimpleYaml(yaml) {
    const result = {};
    const lines = yaml.split('\n');
    let currentKey = null;
    let currentArray = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Array item
      if (trimmed.startsWith('- ')) {
        if (currentKey && currentArray !== null) {
          currentArray.push(trimmed.slice(2).trim());
        }
        continue;
      }

      // Key: value pair
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.slice(0, colonIndex).trim();
        const value = trimmed.slice(colonIndex + 1).trim();

        if (value === '') {
          // Start of array or nested object
          currentKey = key;
          currentArray = [];
          result[key] = currentArray;
        } else {
          // Simple value
          currentKey = null;
          currentArray = null;

          // Handle booleans
          if (value === 'true') result[key] = true;
          else if (value === 'false') result[key] = false;
          else result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Transform SKILL.md body for Gemini
   * @param {string} body - Markdown body
   * @returns {string} Transformed body
   */
  transformBody(body) {
    let transformed = body;

    // Replace !`command` syntax with context loading instructions
    transformed = transformed.replace(
      /!\`([^`]+)\`/g,
      (match, command) => {
        // Convert bash command to file read instruction
        if (command.includes('cat ')) {
          const fileMatch = command.match(/cat\s+([^\s|]+)/);
          if (fileMatch) {
            return `**[Load context from: ${fileMatch[1]}]**`;
          }
        }
        if (command.includes('find ')) {
          return `**[Search for files matching the pattern in the command]**`;
        }
        return `**[Execute and include output: ${command}]**`;
      }
    );

    // Replace $ARGUMENTS with Gemini template syntax
    transformed = transformed.replace(/\$ARGUMENTS/g, '{{args}}');

    return transformed;
  }

  /**
   * Generate Gemini context file content
   * @param {Object} frontmatter - Parsed frontmatter
   * @param {string} body - Transformed body
   * @param {string} skillName - Skill name
   * @returns {string} GEMINI.md content
   */
  generateContextContent(frontmatter, body, skillName) {
    const header = [
      `# ${frontmatter.name || skillName}`,
      '',
      `> ${frontmatter.description || 'Claude Virtual Company role'}`,
      ''
    ];

    // Add capability notes
    const capabilities = [
      '## Gemini CLI Compatibility Notes',
      '',
      'This role has been adapted for Gemini CLI. Some features work differently:',
      ''
    ];

    if (frontmatter.context === 'fork') {
      capabilities.push('- **Context Isolation**: This role runs in sequence. Save context to files for the next role.');
    }
    if (frontmatter['allowed-tools']) {
      capabilities.push(`- **Available Tools**: ${frontmatter['allowed-tools'].join(', ')}`);
    }
    if (frontmatter.skills) {
      capabilities.push(`- **Related Commands**: ${frontmatter.skills.map(s => `/${s}`).join(', ')}`);
    }

    capabilities.push('');
    capabilities.push('---');
    capabilities.push('');

    return [...header, ...capabilities, body].join('\n');
  }

  /**
   * Generate TOML command file content
   * @param {Object} frontmatter - Parsed frontmatter
   * @param {string} skillName - Skill name
   * @returns {string} TOML content
   */
  generateTomlContent(frontmatter, skillName) {
    const description = frontmatter.description || `${skillName} command`;
    const argHint = frontmatter['argument-hint'] || '[task]';

    return `# ${skillName} command for Gemini CLI
# Generated by Claude Virtual Company

[command]
description = "${description}"

[command.args]
task = { description = "The task or goal", required = true, hint = "${argHint}" }

[command.steps]
1 = """
Load the context file: .gemini/context/${skillName}.md

Then execute the role with the provided task: {{args.task}}

Remember to:
1. Read any referenced state files (.company/state.json, etc.)
2. Follow the role's instructions carefully
3. Write outputs to the appropriate .company/artifacts/ directory
4. Update state files when complete
"""
`;
  }

  /**
   * Install all skills for Gemini
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

    // Ensure target directories exist
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
          if (result.files) {
            results.installed.push(...result.files.map(f => f.path));
          } else {
            results.installed.push(result.path);
          }
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
   * Configure Gemini settings
   * @param {Object} settings - Settings to apply
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
        existingSettings = {};
      }
    }

    // Merge MCP servers
    if (settings.mcpServers) {
      existingSettings.mcpServers = existingSettings.mcpServers || {};
      Object.assign(existingSettings.mcpServers, settings.mcpServers);
    }

    // Merge other settings
    for (const [key, value] of Object.entries(settings)) {
      if (key !== 'mcpServers' && key !== 'hooks') {
        existingSettings[key] = value;
      }
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
   * Create main GEMINI.md file for the project
   * @param {string} cwd - Current working directory
   * @param {Object} options - Options
   * @returns {Object} Result
   */
  async createMainContext(cwd = process.cwd(), options = {}) {
    const { overwrite = false } = options;
    const mainPath = this.getMainContextPath(cwd);

    if (fs.existsSync(mainPath) && !overwrite) {
      return {
        status: 'skipped',
        path: mainPath,
        reason: 'File exists'
      };
    }

    const content = `# Claude Virtual Company - Gemini CLI

This project uses the Claude Virtual Company framework adapted for Gemini CLI.

## Quick Start

Use the company commands to delegate work through a virtual engineering team:

\`\`\`
/company "build a todo app"
\`\`\`

## Available Commands

- \`/company\` - Main orchestrator, delegates to appropriate roles
- \`/company-cto\` - Technical strategy and architecture decisions
- \`/company-architect\` - System design and component architecture
- \`/company-developer\` - Implementation and coding
- \`/company-qa\` - Quality assurance and testing

## Project Structure

\`\`\`
.company/           # Shared state and artifacts
├── config.json     # Company configuration
├── state.json      # Current workflow state
├── roster.json     # Team roster
├── artifacts/      # Role deliverables
└── proposals/      # Pending approvals

.gemini/            # Gemini CLI configuration
├── context/        # Role context files
├── commands/       # TOML command definitions
└── settings.json   # MCP server configuration
\`\`\`

## MCP Task Server

The CVC task server provides task management tools:
- \`cvc_task_create\` - Create a new task
- \`cvc_task_list\` - List all tasks
- \`cvc_task_update\` - Update task status
- \`cvc_task_get\` - Get task details

## Documentation

See the full documentation in the \`docs/\` directory.
`;

    fs.writeFileSync(mainPath, content);
    return {
      status: 'installed',
      path: mainPath
    };
  }

  /**
   * Check if Gemini CLI is available
   * @returns {boolean} Whether Gemini is available
   */
  isAvailable() {
    // Check for global .gemini or local .gemini
    const globalPath = path.join(os.homedir(), '.gemini');
    const localPath = path.join(process.cwd(), '.gemini');
    return fs.existsSync(globalPath) || fs.existsSync(localPath);
  }

  /**
   * Get feature support matrix for Gemini
   * @returns {Object} Feature support flags
   */
  getFeatureSupport() {
    return {
      contextFork: false,       // No native isolation, use sequential + checkpoints
      parallelExecution: false, // No parallel agent execution
      taskTools: true,          // Via MCP server
      hooks: false,             // No native hook support
      toolRestrictions: false,  // Trust-based guidance only
      userQuestions: true,      // Text prompts
      mcpServers: true,         // Native MCP support
      dynamicContext: false     // No backtick syntax, pre-load context
    };
  }

  /**
   * Transform skill content for Gemini
   * @param {string} content - Original skill content
   * @param {Object} metadata - Skill metadata
   * @returns {string} Transformed content
   */
  transformSkillContent(content, metadata) {
    return this.basicTranspile(content, metadata.name).contextContent;
  }
}

module.exports = GeminiAdapter;
