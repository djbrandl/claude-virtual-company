#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const command = args[0];

const PACKAGE_ROOT = path.join(__dirname, '..');
const CWD = process.cwd();

// Import provider system
const { PROVIDERS, normalizeProviderFlag, getInstallAdapters } = require('../src/providers');
const Transpiler = require('../src/transpiler');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function showBanner() {
  console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════════════════╗
║                                                                 ║
║   ${colors.bright}Claude Virtual Company${colors.reset}${colors.cyan}                                     ║
║   ${colors.reset}A hierarchical AI software development framework${colors.cyan}             ║
║   ${colors.reset}${colors.magenta}Now with Gemini CLI support!${colors.reset}${colors.cyan}                               ║
║                                                                 ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

function showHelp() {
  showBanner();
  console.log(`
${colors.bright}USAGE${colors.reset}
  npx claude-virtual-company <command> [options]
  cvc <command> [options]

${colors.bright}COMMANDS${colors.reset}
  ${colors.green}init${colors.reset}              Initialize the framework (both providers by default)
  ${colors.green}init --global${colors.reset}     Install skills globally (~/.claude/skills/)
  ${colors.green}status${colors.reset}            Show installation status
  ${colors.green}upgrade${colors.reset}           Upgrade to latest version
  ${colors.green}uninstall${colors.reset}         Remove the framework from project

${colors.bright}PROVIDER OPTIONS${colors.reset}
  --provider <name>   Install for specific provider(s):
                      ${colors.cyan}both${colors.reset}    - Install for Claude Code and Gemini CLI (default)
                      ${colors.cyan}claude${colors.reset}  - Install for Claude Code only
                      ${colors.cyan}gemini${colors.reset}  - Install for Gemini CLI only

${colors.bright}OTHER OPTIONS${colors.reset}
  --global, -g        Install to global directories
  --force, -f         Overwrite existing files
  --no-hooks          Skip hook installation (Claude only)
  --no-scripts        Skip Python script installation
  --help, -h          Show this help message
  --version, -v       Show version

${colors.bright}EXAMPLES${colors.reset}
  ${colors.cyan}# Initialize for both providers (default)${colors.reset}
  npx claude-virtual-company init

  ${colors.cyan}# Initialize for Claude Code only${colors.reset}
  npx claude-virtual-company init --provider claude

  ${colors.cyan}# Initialize for Gemini CLI only${colors.reset}
  npx claude-virtual-company init --provider gemini

  ${colors.cyan}# Initialize globally${colors.reset}
  npx claude-virtual-company init --global

  ${colors.cyan}# Force reinstall${colors.reset}
  npx claude-virtual-company init --force

${colors.bright}AFTER INSTALLATION${colors.reset}
  ${colors.yellow}Claude Code:${colors.reset}
    claude
    /company "Build a user authentication system"

  ${colors.yellow}Gemini CLI:${colors.reset}
    gemini
    /company "Build a user authentication system"

${colors.bright}DOCUMENTATION${colors.reset}
  https://github.com/djbrandl/claude-virtual-company#readme
`);
}

function showVersion() {
  const pkg = require(path.join(PACKAGE_ROOT, 'package.json'));
  log(`claude-virtual-company v${pkg.version}`, 'cyan');
}

function getProviderFlag() {
  const providerIndex = args.indexOf('--provider');
  if (providerIndex !== -1 && args[providerIndex + 1]) {
    return normalizeProviderFlag(args[providerIndex + 1]);
  }
  return PROVIDERS.BOTH;
}

function checkClaudeDirectory() {
  const globalClaudeDir = path.join(os.homedir(), '.claude');
  const localClaudeDir = path.join(CWD, '.claude');

  return {
    global: fs.existsSync(globalClaudeDir),
    local: fs.existsSync(localClaudeDir),
    globalPath: globalClaudeDir,
    localPath: localClaudeDir
  };
}

function checkGeminiDirectory() {
  const globalGeminiDir = path.join(os.homedir(), '.gemini');
  const localGeminiDir = path.join(CWD, '.gemini');

  return {
    global: fs.existsSync(globalGeminiDir),
    local: fs.existsSync(localGeminiDir),
    globalPath: globalGeminiDir,
    localPath: localGeminiDir
  };
}

function init(options = {}) {
  showBanner();

  const isGlobal = options.global || args.includes('--global') || args.includes('-g');
  const force = options.force || args.includes('--force') || args.includes('-f');
  const skipHooks = args.includes('--no-hooks');
  const skipScripts = args.includes('--no-scripts');
  const providerFlag = options.provider || getProviderFlag();

  const claudeCheck = checkClaudeDirectory();
  const geminiCheck = checkGeminiDirectory();

  const adapters = getInstallAdapters(providerFlag);
  const providerNames = adapters.map(a => a.displayName).join(' and ');

  log(`Installing for: ${providerNames}`, 'blue');
  log(`Mode: ${isGlobal ? 'Global' : 'Local'}`, 'blue');

  // Create shared company directories
  const companyDir = path.join(CWD, '.company');
  const planningDir = path.join(CWD, '.planning');

  const dirs = [
    companyDir,
    path.join(companyDir, 'proposals', 'pending'),
    path.join(companyDir, 'proposals', 'approved'),
    path.join(companyDir, 'proposals', 'rejected'),
    path.join(companyDir, 'artifacts', 'cto'),
    path.join(companyDir, 'artifacts', 'architect'),
    path.join(companyDir, 'artifacts', 'ui-designer'),
    path.join(companyDir, 'artifacts', 'tech-lead'),
    path.join(companyDir, 'artifacts', 'developer'),
    path.join(companyDir, 'artifacts', 'qa'),
    path.join(companyDir, 'artifacts', 'discovery'),
    path.join(companyDir, 'inboxes', 'cto'),
    path.join(companyDir, 'inboxes', 'architect'),
    path.join(companyDir, 'inboxes', 'ui-designer'),
    path.join(companyDir, 'inboxes', 'tech-lead'),
    path.join(companyDir, 'inboxes', 'developer'),
    path.join(companyDir, 'inboxes', 'qa'),
    path.join(companyDir, 'inboxes', 'orchestrator'),
    path.join(companyDir, 'audit'),
    path.join(companyDir, 'tasks'),
    // PM directories
    planningDir,
    path.join(planningDir, 'research'),
    path.join(planningDir, 'quick')
  ];

  log('\nCreating shared directories...', 'yellow');
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`  Created: ${dir}`, 'green');
    }
  });

  // Copy shared templates
  const templatesDir = path.join(PACKAGE_ROOT, 'templates');
  log('\nInstalling shared configuration...', 'yellow');

  const templates = ['config.json', 'roster.json', 'state.json', 'governance-matrix.json', 'pm-config.json'];
  templates.forEach(template => {
    const sourcePath = path.join(templatesDir, template);
    const targetPath = path.join(companyDir, template);

    if (fs.existsSync(sourcePath)) {
      if (fs.existsSync(targetPath) && !force) {
        log(`  Skipped (exists): ${template}`, 'yellow');
      } else {
        fs.copyFileSync(sourcePath, targetPath);
        log(`  Installed: ${template}`, 'green');
      }
    }
  });

  // Copy PM templates
  log('\nInstalling PM configuration...', 'yellow');
  const pmTemplates = ['planning-state.md'];
  pmTemplates.forEach(template => {
    const sourcePath = path.join(templatesDir, template);
    const targetPath = path.join(planningDir, template.replace('planning-', ''));

    if (fs.existsSync(sourcePath)) {
      if (fs.existsSync(targetPath) && !force) {
        log(`  Skipped (exists): ${template}`, 'yellow');
      } else {
        fs.copyFileSync(sourcePath, targetPath);
        log(`  Installed: ${template} → ${targetPath}`, 'green');
      }
    }
  });

  const pmConfigSource = path.join(templatesDir, 'pm-config.json');
  const pmConfigTarget = path.join(planningDir, 'config.json');
  if (fs.existsSync(pmConfigSource) && (!fs.existsSync(pmConfigTarget) || force)) {
    fs.copyFileSync(pmConfigSource, pmConfigTarget);
    log(`  Installed: pm-config.json → .planning/config.json`, 'green');
  }

  // Copy scripts
  if (!skipScripts) {
    const scriptsSourceDir = path.join(PACKAGE_ROOT, 'scripts');
    const scriptsTargetDir = path.join(companyDir, 'scripts');

    if (!fs.existsSync(scriptsTargetDir)) {
      fs.mkdirSync(scriptsTargetDir, { recursive: true });
    }

    log('\nInstalling scripts...', 'yellow');
    if (fs.existsSync(scriptsSourceDir)) {
      const scripts = fs.readdirSync(scriptsSourceDir);
      scripts.forEach(script => {
        const sourcePath = path.join(scriptsSourceDir, script);
        const targetPath = path.join(scriptsTargetDir, script);

        if (fs.statSync(sourcePath).isFile()) {
          if (fs.existsSync(targetPath) && !force) {
            log(`  Skipped (exists): ${script}`, 'yellow');
          } else {
            fs.copyFileSync(sourcePath, targetPath);
            log(`  Installed: ${script}`, 'green');
          }
        }
      });
    }
  }

  // Initialize task index
  const taskIndexPath = path.join(companyDir, 'tasks', 'index.json');
  if (!fs.existsSync(taskIndexPath) || force) {
    fs.writeFileSync(taskIndexPath, JSON.stringify({ nextId: 1, tasks: [] }, null, 2));
    log(`  Initialized: tasks/index.json`, 'green');
  }

  // Install for each provider
  for (const adapter of adapters) {
    installForProvider(adapter, {
      isGlobal,
      force,
      skipHooks,
      claudeCheck,
      geminiCheck
    });
  }

  // Success message
  showSuccessMessage(adapters, providerFlag);
}

