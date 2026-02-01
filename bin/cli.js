#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

const PACKAGE_ROOT = path.join(__dirname, '..');
const CWD = process.cwd();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
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
  ${colors.green}init${colors.reset}              Initialize the framework in current project
  ${colors.green}init --global${colors.reset}     Install skills globally (~/.claude/skills/)
  ${colors.green}status${colors.reset}            Show installation status
  ${colors.green}upgrade${colors.reset}           Upgrade to latest version
  ${colors.green}uninstall${colors.reset}         Remove the framework from project

${colors.bright}OPTIONS${colors.reset}
  --global, -g      Install to global Claude skills directory
  --force, -f       Overwrite existing files
  --no-hooks        Skip hook installation
  --no-scripts      Skip Python script installation
  --help, -h        Show this help message
  --version, -v     Show version

${colors.bright}EXAMPLES${colors.reset}
  ${colors.cyan}# Initialize in current project${colors.reset}
  npx claude-virtual-company init

  ${colors.cyan}# Initialize globally for all projects${colors.reset}
  npx claude-virtual-company init --global

  ${colors.cyan}# Force reinstall${colors.reset}
  npx claude-virtual-company init --force

${colors.bright}AFTER INSTALLATION${colors.reset}
  Start Claude Code and use:
  ${colors.yellow}/company "Build a user authentication system"${colors.reset}

${colors.bright}DOCUMENTATION${colors.reset}
  https://github.com/YOUR_USERNAME/claude-virtual-company#readme
`);
}

function showVersion() {
  const pkg = require(path.join(PACKAGE_ROOT, 'package.json'));
  log(`claude-virtual-company v${pkg.version}`, 'cyan');
}

function checkClaudeDirectory() {
  const globalClaudeDir = path.join(require('os').homedir(), '.claude');
  const localClaudeDir = path.join(CWD, '.claude');

  return {
    global: fs.existsSync(globalClaudeDir),
    local: fs.existsSync(localClaudeDir),
    globalPath: globalClaudeDir,
    localPath: localClaudeDir
  };
}

function init(options = {}) {
  showBanner();

  const isGlobal = options.global || args.includes('--global') || args.includes('-g');
  const force = options.force || args.includes('--force') || args.includes('-f');
  const skipHooks = args.includes('--no-hooks');
  const skipScripts = args.includes('--no-scripts');

  const claudeCheck = checkClaudeDirectory();
  const targetBase = isGlobal ? claudeCheck.globalPath : claudeCheck.localPath;
  const skillsDir = path.join(targetBase, 'skills');
  const companyDir = path.join(CWD, '.company');

  log(`Installing to: ${targetBase}`, 'blue');

  // Create directories
  const planningDir = path.join(CWD, '.planning');

  const dirs = [
    skillsDir,
    companyDir,
    path.join(companyDir, 'proposals', 'pending'),
    path.join(companyDir, 'proposals', 'approved'),
    path.join(companyDir, 'proposals', 'rejected'),
    path.join(companyDir, 'artifacts', 'cto'),
    path.join(companyDir, 'artifacts', 'architect'),
    path.join(companyDir, 'artifacts', 'tech-lead'),
    path.join(companyDir, 'artifacts', 'developer'),
    path.join(companyDir, 'artifacts', 'qa'),
    path.join(companyDir, 'inboxes', 'cto'),
    path.join(companyDir, 'inboxes', 'architect'),
    path.join(companyDir, 'inboxes', 'tech-lead'),
    path.join(companyDir, 'inboxes', 'developer'),
    path.join(companyDir, 'inboxes', 'qa'),
    path.join(companyDir, 'audit'),
    // PM directories
    planningDir,
    path.join(planningDir, 'research'),
    path.join(planningDir, 'quick')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`  Created: ${dir}`, 'green');
    }
  });

  // Copy skills
  const sourceSkillsDir = path.join(PACKAGE_ROOT, 'skills');
  const skillFolders = fs.readdirSync(sourceSkillsDir);

  log('\nInstalling skills...', 'yellow');
  skillFolders.forEach(folder => {
    const sourcePath = path.join(sourceSkillsDir, folder);
    const targetPath = path.join(skillsDir, folder);

    if (fs.statSync(sourcePath).isDirectory()) {
      if (fs.existsSync(targetPath) && !force) {
        log(`  Skipped (exists): ${folder}`, 'yellow');
      } else {
        copyDirectorySync(sourcePath, targetPath);
        log(`  Installed: ${folder}`, 'green');
      }
    }
  });

  // Copy templates to .company
  const templatesDir = path.join(PACKAGE_ROOT, 'templates');
  log('\nInstalling configuration...', 'yellow');

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

  // Copy PM templates to .planning
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

  // Copy pm-config to .planning
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

        if (fs.existsSync(targetPath) && !force) {
          log(`  Skipped (exists): ${script}`, 'yellow');
        } else {
          fs.copyFileSync(sourcePath, targetPath);
          log(`  Installed: ${script}`, 'green');
        }
      });
    }
  }

  // Install hooks
  if (!skipHooks) {
    log('\nConfiguring hooks...', 'yellow');
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

      // Merge hooks
      existingSettings.hooks = existingSettings.hooks || {};
      Object.keys(hooksConfig.hooks || {}).forEach(hookType => {
        existingSettings.hooks[hookType] = existingSettings.hooks[hookType] || [];
        // Add new hooks that don't exist
        hooksConfig.hooks[hookType].forEach(newHook => {
          const exists = existingSettings.hooks[hookType].some(
            h => h.command === newHook.command
          );
          if (!exists) {
            existingSettings.hooks[hookType].push(newHook);
          }
        });
      });

      fs.writeFileSync(settingsPath, JSON.stringify(existingSettings, null, 2));
      log(`  Updated: ${settingsPath}`, 'green');
    }
  }

  // Success message
  console.log(`
