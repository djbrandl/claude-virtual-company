const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CLI_PATH = path.join(__dirname, '..', 'bin', 'cli.js');

function runCli(args = '') {
  try {
    const result = execSync(`node "${CLI_PATH}" ${args}`, {
      encoding: 'utf8',
      timeout: 10000
    });
    return { stdout: result, exitCode: 0 };
  } catch (error) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status || 1
    };
  }
}

describe('CLI --help', () => {
  test('shows usage information', () => {
    const result = runCli('--help');

    expect(result.stdout).toContain('USAGE');
    expect(result.stdout).toContain('npx claude-virtual-company');
    expect(result.stdout).toContain('cvc');
  });

  test('shows available commands', () => {
    const result = runCli('--help');

    expect(result.stdout).toContain('init');
    expect(result.stdout).toContain('status');
    expect(result.stdout).toContain('upgrade');
    expect(result.stdout).toContain('uninstall');
  });

  test('shows documentation URL', () => {
    const result = runCli('--help');

    expect(result.stdout).toContain('https://github.com/djbrandl/claude-virtual-company');
  });

  test('-h is alias for --help', () => {
    const result = runCli('-h');

    expect(result.stdout).toContain('USAGE');
    expect(result.stdout).toContain('COMMANDS');
  });

  test('help command shows help', () => {
    const result = runCli('help');

    expect(result.stdout).toContain('USAGE');
  });
});

describe('CLI --version', () => {
  test('shows version number', () => {
    const result = runCli('--version');
    const pkg = require('../package.json');

    expect(result.stdout).toContain(`v${pkg.version}`);
  });

  test('-v is alias for --version', () => {
    const result = runCli('-v');
    const pkg = require('../package.json');

    expect(result.stdout).toContain(pkg.version);
  });
});

describe('CLI status', () => {
  test('shows installation status', () => {
    const result = runCli('status');

    expect(result.stdout).toContain('Installation Status');
    expect(result.stdout).toContain('Global Claude directory');
    expect(result.stdout).toContain('Local Claude directory');
  });

  test('shows company runtime directory status', () => {
    const result = runCli('status');

    expect(result.stdout).toContain('Company runtime directory');
  });

  test('shows path information', () => {
    const result = runCli('status');
    const home = os.homedir();

    expect(result.stdout).toContain('.claude');
    expect(result.stdout).toContain('.company');
  });
});

describe('CLI init', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cvc-init-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('creates .company directory structure', () => {
    runCli('init');

    expect(fs.existsSync(path.join(tempDir, '.company'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.company', 'proposals'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.company', 'artifacts'))).toBe(true);
  });

  test('shows installation complete message', () => {
    const result = runCli('init');

    expect(result.stdout).toContain('Installation complete');
  });

  test('shows next steps', () => {
    const result = runCli('init');

    expect(result.stdout).toContain('Next steps');
    expect(result.stdout).toContain('/company');
  });
});

describe('CLI unknown commands', () => {
  test('shows error for unknown command', () => {
    const result = runCli('unknowncommand');

    expect(result.stdout).toContain('Unknown command');
    expect(result.stdout).toContain('unknowncommand');
    expect(result.exitCode).toBe(1);
  });

  test('suggests help command', () => {
    const result = runCli('badcommand');

    expect(result.stdout).toContain('--help');
  });
});

describe('CLI no arguments', () => {
  test('shows help when called without arguments', () => {
    const result = runCli('');

    expect(result.stdout).toContain('USAGE');
    expect(result.stdout).toContain('COMMANDS');
  });
});