function installForProvider(adapter, options) {
  const { isGlobal, force, skipHooks, claudeCheck, geminiCheck } = options;

  console.log('');
  log(`\n${'═'.repeat(60)}`, 'cyan');
  log(`Installing for ${adapter.displayName}...`, 'cyan');
  log(`${'═'.repeat(60)}`, 'cyan');

  if (adapter.name === 'claude') {
    installClaude(adapter, { isGlobal, force, skipHooks, claudeCheck });
  } else if (adapter.name === 'gemini') {
    installGemini(adapter, { isGlobal, force, geminiCheck });
  }
}

function installClaude(adapter, options) {
  const { isGlobal, force, skipHooks, claudeCheck } = options;

  const targetBase = isGlobal ? claudeCheck.globalPath : claudeCheck.localPath;
  const skillsDir = path.join(targetBase, 'skills');

  log(`Target: ${targetBase}`, 'blue');

  // Create skills directory
  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
  }

  // Copy skills
  const sourceSkillsDir = path.join(PACKAGE_ROOT, 'skills');
  const skillFolders = fs.readdirSync(sourceSkillsDir);

  log('\nInstalling Claude Code skills...', 'yellow');
  let installed = 0, skipped = 0;

  skillFolders.forEach(folder => {
    const sourcePath = path.join(sourceSkillsDir, folder);
    const targetPath = path.join(skillsDir, folder);

    if (fs.statSync(sourcePath).isDirectory()) {
      if (fs.existsSync(targetPath) && !force) {
        skipped++;
      } else {
        copyDirectorySync(sourcePath, targetPath);
        installed++;
      }
    }
  });

  log(`  Installed: ${installed} skills`, 'green');
  if (skipped > 0) {
    log(`  Skipped (existing): ${skipped} skills`, 'yellow');
  }

  // Install hooks
  if (!skipHooks) {
    log('\nConfiguring Claude hooks...', 'yellow');
    const settingsPath = path.join(targetBase, 'settings.json');
    const hooksTemplate = path.join(PACKAGE_ROOT, 'templates', 'claude-settings.json');

    if (fs.existsSync(hooksTemplate)) {
      let existingSettings = {};
      if (fs.existsSync(settingsPath)) {
        try {
          existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        } catch (e) {
          log('  Warning: Could not parse existing settings.json', 'yellow');
        }
      }

      const hooksConfig = JSON.parse(fs.readFileSync(hooksTemplate, 'utf8'));

      // Merge hooks (new format: matcher + hooks array)
      existingSettings.hooks = existingSettings.hooks || {};
      Object.keys(hooksConfig.hooks || {}).forEach(hookType => {
        existingSettings.hooks[hookType] = existingSettings.hooks[hookType] || [];
        hooksConfig.hooks[hookType].forEach(newHook => {
          // Check if a hook with this matcher already exists
          const existingHookIndex = existingSettings.hooks[hookType].findIndex(
            h => h.matcher === newHook.matcher
          );

          if (existingHookIndex === -1) {
            // Matcher doesn't exist, add the whole hook entry
            existingSettings.hooks[hookType].push(newHook);
          } else {
            // Matcher exists, merge the hooks arrays
            const existingHook = existingSettings.hooks[hookType][existingHookIndex];
            existingHook.hooks = existingHook.hooks || [];

            newHook.hooks?.forEach(hookItem => {
              const hookExists = existingHook.hooks.some(
                h => h.command === hookItem.command
              );
              if (!hookExists) {
                existingHook.hooks.push(hookItem);
              }
            });
          }
        });
      });

      // Ensure directory exists
      if (!fs.existsSync(targetBase)) {
        fs.mkdirSync(targetBase, { recursive: true });
      }

      fs.writeFileSync(settingsPath, JSON.stringify(existingSettings, null, 2));
      log(`  Updated: ${settingsPath}`, 'green');
    }
  }

  log(`\n${colors.green}✓ Claude Code installation complete${colors.reset}`);
}

