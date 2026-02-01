/**
 * Shared utilities for Claude Virtual Company
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Get the Claude configuration directory paths
 */
function getClaudePaths() {
  const home = os.homedir();
  return {
    global: path.join(home, '.claude'),
    globalSkills: path.join(home, '.claude', 'skills'),
    globalSettings: path.join(home, '.claude', 'settings.json')
  };
}

/**
 * Get the project-specific paths
 */
function getProjectPaths(cwd = process.cwd()) {
  return {
    local: path.join(cwd, '.claude'),
    localSkills: path.join(cwd, '.claude', 'skills'),
    company: path.join(cwd, '.company'),
    config: path.join(cwd, '.company', 'config.json'),
    state: path.join(cwd, '.company', 'state.json'),
    roster: path.join(cwd, '.company', 'roster.json')
  };
}

/**
 * Check if a directory exists and is accessible
 */
function directoryExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Read JSON file safely
 */
function readJSON(filePath, defaultValue = null) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
  }
  return defaultValue;
}

/**
 * Write JSON file with formatting
 */
function writeJSON(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest, options = {}) {
  const { overwrite = false, filter = () => true } = options;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  const results = { copied: [], skipped: [], errors: [] };

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (!filter(entry.name, srcPath)) {
      results.skipped.push(srcPath);
      continue;
    }

    try {
      if (entry.isDirectory()) {
        const subResults = copyDirectory(srcPath, destPath, options);
        results.copied.push(...subResults.copied);
        results.skipped.push(...subResults.skipped);
        results.errors.push(...subResults.errors);
      } else {
        if (fs.existsSync(destPath) && !overwrite) {
          results.skipped.push(destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
          results.copied.push(destPath);
        }
      }
    } catch (e) {
      results.errors.push({ path: srcPath, error: e.message });
    }
  }

  return results;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  company: {
    name: 'Virtual Company',
    initialized: false
  },
  quality: {
    test_coverage_minimum: 80,
    require_tests: {
      unit: 'required',
      integration: 'recommended',
      e2e: 'required_for_user_flows'
    },
    require_code_review: true
  },
  git_flow: {
    strategy: 'gitflow',
    require_pr: true,
    squash_on_merge: true
  },
  hiring: {
    auto_hire: true,
    require_ceo_approval_for_new_roles: false
  }
};

/**
 * Default state values
 */
const DEFAULT_STATE = {
  phase: 'idle',
  goal: null,
  branch: null,
  started: null,
  completed_phases: [],
  active_agents: [],
  blockers: []
};

/**
 * Get configuration with defaults merged in
 * Provides graceful fallback when config file is missing or partial
 * @param {string} projectPath - Project root path (default: cwd)
 * @returns {object} Configuration with defaults applied
 */
function getConfigWithDefaults(projectPath = process.cwd()) {
  const configPath = path.join(projectPath, '.company', 'config.json');
  const loaded = readJSON(configPath, {});
  return deepMerge(DEFAULT_CONFIG, loaded);
}

/**
 * Get state with defaults merged in
 * Provides graceful fallback when state file is missing or partial
 * @param {string} projectPath - Project root path (default: cwd)
 * @returns {object} State with defaults applied
 */
function getStateWithDefaults(projectPath = process.cwd()) {
  const statePath = path.join(projectPath, '.company', 'state.json');
  const loaded = readJSON(statePath, {});
  return { ...DEFAULT_STATE, ...loaded };
}

/**
 * Deep merge two objects
 * @param {object} target - Target object (defaults)
 * @param {object} source - Source object (overrides)
 * @returns {object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

module.exports = {
  getClaudePaths,
  getProjectPaths,
  directoryExists,
  readJSON,
  writeJSON,
  copyDirectory,
  getConfigWithDefaults,
  getStateWithDefaults,
  DEFAULT_CONFIG,
  DEFAULT_STATE
};
