/**
 * SKILL.md to GEMINI.md Transpiler
 * Converts Claude Code skills to Gemini CLI context files
 */

class SkillToGemini {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Transpile a parsed skill to Gemini context format
   * @param {Object} skill - Parsed skill { frontmatter, body }
   * @param {string} skillName - Skill name
   * @returns {string} GEMINI.md content
   */
  transpile(skill, skillName) {
    const { frontmatter, body } = skill;

    const sections = [];

    // Header
    sections.push(this.generateHeader(frontmatter, skillName));

    // Compatibility notes
    sections.push(this.generateCompatibilityNotes(frontmatter));

    // State loading instructions
    sections.push(this.generateStateInstructions(frontmatter, body));

    // Transformed body
    sections.push(this.transformBody(body, frontmatter));

    // Footer with workflow notes
    sections.push(this.generateFooter(frontmatter, skillName));

    return sections.filter(s => s).join('\n\n');
  }

  /**
   * Generate header section
   * @param {Object} frontmatter - Skill frontmatter
   * @param {string} skillName - Skill name
   * @returns {string} Header markdown
   */
  generateHeader(frontmatter, skillName) {
    const name = frontmatter.name || skillName;
    const description = frontmatter.description || 'Claude Virtual Company role';

    return `# ${this.formatTitle(name)}

> ${description}

**Provider**: Gemini CLI
**Original Format**: Claude Code SKILL.md
**Role Type**: ${frontmatter.context === 'fork' ? 'Isolated Worker' : 'Orchestrator'}`;
  }