function installGemini(adapter, options) {
  const { isGlobal, force, geminiCheck } = options;

  const targetBase = isGlobal ? geminiCheck.globalPath : path.join(CWD, '.gemini');

  log(`Target: ${targetBase}`, 'blue');

  // Create directories
  const contextDir = path.join(targetBase, 'context');
  const commandsDir = path.join(targetBase, 'commands', 'company');

  if (!fs.existsSync(contextDir)) {
    fs.mkdirSync(contextDir, { recursive: true });
  }
  if (!fs.existsSync(commandsDir)) {
    fs.mkdirSync(commandsDir, { recursive: true });
  }

  // Transpile skills
  log('\nTranspiling skills for Gemini CLI...', 'yellow');
  const transpiler = new Transpiler();
  const sourceSkillsDir = path.join(PACKAGE_ROOT, 'skills');

  const results = transpiler.transpileAll(sourceSkillsDir, targetBase, { overwrite: force });

  // Wait for async transpilation
  results.then(r => {
    log(`  Context files: ${r.context.installed.length} created, ${r.context.skipped.length} skipped`, 'green');
    log(`  Command files: ${r.commands.installed.length} created, ${r.commands.skipped.length} skipped`, 'green');

    if (r.context.errors.length > 0) {
      log(`  Errors: ${r.context.errors.length}`, 'red');
      r.context.errors.forEach(e => log(`    - ${e.path}: ${e.error}`, 'red'));
    }
  }).catch(err => {
    log(`  Error during transpilation: ${err.message}`, 'red');
  });

  // Copy main GEMINI.md template
  const geminiMdSource = path.join(PACKAGE_ROOT, 'templates', 'gemini-context', 'GEMINI.md');
  const geminiMdTarget = path.join(CWD, 'GEMINI.md');

  if (fs.existsSync(geminiMdSource)) {
    if (!fs.existsSync(geminiMdTarget) || force) {
      fs.copyFileSync(geminiMdSource, geminiMdTarget);
      log(`\nInstalled: GEMINI.md (project root)`, 'green');
    } else {
      log(`\nSkipped (exists): GEMINI.md`, 'yellow');
    }
  }

  // Configure Gemini settings (MCP server)
  log('\nConfiguring Gemini settings...', 'yellow');
  const settingsPath = path.join(targetBase, 'settings.json');
  const settingsTemplate = path.join(PACKAGE_ROOT, 'templates', 'gemini-settings.json');

  if (fs.existsSync(settingsTemplate)) {
    let existingSettings = {};
    if (fs.existsSync(settingsPath)) {
      try {
        existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      } catch (e) {
        log('  Warning: Could not parse existing settings.json', 'yellow');
      }
    }

    const newSettings = JSON.parse(fs.readFileSync(settingsTemplate, 'utf8'));

    // Merge MCP servers
    existingSettings.mcpServers = existingSettings.mcpServers || {};
    Object.assign(existingSettings.mcpServers, newSettings.mcpServers);

    fs.writeFileSync(settingsPath, JSON.stringify(existingSettings, null, 2));
    log(`  Updated: ${settingsPath}`, 'green');
    log(`  MCP server configured: cvc-task-server`, 'green');
  }

  log(`\n${colors.green}✓ Gemini CLI installation complete${colors.reset}`);
}

