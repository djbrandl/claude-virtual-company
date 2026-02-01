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

/**
 * Count lines in a file
 * @param {string} filePath - Path to file
 * @returns {number} Line count or 0 if file doesn't exist
 */
function countLines(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n').length;
    }
  } catch (e) {
    // Silent fail
  }
  return 0;
}

/**
 * Extract content between markers in a file
 * @param {string} filePath - Path to file
 * @param {string} startMarker - Start marker string
 * @param {string} endMarker - End marker string
 * @returns {string} Extracted content or empty string
 */
function extractSection(filePath, startMarker, endMarker) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx === -1) return '';

    const start = startIdx + startMarker.length;
    const end = endIdx === -1 ? content.length : endIdx;

    return content.slice(start, end).trim();
  } catch (e) {
    return '';
  }
}

/**
 * Extract content between tier markers
 * @param {string} filePath - Path to file
 * @param {string} tier - 'summary', 'decisions', or 'full'
 * @returns {string} Extracted content or empty string
 */
function readTier(filePath, tier = 'decisions') {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const tierMap = {
      'summary': ['TIER:SUMMARY', '/TIER:SUMMARY'],
      'decisions': ['TIER:SUMMARY', '/TIER:DECISIONS'],
      'full': null // Return everything
    };

    if (tier === 'full' || !tierMap[tier]) return content;

    const [start, end] = tierMap[tier];
    const startMarker = `<!-- ${start} -->`;
    const endMarker = `<!-- ${end} -->`;

    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx === -1) return ''; // No tiers, fallback needed

    const extracted = content.slice(
      startIdx + startMarker.length,
      endIdx === -1 ? undefined : endIdx
    );

    return extracted.replace(/<!--.*?-->/g, '').trim();
  } catch (e) {
    return '';
  }
}

/**
 * Trim session log in STATE.md, keeping only recent entries
 * @param {string} statePath - Path to STATE.md
 * @param {number} keepEntries - Number of entries to keep
 */
function trimSessionLog(statePath, keepEntries = 10) {
  try {
    let content = fs.readFileSync(statePath, 'utf8');

    // Find session log section
    const logMatch = content.match(/## Session Log\n([\s\S]*?)(?=\n## |$)/);
    if (!logMatch) return;

    const logSection = logMatch[1];
    const lines = logSection.split('\n');

    // Find table rows (lines starting with |)
    const headerLines = [];
    const dataLines = [];

    for (const line of lines) {
      if (line.startsWith('|')) {
        if (line.includes('---') || headerLines.length === 0) {
          headerLines.push(line);
        } else {
          dataLines.push(line);
        }
      }
    }

    if (dataLines.length <= keepEntries) return; // Nothing to trim

    // Keep header + recent entries
    const recentEntries = dataLines.slice(-keepEntries);
    const newLog = [...headerLines, ...recentEntries].join('\n');

    content = content.replace(logMatch[0], `## Session Log\n${newLog}\n`);
    fs.writeFileSync(statePath, content);
  } catch (e) {
    // Silent fail - don't break workflow
  }
}

/**
 * Summarize old session log entries and archive them
 * @param {string} statePath - Path to STATE.md
 * @param {number} keepRecent - Number of recent entries to keep
 * @param {string} archiveDir - Directory to archive old entries
 */
function summarizeSessionLog(statePath, keepRecent = 10, archiveDir = null) {
  try {
    let content = fs.readFileSync(statePath, 'utf8');

    const logMatch = content.match(/## Session Log\n([\s\S]*?)(?=\n## |$)/);
    if (!logMatch) return;

    const logSection = logMatch[1];
    const lines = logSection.split('\n');

    const headerLines = [];
    const dataLines = [];

    for (const line of lines) {
      if (line.startsWith('|')) {
        if (line.includes('---') || headerLines.length === 0) {
          headerLines.push(line);
        } else {
          dataLines.push(line);
        }
      }
    }

    if (dataLines.length <= keepRecent) return;

    // Archive old entries if archive dir provided
    if (archiveDir) {
      ensureDir(archiveDir);
      const timestamp = Date.now();
      const oldEntries = dataLines.slice(0, -keepRecent);
      const archiveContent = [...headerLines, ...oldEntries].join('\n');
      fs.writeFileSync(
        path.join(archiveDir, `session-${timestamp}.md`),
        `# Archived Session Log\n\nArchived: ${new Date().toISOString()}\n\n${archiveContent}`
      );
    }

    // Keep only recent in STATE.md
    trimSessionLog(statePath, keepRecent);
  } catch (e) {
    // Silent fail
  }
}

/**
 * Archive STATE.md and create fresh one for new milestone
 * @param {string} statePath - Path to STATE.md
 * @param {string} archivePath - Archive directory
 */
function archiveAndResetState(statePath, archivePath) {
  try {
    if (fs.existsSync(statePath)) {
      ensureDir(archivePath);
      const timestamp = Date.now();
      fs.copyFileSync(statePath, path.join(archivePath, `STATE-${timestamp}.md`));

      // Create minimal fresh STATE.md
      const fresh = `# Project State

## Current Phase
Ready for next milestone

## Session Log
| Timestamp | Action | Details |
|-----------|--------|---------|

## Active Decisions
(None - fresh milestone)

## Open Blockers
(None)
`;
      fs.writeFileSync(statePath, fresh);
    }
  } catch (e) {
    // Silent fail
  }
}

/**
 * Archive old files matching a pattern
 * @param {string} dir - Directory to search
 * @param {string} pattern - Glob pattern for files
 * @param {number} daysOld - Age threshold in days
 * @param {string} archiveDir - Where to move old files
 */
function archiveOldFiles(dir, pattern, daysOld, archiveDir) {
  try {
    ensureDir(archiveDir);
    const threshold = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      // Simple pattern matching (supports * wildcard)
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');

      if (regex.test(file) && stats.mtime.getTime() < threshold) {
        const destPath = path.join(archiveDir, file);
        fs.renameSync(filePath, destPath);
      }
    }
  } catch (e) {
    // Silent fail
  }
}

module.exports = {
  getISOTimestamp,
  slugify,
  readJsonSafe,
  generateProjectId,
  createBranchName,
  ensureDir,
  writeJsonSafe,
  // Context management utilities
  countLines,
  extractSection,
  readTier,
  trimSessionLog,
  summarizeSessionLog,
  archiveAndResetState,
  archiveOldFiles
};
