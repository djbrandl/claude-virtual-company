/**
 * Post-install script for npm install
 * Provides guidance after package installation
 */

const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

// Only show message for direct installation, not as dependency
const isDirectInstall = !process.env.npm_config_global &&
                        process.env.npm_lifecycle_event === 'postinstall';

if (isDirectInstall || process.argv.includes('--auto')) {
  console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════════════════╗
║  ${colors.bright}Claude Virtual Company${colors.reset}${colors.cyan} installed successfully!              ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.bright}Quick Start:${colors.reset}

  ${colors.green}npx claude-virtual-company init${colors.reset}

  This will install the skills and configuration to your project.

${colors.bright}Or install globally:${colors.reset}

  ${colors.green}npx claude-virtual-company init --global${colors.reset}

${colors.yellow}Run "npx claude-virtual-company --help" for more options.${colors.reset}
`);
}

module.exports = {};