function copyDirectorySync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function showSuccessMessage(adapters, providerFlag) {
  const hasClaude = adapters.some(a => a.name === 'claude');
  const hasGemini = adapters.some(a => a.name === 'gemini');

  console.log(`
${colors.green}${colors.bright}Installation complete!${colors.reset}

${colors.bright}Next steps:${colors.reset}
`);

  if (hasClaude) {
    console.log(`  ${colors.cyan}Claude Code:${colors.reset}
    1. Start Claude Code: ${colors.yellow}claude${colors.reset}
    2. Initialize a project: ${colors.yellow}/company "Your project description"${colors.reset}
`);
  }

  if (hasGemini) {
    console.log(`  ${colors.magenta}Gemini CLI:${colors.reset}
    1. Start Gemini CLI: ${colors.yellow}gemini${colors.reset}
    2. Initialize a project: ${colors.yellow}/company "Your project description"${colors.reset}
`);
  }

  console.log(`${colors.bright}Core Commands:${colors.reset}
  /company [goal]          Start a new project
  /company-status          Check workflow state
  /company-settings        View/modify configuration
  /company-merge           Merge to main branch
  /company-roster          View specialists
  /company-hire [domain]   Request new specialist

${colors.bright}Project Manager (GSD-Inspired):${colors.reset}
  /company-new-project     Start new project with roadmap
  /company-progress        Check progress, route to next action
  /company-discuss [phase] Capture phase requirements
  /company-plan-phase [N]  Create executable plans
  /company-execute [N]     Execute plans with parallel waves
  /company-verify [N]      Verify phase completion + UAT
  /company-quick [task]    Quick mode for ad-hoc tasks
  /company-pause           Create context handoff
  /company-resume          Resume from previous session
  /company-milestone       Complete and archive milestone

${colors.bright}Documentation:${colors.reset}
  ${colors.blue}https://github.com/djbrandl/claude-virtual-company${colors.reset}
`);
}