  /**
   * Format skill name as title
   * @param {string} name - Skill name
   * @returns {string} Formatted title
   */
  formatTitle(name) {
    return name
      .replace(/^company-?/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Company Role';
  }

  /**
   * Generate compatibility notes section
   * @param {Object} frontmatter - Skill frontmatter
   * @returns {string} Compatibility notes markdown
   */
  generateCompatibilityNotes(frontmatter) {
    const notes = ['## Gemini CLI Adaptation Notes', ''];

    // Context isolation
    if (frontmatter.context === 'fork') {
      notes.push('### Context Isolation');
      notes.push('This role originally runs in an isolated context. In Gemini CLI:');
      notes.push('- Work sequentially through each task');
      notes.push('- Save important context to files before moving to the next role');
      notes.push('- Read context files from previous roles before starting');
      notes.push('');
    }

    // Tool restrictions
    if (frontmatter['allowed-tools'] && Array.isArray(frontmatter['allowed-tools'])) {
      notes.push('### Recommended Tools');
      notes.push('This role is designed to use these tools:');
      notes.push(frontmatter['allowed-tools'].map(t => `- ${t}`).join('\n'));
      notes.push('');
      notes.push('**Guidance**: Stick to these tools to match the original role\'s behavior.');
      notes.push('');
    }

    // Agent type
    if (frontmatter.agent) {
      notes.push('### Execution Style');
      const agentDescriptions = {
        'Explore': 'Focus on exploration and research. Read files, search code, gather context before making decisions.',
        'Plan': 'Focus on planning and design. Create detailed plans before any implementation.',
        'general-purpose': 'General implementation. Can read, write, and modify files as needed.'
      };
      notes.push(agentDescriptions[frontmatter.agent] || `Agent type: ${frontmatter.agent}`);
      notes.push('');
    }

    // Related skills
    if (frontmatter.skills && Array.isArray(frontmatter.skills)) {
      notes.push('### Related Commands');
      notes.push('This role may reference these other commands:');
      notes.push(frontmatter.skills.map(s => `- /${s}`).join('\n'));
      notes.push('');
    }

    return notes.join('\n');
  }

  /**
   * Generate state loading instructions
   * @param {Object} frontmatter - Skill frontmatter
   * @param {string} body - Skill body
   * @returns {string} State instructions markdown
   */
  generateStateInstructions(frontmatter, body) {
    const instructions = ['## Context Loading', ''];
    instructions.push('Before executing this role, load the following context:');
    instructions.push('');

    // Extract file references from body
    const fileRefs = this.extractFileReferences(body);
    const stateFiles = new Set([
      '.company/state.json',
      '.company/config.json',
      ...fileRefs
    ]);

    instructions.push('### Required State Files');
    instructions.push('```');
    for (const file of stateFiles) {
      instructions.push(`# Read: ${file}`);
    }
    instructions.push('```');
    instructions.push('');

    // Add inbox check if relevant
    if (body.includes('inboxes/')) {
      const roleMatch = body.match(/inboxes\/(\w+)/);
      if (roleMatch) {
        instructions.push(`### Check Inbox`);
        instructions.push(`Look for messages in: \`.company/inboxes/${roleMatch[1]}/\``);
        instructions.push('');
      }
    }

    return instructions.join('\n');
  }

  /**
   * Extract file references from body
   * @param {string} body - Skill body
   * @returns {Array} File paths referenced
   */
  extractFileReferences(body) {
    const refs = [];

    // Match cat commands
    const catMatches = body.matchAll(/cat\s+([^\s|;]+)/g);
    for (const match of catMatches) {
      const file = match[1].replace(/['"`]/g, '');
      if (!file.includes('$') && !file.includes('{')) {
        refs.push(file);
      }
    }

    // Match explicit file paths
    const pathMatches = body.matchAll(/\.company\/[a-z0-9\-\/]+\.(json|md)/gi);
    for (const match of pathMatches) {
      refs.push(match[0]);
    }

    const planningMatches = body.matchAll(/\.planning\/[a-z0-9\-\/]+\.(json|md)/gi);
    for (const match of planningMatches) {
      refs.push(match[0]);
    }

    return [...new Set(refs)];
  }

  /**
   * Transform the skill body for Gemini
   * @param {string} body - Original body
   * @param {Object} frontmatter - Skill frontmatter
   * @returns {string} Transformed body
   */
  transformBody(body, frontmatter) {
    let transformed = body;

    // Transform !`command` blocks to context loading instructions
    transformed = transformed.replace(
      /!\`([^`]+)\`/g,
      (match, command) => this.transformDynamicBlock(command)
    );

    // Replace $ARGUMENTS with Gemini template
    transformed = transformed.replace(/\$ARGUMENTS/g, '{{args}}');

    // Transform Task() calls to instructions
    transformed = this.transformTaskCalls(transformed);

    // Transform TaskCreate/TaskUpdate/etc
    transformed = this.transformTaskTools(transformed);

    // Transform AskUserQuestion
    transformed = this.transformUserQuestions(transformed);

    // Add section marker for the actual instructions
    transformed = `## Role Instructions\n\n${transformed}`;

    return transformed;
  }

  /**
   * Transform a dynamic backtick block
   * @param {string} command - Bash command
   * @returns {string} Instruction text
   */
  transformDynamicBlock(command) {
    // State file reads
    if (command.includes('cat .company/state.json')) {
      return `**[Load State]** Read \`.company/state.json\` and use its contents here.`;
    }
    if (command.includes('cat .company/config.json')) {
      return `**[Load Config]** Read \`.company/config.json\` and use its contents here.`;
    }
    if (command.includes('cat .company/roster.json')) {
      return `**[Load Roster]** Read \`.company/roster.json\` and use its contents here.`;
    }

    // Inbox checks
    if (command.includes('find .company/inboxes')) {
      const roleMatch = command.match(/inboxes\/(\w+)/);
      const role = roleMatch ? roleMatch[1] : 'this role';
      return `**[Check Inbox]** Read any JSON files in \`.company/inboxes/${role}/\` directory.`;
    }

    // Planning files
    if (command.includes('.planning/')) {
      const fileMatch = command.match(/\.planning\/([A-Z\-\.]+)/);
      const file = fileMatch ? fileMatch[1] : 'state files';
      return `**[Load Planning Context]** Read \`.planning/${file}\` and use its contents here.`;
    }

    // Generic file cat
    if (command.includes('cat ')) {
      const fileMatch = command.match(/cat\s+([^\s|;]+)/);
      if (fileMatch) {
        return `**[Load File]** Read \`${fileMatch[1]}\` and use its contents here.`;
      }
    }

    // Proposals listing
    if (command.includes('ls .company/proposals')) {
      return `**[Check Proposals]** List files in \`.company/proposals/pending/\` directory.`;
    }

    // Generic command
    return `**[Execute]** Run this command and include the output:\n\`\`\`bash\n${command}\n\`\`\``;
  }

  /**
   * Transform Task() calls to instructions
   * @param {string} body - Body content
   * @returns {string} Transformed body
   */
  transformTaskCalls(body) {
    // Match Task(...) patterns
    return body.replace(
      /Task\s*\(\s*([\s\S]*?)\s*\)/g,
      (match, args) => {
        // Extract key info from the Task call
        const subagentMatch = args.match(/subagent_type:\s*["']([^"']+)["']/);
        const promptMatch = args.match(/prompt:\s*["'`]([^"'`]+)["'`]/);
        const backgroundMatch = args.match(/run_in_background:\s*(true|false)/);

        const subagent = subagentMatch ? subagentMatch[1] : 'agent';
        const prompt = promptMatch ? promptMatch[1] : 'Execute the task';
        const isBackground = backgroundMatch && backgroundMatch[1] === 'true';

        return `
**[Spawn Role: ${subagent}]**

${isBackground ? '> This would run in parallel on Claude. Execute sequentially on Gemini.\n' : ''}
Invoke the \`/${subagent}\` command with:
> ${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}

After completion, read any artifacts produced by this role.
`;
      }
    );
  }

  /**
   * Transform TaskCreate/TaskUpdate/TaskList/TaskGet calls
   * @param {string} body - Body content
   * @returns {string} Transformed body
   */
  transformTaskTools(body) {
    // TaskCreate
    body = body.replace(
      /TaskCreate\s*\(\s*([\s\S]*?)\s*\)/g,
      (match, args) => {
        return `**[Create Task via MCP]** Use the \`cvc_task_create\` tool:\n\`\`\`\n${args.trim()}\n\`\`\``;
      }
    );

    // TaskList
    body = body.replace(
      /TaskList\s*\(\s*\)/g,
      '**[List Tasks via MCP]** Use the `cvc_task_list` tool to see all current tasks.'
    );

    // TaskUpdate
    body = body.replace(
      /TaskUpdate\s*\(\s*([\s\S]*?)\s*\)/g,
      (match, args) => {
        return `**[Update Task via MCP]** Use the \`cvc_task_update\` tool:\n\`\`\`\n${args.trim()}\n\`\`\``;
      }
    );

    // TaskGet
    body = body.replace(
      /TaskGet\s*\(\s*([\s\S]*?)\s*\)/g,
      (match, args) => {
        return `**[Get Task via MCP]** Use the \`cvc_task_get\` tool:\n\`\`\`\n${args.trim()}\n\`\`\``;
      }
    );

    return body;
  }

  /**
   * Transform AskUserQuestion calls
   * @param {string} body - Body content
   * @returns {string} Transformed body
   */
  transformUserQuestions(body) {
    return body.replace(
      /AskUserQuestion\s*\(\s*\{([\s\S]*?)\}\s*\)/g,
      (match, args) => {
        return `**[Ask User]** Present the user with these choices and wait for their response:\n\`\`\`\n${args.trim()}\n\`\`\`\nDescribe the options clearly and ask for their selection.`;
      }
    );
  }

  /**
   * Generate footer section
   * @param {Object} frontmatter - Skill frontmatter
   * @param {string} skillName - Skill name
   * @returns {string} Footer markdown
   */
  generateFooter(frontmatter, skillName) {
    const footer = ['---', '', '## Workflow Notes'];

    footer.push('');
    footer.push('### Sequential Execution');
    footer.push('Gemini CLI executes roles sequentially. After completing this role:');
    footer.push('1. Ensure all artifacts are written to the appropriate `.company/artifacts/` directory');
    footer.push('2. Update `.company/state.json` with the new phase');
    footer.push('3. Create any handoff documents for the next role');
    footer.push('4. Notify the orchestrator by writing to `.company/inboxes/orchestrator/`');

    if (frontmatter.context === 'fork') {
      footer.push('');
      footer.push('### Context Handoff');
      footer.push('Since this role runs in isolation:');
      footer.push('- Document all decisions made');
      footer.push('- Write detailed handoff files');
      footer.push('- Include verification commands for the next role');
    }

    footer.push('');
    footer.push('---');
    footer.push(`*Transpiled from: skills/${skillName}/SKILL.md*`);

    return footer.join('\n');
  }
}

module.exports = SkillToGemini;
