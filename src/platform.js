/**
 * Cross-platform utilities for Claude Virtual Company
 * Provides Node.js alternatives to bash commands for Windows compatibility
 */

const fs = require('fs');
const path = require('path');

/**
 * Get ISO 8601 timestamp
 * Replaces: date -Iseconds
 * @returns {string} ISO 8601 formatted timestamp
 */
function getISOTimestamp() {
  return new Date().toISOString();
}

/**
 * Convert a string to a URL-safe slug
 * Replaces: echo "$str" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g' | cut -c1-N
 * @param {string} str - Input string to slugify
 * @param {number} maxLen - Maximum length of the slug (default: 40)
 * @returns {string} URL-safe slug
 */
function slugify(str, maxLen = 40) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, maxLen);
}

/**
 * Read JSON file safely with fallback default
 * Replaces: cat file.json 2>/dev/null || echo '{}'
 * @param {string} filePath - Path to JSON file
 * @param {*} defaultValue - Default value if file doesn't exist or is invalid
 * @returns {*} Parsed JSON or default value
 */
function readJsonSafe(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    // File doesn't exist or invalid JSON - return default
  }
  return defaultValue;
}

/**
 * Generate a unique project ID
 * Replaces: proj-$(date +%s)
 * @param {string} prefix - Prefix for the ID (default: 'proj')
 * @returns {string} Unique project ID
 */
function generateProjectId(prefix = 'proj') {
  return `${prefix}-${Math.floor(Date.now() / 1000)}`;
}

/**
 * Create a branch name from a description
 * Replaces: echo "$desc" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g' | cut -c1-40
 * @param {string} description - Project/feature description
 * @param {string} prefix - Branch prefix (default: 'feature')
 * @returns {string} Valid git branch name
 */
function createBranchName(description, prefix = 'feature') {
  const slug = slugify(description, 40);
  return `${prefix}/${slug}`;
}

/**
 * Ensure directory exists, creating it recursively if needed
 * Replaces: mkdir -p path
 * @param {string} dirPath - Directory path to ensure exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write JSON to file with pretty formatting
 * Creates parent directories if needed
 * @param {string} filePath - Path to write to
 * @param {*} data - Data to JSON stringify and write
 */
function writeJsonSafe(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  getISOTimestamp,
  slugify,
  readJsonSafe,
  generateProjectId,
  createBranchName,
  ensureDir,
  writeJsonSafe
};