function showStatus() {
  showBanner();

  const claudeCheck = checkClaudeDirectory();
  const geminiCheck = checkGeminiDirectory();

  log('Installation Status:', 'bright');
  console.log('');

  // Claude Status
  log('═══ Claude Code ═══', 'cyan');

  log('\nGlobal directory:', 'cyan');
  log(`  Path: ${claudeCheck.globalPath}`);
  log(`  Exists: ${claudeCheck.global ? 'Yes' : 'No'}`, claudeCheck.global ? 'green' : 'yellow');

  if (claudeCheck.global) {
    const globalSkills = path.join(claudeCheck.globalPath, 'skills');
    if (fs.existsSync(globalSkills)) {
      const skills = fs.readdirSync(globalSkills).filter(f => f.startsWith('company'));
      log(`  Company skills: ${skills.length}`, skills.length > 0 ? 'green' : 'yellow');
    }
  }

  log('\nLocal directory:', 'cyan');
  log(`  Path: ${claudeCheck.localPath}`);
  log(`  Exists: ${claudeCheck.local ? 'Yes' : 'No'}`, claudeCheck.local ? 'green' : 'yellow');

  if (claudeCheck.local) {
    const localSkills = path.join(claudeCheck.localPath, 'skills');
    if (fs.existsSync(localSkills)) {
      const skills = fs.readdirSync(localSkills).filter(f => f.startsWith('company'));
      log(`  Company skills: ${skills.length}`, skills.length > 0 ? 'green' : 'yellow');
    }
  }

  console.log('');

  // Gemini Status
  log('═══ Gemini CLI ═══', 'magenta');

  const localGeminiDir = path.join(CWD, '.gemini');
  log('\nLocal directory:', 'magenta');
  log(`  Path: ${localGeminiDir}`);
  log(`  Exists: ${fs.existsSync(localGeminiDir) ? 'Yes' : 'No'}`, fs.existsSync(localGeminiDir) ? 'green' : 'yellow');

  if (fs.existsSync(localGeminiDir)) {
    const contextDir = path.join(localGeminiDir, 'context');
    const commandsDir = path.join(localGeminiDir, 'commands', 'company');

    if (fs.existsSync(contextDir)) {
      const contexts = fs.readdirSync(contextDir).filter(f => f.startsWith('company'));
      log(`  Context files: ${contexts.length}`, contexts.length > 0 ? 'green' : 'yellow');
    }

    if (fs.existsSync(commandsDir)) {
      const commands = fs.readdirSync(commandsDir).filter(f => f.endsWith('.toml'));
      log(`  TOML commands: ${commands.length}`, commands.length > 0 ? 'green' : 'yellow');
    }

    const settingsPath = path.join(localGeminiDir, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        const hasMcp = settings.mcpServers && settings.mcpServers['cvc-task-server'];
        log(`  MCP task server: ${hasMcp ? 'Configured' : 'Not configured'}`, hasMcp ? 'green' : 'yellow');
      } catch (e) {}
    }
  }

  // Check for GEMINI.md in project root
  const geminiMd = path.join(CWD, 'GEMINI.md');
  log(`\nGEMINI.md in project root: ${fs.existsSync(geminiMd) ? 'Yes' : 'No'}`,
      fs.existsSync(geminiMd) ? 'green' : 'yellow');

  console.log('');

  // Shared State
  log('═══ Shared State ═══', 'blue');

  const companyDir = path.join(CWD, '.company');
  log('\nCompany directory:', 'blue');
  log(`  Path: ${companyDir}`);
  log(`  Exists: ${fs.existsSync(companyDir) ? 'Yes' : 'No'}`, fs.existsSync(companyDir) ? 'green' : 'yellow');

  if (fs.existsSync(companyDir)) {
    const configPath = path.join(companyDir, 'config.json');
    const statePath = path.join(companyDir, 'state.json');
    const tasksPath = path.join(companyDir, 'tasks', 'index.json');

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        log(`  Company name: ${config.company?.name || 'Not set'}`, 'green');
      } catch (e) {}
    }

    if (fs.existsSync(statePath)) {
      try {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        log(`  Current phase: ${state.phase || 'None'}`, 'green');
        log(`  Current goal: ${state.goal || 'None'}`, 'green');
      } catch (e) {}
    }

    if (fs.existsSync(tasksPath)) {
      try {
        const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
        log(`  Tasks: ${tasks.tasks?.length || 0}`, 'green');
      } catch (e) {}
    }
  }
}

