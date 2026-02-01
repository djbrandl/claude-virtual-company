const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  getClaudePaths,
  getProjectPaths,
  directoryExists,
  readJSON,
  writeJSON,
  copyDirectory
} = require('../src/utils');

describe('getClaudePaths', () => {
  test('returns correct global paths based on home directory', () => {
    const paths = getClaudePaths();
    const home = os.homedir();

    expect(paths.global).toBe(path.join(home, '.claude'));
    expect(paths.globalSkills).toBe(path.join(home, '.claude', 'skills'));
    expect(paths.globalSettings).toBe(path.join(home, '.claude', 'settings.json'));
  });

  test('returns object with expected keys', () => {
    const paths = getClaudePaths();
    expect(paths).toHaveProperty('global');
    expect(paths).toHaveProperty('globalSkills');
    expect(paths).toHaveProperty('globalSettings');
  });
});

describe('getProjectPaths', () => {
  test('returns correct project paths for cwd', () => {
    const cwd = process.cwd();
    const paths = getProjectPaths(cwd);

    expect(paths.local).toBe(path.join(cwd, '.claude'));
    expect(paths.localSkills).toBe(path.join(cwd, '.claude', 'skills'));
    expect(paths.company).toBe(path.join(cwd, '.company'));
    expect(paths.config).toBe(path.join(cwd, '.company', 'config.json'));
    expect(paths.state).toBe(path.join(cwd, '.company', 'state.json'));
    expect(paths.roster).toBe(path.join(cwd, '.company', 'roster.json'));
  });

  test('uses process.cwd() as default', () => {
    const paths = getProjectPaths();
    const cwd = process.cwd();

    expect(paths.company).toBe(path.join(cwd, '.company'));
  });

  test('accepts custom directory path', () => {
    const customPath = '/custom/project/path';
    const paths = getProjectPaths(customPath);

    expect(paths.company).toBe(path.join(customPath, '.company'));
    expect(paths.config).toBe(path.join(customPath, '.company', 'config.json'));
  });
});

describe('directoryExists', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cvc-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('returns true for existing directory', () => {
    expect(directoryExists(tempDir)).toBe(true);
  });

  test('returns false for non-existent directory', () => {
    expect(directoryExists(path.join(tempDir, 'nonexistent'))).toBe(false);
  });

  test('returns false for file path', () => {
    const filePath = path.join(tempDir, 'test.txt');
    fs.writeFileSync(filePath, 'test');
    expect(directoryExists(filePath)).toBe(false);
  });
});

describe('readJSON', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cvc-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('reads valid JSON file', () => {
    const filePath = path.join(tempDir, 'test.json');
    const data = { name: 'test', value: 123 };
    fs.writeFileSync(filePath, JSON.stringify(data));

    expect(readJSON(filePath)).toEqual(data);
  });

  test('returns default value for missing file', () => {
    const filePath = path.join(tempDir, 'missing.json');
    expect(readJSON(filePath)).toBeNull();
    expect(readJSON(filePath, {})).toEqual({});
    expect(readJSON(filePath, { default: true })).toEqual({ default: true });
  });

  test('returns default value for invalid JSON', () => {
    const filePath = path.join(tempDir, 'invalid.json');
    fs.writeFileSync(filePath, 'not valid json {');

    expect(readJSON(filePath)).toBeNull();
    expect(readJSON(filePath, { error: true })).toEqual({ error: true });
  });
});

describe('writeJSON', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cvc-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('writes JSON with proper formatting', () => {
    const filePath = path.join(tempDir, 'output.json');
    const data = { name: 'test', nested: { value: 123 } };

    writeJSON(filePath, data);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toBe(JSON.stringify(data, null, 2));
    expect(JSON.parse(content)).toEqual(data);
  });

  test('creates parent directories if needed', () => {
    const filePath = path.join(tempDir, 'nested', 'deep', 'output.json');
    const data = { created: true };

    writeJSON(filePath, data);

    expect(fs.existsSync(filePath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(filePath, 'utf8'))).toEqual(data);
  });
});

describe('copyDirectory', () => {
  let sourceDir;
  let destDir;

  beforeEach(() => {
    sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cvc-src-'));
    destDir = path.join(os.tmpdir(), `cvc-dest-${Date.now()}`);

    // Create test structure
    fs.writeFileSync(path.join(sourceDir, 'file1.txt'), 'content1');
    fs.writeFileSync(path.join(sourceDir, 'file2.txt'), 'content2');
    fs.mkdirSync(path.join(sourceDir, 'subdir'));
    fs.writeFileSync(path.join(sourceDir, 'subdir', 'nested.txt'), 'nested');
  });

  afterEach(() => {
    fs.rmSync(sourceDir, { recursive: true, force: true });
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
    }
  });

  test('copies directory recursively', () => {
    const results = copyDirectory(sourceDir, destDir);

    expect(fs.existsSync(path.join(destDir, 'file1.txt'))).toBe(true);
    expect(fs.existsSync(path.join(destDir, 'file2.txt'))).toBe(true);
    expect(fs.existsSync(path.join(destDir, 'subdir', 'nested.txt'))).toBe(true);
    expect(results.copied.length).toBe(3);
  });

  test('skips existing files without overwrite option', () => {
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(path.join(destDir, 'file1.txt'), 'existing');

    const results = copyDirectory(sourceDir, destDir);

    expect(fs.readFileSync(path.join(destDir, 'file1.txt'), 'utf8')).toBe('existing');
    expect(results.skipped).toContain(path.join(destDir, 'file1.txt'));
  });

  test('overwrites existing files with overwrite option', () => {
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(path.join(destDir, 'file1.txt'), 'existing');

    copyDirectory(sourceDir, destDir, { overwrite: true });

    expect(fs.readFileSync(path.join(destDir, 'file1.txt'), 'utf8')).toBe('content1');
  });

  test('respects filter function', () => {
    const filter = (name) => !name.endsWith('.txt');

    copyDirectory(sourceDir, destDir, { filter });

    expect(fs.existsSync(path.join(destDir, 'file1.txt'))).toBe(false);
    expect(fs.existsSync(path.join(destDir, 'subdir'))).toBe(true);
  });
});
