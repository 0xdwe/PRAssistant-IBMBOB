import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

describe('E2E: CLI Integration', () => {
  const cliPath = path.join(__dirname, '../../../dist/cli.js');
  
  beforeAll(() => {
    // Build the CLI
    execSync('npm run build', { cwd: path.join(__dirname, '../../..'), stdio: 'inherit' });
  });

  it('shows help when no args provided', () => {
    const output = execSync(`node ${cliPath} --help`, { encoding: 'utf-8' });
    
    expect(output).toContain('pr-ready');
    expect(output).toContain('analyze');
  });

  it('analyzes current repo', () => {
    // Run CLI on this repo
    const output = execSync(`node ${cliPath} analyze`, { 
      cwd: path.join(__dirname, '../../../../..'),
      encoding: 'utf-8' 
    });
    
    expect(output).toContain('PR Readiness Report');
  }, 30000); // 30s timeout for git operations

  it('generates markdown output', () => {
    const outputFile = path.join(__dirname, '../../../test-output.md');
    
    // Clean up if exists
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }

    execSync(`node ${cliPath} analyze --output ${outputFile}`, { 
      cwd: path.join(__dirname, '../../../../..'),
      encoding: 'utf-8' 
    });
    
    expect(fs.existsSync(outputFile)).toBe(true);
    const content = fs.readFileSync(outputFile, 'utf-8');
    expect(content).toContain('# PR Readiness Report');
    
    // Cleanup
    fs.unlinkSync(outputFile);
  }, 30000);
});

// Made with Bob