function uninstall() {
  showBanner();

  const providerFlag = getProviderFlag();
  const adapters = getInstallAdapters(providerFlag);

  log('Uninstalling Claude Virtual Company...', 'yellow');
  log(`Providers: ${adapters.map(a => a.displayName).join(', ')}`, 'blue');

  const claudeCheck = checkClaudeDirectory();

  for (const adapter of adapters) {
    console.log('');
    log(`Removing ${adapter.displayName} files...`, 'yellow');

    if (adapter.name === 'claude') {
      // Remove Claude skills
      [claudeCheck.globalPath, claudeCheck.localPath].forEach(basePath => {
        if (fs.existsSync(basePath)) {
          const skillsDir = path.join(basePath, 'skills');
          if (fs.existsSync(skillsDir)) {
            const skills = fs.readdirSync(skillsDir).filter(f => f.startsWith('company'));
            skills.forEach(skill => {
              const skillPath = path.join(skillsDir, skill);
              fs.rmSync(skillPath, { recursive: true, force: true });
              log(`  Removed: ${skillPath}`, 'green');
            });
          }
        }
      });
    } else if (adapter.name === 'gemini') {
      // Remove Gemini context and commands
      const localGeminiDir = path.join(CWD, '.gemini');
      if (fs.existsSync(localGeminiDir)) {
        const contextDir = path.join(localGeminiDir, 'context');
        const commandsDir = path.join(localGeminiDir, 'commands', 'company');

        if (fs.existsSync(contextDir)) {
          const contexts = fs.readdirSync(contextDir).filter(f => f.startsWith('company'));
          contexts.forEach(ctx => {
            const ctxPath = path.join(contextDir, ctx);
            fs.unlinkSync(ctxPath);
            log(`  Removed: ${ctxPath}`, 'green');
          });
        }

        if (fs.existsSync(commandsDir)) {
          fs.rmSync(commandsDir, { recursive: true, force: true });
          log(`  Removed: ${commandsDir}`, 'green');
        }
      }

      // Remove GEMINI.md if it's ours
      const geminiMd = path.join(CWD, 'GEMINI.md');
      if (fs.existsSync(geminiMd)) {
        const content = fs.readFileSync(geminiMd, 'utf8');
        if (content.includes('Claude Virtual Company')) {
          fs.unlinkSync(geminiMd);
          log(`  Removed: ${geminiMd}`, 'green');
        }
      }
    }
  }

  log('\nUninstall complete.', 'green');
  log('Note: .company/ directory was preserved. Remove manually if needed.', 'yellow');
}

// Main command handler
switch (command) {
  case 'init':
  case 'install':
    init();
    break;
  case 'status':
    showStatus();
    break;
  case 'uninstall':
  case 'remove':
    uninstall();
    break;
  case 'upgrade':
  case 'update':
    init({ force: true });
    break;
  case '--version':
  case '-v':
    showVersion();
    break;
  case '--help':
  case '-h':
  case 'help':
  case undefined:
    showHelp();
    break;
  default:
    log(`Unknown command: ${command}`, 'red');
    log('Run "cvc --help" for usage information.', 'yellow');
    process.exit(1);
}