${colors.green}${colors.bright}Installation complete!${colors.reset}

${colors.bright}Next steps:${colors.reset}

  1. Start Claude Code in your project:
     ${colors.cyan}claude${colors.reset}

  2. Initialize a new project:
     ${colors.yellow}/company "Your project description"${colors.reset}

  3. Check company status:
     ${colors.yellow}/company-status${colors.reset}

  4. View/modify settings:
     ${colors.yellow}/company-settings${colors.reset}

${colors.bright}Core Commands:${colors.reset}
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
  ${colors.blue}https://github.com/YOUR_USERNAME/claude-virtual-company${colors.reset}
`);
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

function showStatus() {
  showBanner();

  const claudeCheck = checkClaudeDirectory();

  log('Installation Status:', 'bright');
  console.log('');

  log('Global Claude directory:', 'cyan');
  log(`  Path: ${claudeCheck.globalPath}`);
  log(`  Exists: ${claudeCheck.global ? 'Yes' : 'No'}`, claudeCheck.global ? 'green' : 'yellow');

  if (claudeCheck.global) {
    const globalSkills = path.join(claudeCheck.globalPath, 'skills');
    if (fs.existsSync(globalSkills)) {
      const skills = fs.readdirSync(globalSkills).filter(f => f.startsWith('company'));
      log(`  Company skills: ${skills.length}`, skills.length > 0 ? 'green' : 'yellow');
    }
  }

  console.log('');
  log('Local Claude directory:', 'cyan');
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
  const companyDir = path.join(CWD, '.company');
  log('Company runtime directory:', 'cyan');
  log(`  Path: ${companyDir}`);
  log(`  Exists: ${fs.existsSync(companyDir) ? 'Yes' : 'No'}`, fs.existsSync(companyDir) ? 'green' : 'yellow');

  if (fs.existsSync(companyDir)) {
    const configPath = path.join(companyDir, 'config.json');
    const statePath = path.join(companyDir, 'state.json');

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
  }
}

function uninstall() {
  showBanner();
  log('Uninstalling Claude Virtual Company...', 'yellow');

  const claudeCheck = checkClaudeDirectory();

  // Remove skills
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
