/**
 * Skill Transpiler
 * Orchestrates conversion of SKILL.md files to provider-specific formats
 */

const fs = require('fs');
const path = require('path');
const SkillToGemini = require('./skill-to-gemini');
const SkillToToml = require('./skill-to-toml');

class Transpiler {
  constructor(options = {}) {
    this.options = options;
    this.geminiTranspiler = new SkillToGemini(options);
    this.tomlTranspiler = new SkillToToml(options);
  }

  /**
   * Transpile a single SKILL.md file
   * @param {string} content - SKILL.md content
   * @param {string} skillName - Skill name
   * @returns {Object} { contextContent, tomlContent, metadata }
   */
  transpileSkill(content, skillName) {
    // Parse the skill
    const parsed = this.parseSkill(content);

    // Generate Gemini context
    const contextContent = this.geminiTranspiler.transpile(parsed, skillName);

    // Generate TOML command (if user-invocable)
    let tomlContent = null;
    if (parsed.frontmatter['user-invocable'] !== false) {
      tomlContent = this.tomlTranspiler.transpile(parsed, skillName);
    }

    return {
      contextContent,
      tomlContent,
      metadata: parsed.frontmatter
    };
  }

  /**
   * Parse a SKILL.md file into frontmatter and body
   * @param {string} content - SKILL.md content
   * @returns {Object} { frontmatter, body, raw }
   */
  parseSkill(content) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!frontmatterMatch) {
      return {
        frontmatter: {},
        body: content,
        raw: content
      };
    }

    const yamlStr = frontmatterMatch[1];
    const body = frontmatterMatch[2];
    const frontmatter = this.parseYaml(yamlStr);

    return {
      frontmatter,
      body,
      raw: content
    };
  }

  /**
   * Parse YAML frontmatter
   * @param {string} yaml - YAML string
   * @returns {Object} Parsed object
   */
  parseYaml(yaml) {
    const result = {};
    const lines = yaml.split('\n');
    let currentKey = null;
    let currentArray = null;
    let indentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Calculate indent
      const leadingSpaces = line.match(/^(\s*)/)[1].length;

      // Array item
      if (trimmed.startsWith('- ')) {
        if (currentKey && currentArray !== null) {
          const value = trimmed.slice(2).trim();
          // Handle inline objects in arrays
          if (value.includes(':')) {
            const obj = {};
            const parts = value.split(/:\s*/);
            if (parts.length === 2) {
              obj[parts[0]] = parts[1];
            }
            currentArray.push(value.startsWith('{') ? this.parseInlineObject(value) : value);
          } else {
            currentArray.push(value);
          }
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
          indentLevel = leadingSpaces;
        } else {
          // Simple value
          currentKey = null;
          currentArray = null;

          // Handle booleans
          if (value === 'true') result[key] = true;
          else if (value === 'false') result[key] = false;
          // Handle numbers
          else if (/^-?\d+$/.test(value)) result[key] = parseInt(value, 10);
          else if (/^-?\d+\.\d+$/.test(value)) result[key] = parseFloat(value);
          // Handle quoted strings
          else if ((value.startsWith('"') && value.endsWith('"')) ||
                   (value.startsWith("'") && value.endsWith("'"))) {
            result[key] = value.slice(1, -1);
          }
          else result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Parse inline YAML object like {key: value, key2: value2}
   * @param {string} str - Inline object string
   * @returns {Object} Parsed object
   */
  parseInlineObject(str) {
    const trimmed = str.slice(1, -1); // Remove { }
    const result = {};
    const pairs = trimmed.split(',');

    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        result[key.trim()] = value;
      }
    }

    return result;
  }

  /**
   * Transpile all skills in a directory
   * @param {string} sourceDir - Source skills directory
   * @param {string} targetDir - Target output directory
   * @param {Object} options - Transpilation options
   * @returns {Object} Results
   */
  async transpileAll(sourceDir, targetDir, options = {}) {
    const results = {
      context: { installed: [], skipped: [], errors: [] },
      commands: { installed: [], skipped: [], errors: [] }
    };

    if (!fs.existsSync(sourceDir)) {
      results.context.errors.push({ path: sourceDir, error: 'Source not found' });
      return results;
    }

    const contextDir = path.join(targetDir, 'context');
    const commandsDir = path.join(targetDir, 'commands', 'company');

    // Ensure directories exist
    fs.mkdirSync(contextDir, { recursive: true });
    fs.mkdirSync(commandsDir, { recursive: true });

    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillPath = path.join(sourceDir, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillPath)) continue;

      try {
        const content = fs.readFileSync(skillPath, 'utf8');
        const transpiled = this.transpileSkill(content, entry.name);

        // Write context file
        const contextPath = path.join(contextDir, `${entry.name}.md`);
        if (!fs.existsSync(contextPath) || options.overwrite) {
          fs.writeFileSync(contextPath, transpiled.contextContent);
          results.context.installed.push(contextPath);
        } else {
          results.context.skipped.push(contextPath);
        }

        // Write TOML file if available
        if (transpiled.tomlContent) {
          const tomlPath = path.join(commandsDir, `${entry.name}.toml`);
          if (!fs.existsSync(tomlPath) || options.overwrite) {
            fs.writeFileSync(tomlPath, transpiled.tomlContent);
            results.commands.installed.push(tomlPath);
          } else {
            results.commands.skipped.push(tomlPath);
          }
        }
      } catch (error) {
        results.context.errors.push({
          path: skillPath,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = Transpiler;
