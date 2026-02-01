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

module.exports = {
  getClaudePaths,
  getProjectPaths,
  directoryExists,
  readJSON,
  writeJSON,
  copyDirectory
};
