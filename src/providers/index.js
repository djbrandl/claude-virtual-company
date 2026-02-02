/**
 * Provider Abstraction Layer
 * Detects and routes between Claude Code and Gemini CLI
 */

const ClaudeAdapter = require('./claude-adapter');
const GeminiAdapter = require('./gemini-adapter');

/**
 * Supported providers
 */
const PROVIDERS = {
  CLAUDE: 'claude',
  GEMINI: 'gemini',
  BOTH: 'both',
  AUTO: 'auto'
};

/**
 * Detect the current runtime environment
 * @returns {string} 'claude' | 'gemini' | 'auto'
 */
function detectRuntime() {
  // Check environment variables
  if (process.env.CLAUDE_CODE || process.env.CLAUDE_SESSION) {
    return PROVIDERS.CLAUDE;
  }
  if (process.env.GEMINI_CLI || process.env.GEMINI_SESSION) {
    return PROVIDERS.GEMINI;
  }

  // Check for CLI indicators in argv
  const argv = process.argv.join(' ').toLowerCase();
  if (argv.includes('claude')) {
    return PROVIDERS.CLAUDE;
  }
  if (argv.includes('gemini')) {
    return PROVIDERS.GEMINI;
  }

  // Default to auto (let caller decide)
  return PROVIDERS.AUTO;
}

/**
 * Check which providers are available on the system
 * @returns {Object} { claude: boolean, gemini: boolean }
 */
function checkAvailableProviders() {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');

  const home = os.homedir();

  return {
    claude: fs.existsSync(path.join(home, '.claude')),
    gemini: fs.existsSync(path.join(home, '.gemini')) ||
            fs.existsSync(path.join(process.cwd(), '.gemini'))
  };
}

/**
 * Get the appropriate adapter for a provider
 * @param {string} provider - 'claude' | 'gemini'
 * @returns {Object} Provider adapter instance
 */
function getAdapter(provider) {
  switch (provider) {
    case PROVIDERS.CLAUDE:
      return new ClaudeAdapter();
    case PROVIDERS.GEMINI:
      return new GeminiAdapter();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Get adapters for installation based on provider flag
 * @param {string} providerFlag - 'claude' | 'gemini' | 'both' | 'auto'
 * @returns {Array} Array of provider adapters to install
 */
function getInstallAdapters(providerFlag = PROVIDERS.BOTH) {
  const adapters = [];

  if (providerFlag === PROVIDERS.BOTH || providerFlag === PROVIDERS.AUTO) {
    adapters.push(new ClaudeAdapter());
    adapters.push(new GeminiAdapter());
  } else if (providerFlag === PROVIDERS.CLAUDE) {
    adapters.push(new ClaudeAdapter());
  } else if (providerFlag === PROVIDERS.GEMINI) {
    adapters.push(new GeminiAdapter());
  }

  return adapters;
}

/**
 * Normalize provider flag from CLI input
 * @param {string} input - User input (claude, gemini, both, auto, etc.)
 * @returns {string} Normalized provider constant
 */
function normalizeProviderFlag(input) {
  if (!input) return PROVIDERS.BOTH;

  const normalized = input.toLowerCase().trim();

  switch (normalized) {
    case 'claude':
    case 'claude-code':
    case 'cc':
      return PROVIDERS.CLAUDE;
    case 'gemini':
    case 'gemini-cli':
    case 'gc':
      return PROVIDERS.GEMINI;
    case 'both':
    case 'all':
      return PROVIDERS.BOTH;
    case 'auto':
    case 'detect':
      return PROVIDERS.AUTO;
    default:
      return PROVIDERS.BOTH;
  }
}

module.exports = {
  PROVIDERS,
  detectRuntime,
  checkAvailableProviders,
  getAdapter,
  getInstallAdapters,
  normalizeProviderFlag,
  ClaudeAdapter,
  GeminiAdapter
};
