const { describe, it } = require('node:test');
const assert = require('node:assert');
const { generateReport, getStatus } = require('./report');

describe('getStatus', () => {
  it('should return passed status for success', () => {
    assert.strictEqual(getStatus('success'), '✅ Passed');
  });

  it('should return failed status for failure', () => {
    assert.strictEqual(getStatus('failure'), '❌ Failed');
  });

  it('should return failed status for cancelled', () => {
    assert.strictEqual(getStatus('cancelled'), '❌ Failed');
  });

  it('should return failed status for skipped', () => {
    assert.strictEqual(getStatus('skipped'), '❌ Failed');
  });
});

describe('generateReport', () => {
  const mockContext = {
    sha: 'abc1234567890',
    runId: 12345,
    actor: 'testuser',
    repo: {
      owner: 'test-owner',
      repo: 'test-repo'
    },
    payload: {
      repository: {
        html_url: 'https://github.com/test-owner/test-repo'
      }
    }
  };

  it('should generate success report when all checks pass', () => {
    const jobResults = {
      codeQuality: 'success',
      build: 'success'
    };

    const report = generateReport(mockContext, jobResults);

    assert.ok(report.includes('🚦 Quality Gate Report'));
    assert.ok(report.includes('✅ Passed'));
    assert.ok(report.includes('All Checks Passed!'));
    assert.ok(report.includes('ready to merge'));
    assert.ok(report.includes('abc1234'));
    assert.ok(report.includes('@testuser'));
  });

  it('should generate failure report when code quality fails', () => {
    const jobResults = {
      codeQuality: 'failure',
      build: 'success'
    };

    const report = generateReport(mockContext, jobResults);

    assert.ok(report.includes('Quality Gate Failed'));
    assert.ok(report.includes('Code quality errors'));
    assert.ok(report.includes('pnpm run lint'));
  });

  it('should generate failure report when build fails', () => {
    const jobResults = {
      codeQuality: 'success',
      build: 'failure'
    };

    const report = generateReport(mockContext, jobResults);

    assert.ok(report.includes('Quality Gate Failed'));
    assert.ok(report.includes('Build errors'));
    assert.ok(report.includes('pnpm run build'));
  });

  it('should generate failure report when both fail', () => {
    const jobResults = {
      codeQuality: 'failure',
      build: 'failure'
    };

    const report = generateReport(mockContext, jobResults);

    assert.ok(report.includes('Quality Gate Failed'));
    assert.ok(report.includes('Code quality errors'));
    assert.ok(report.includes('Build errors'));
  });

  it('should include workflow run link', () => {
    const jobResults = {
      codeQuality: 'success',
      build: 'success'
    };

    const report = generateReport(mockContext, jobResults);

    assert.ok(report.includes('/actions/runs/12345'));
  });

  it('should handle missing repository payload gracefully', () => {
    const contextWithoutPayload = {
      ...mockContext,
      payload: {}
    };

    const jobResults = {
      codeQuality: 'success',
      build: 'success'
    };

    const report = generateReport(contextWithoutPayload, jobResults);

    assert.ok(report.includes('https://github.com/test-owner/test-repo/actions/runs/12345'));
  });
});
