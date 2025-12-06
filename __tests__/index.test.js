const { analyzeQuality } = require('../src/index');

// Mock @actions/core
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn()
}));

// Mock @actions/github
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: {
    repo: { owner: 'test-owner', repo: 'test-repo' },
    eventName: 'push'
  }
}));

describe('analyzeQuality', () => {
  const mockOctokit = {};
  const mockContext = {
    repo: { owner: 'test-owner', repo: 'test-repo' }
  };

  test('should return summary mode result', async () => {
    const result = await analyzeQuality(mockOctokit, mockContext, 'summary');

    expect(result.repository).toBe('test-owner/test-repo');
    expect(result.mode).toBe('summary');
    expect(result.status).toBe('success');
    expect(result.summary.message).toBe('Quality summary generated successfully');
  });

  test('should return detailed mode result', async () => {
    const result = await analyzeQuality(mockOctokit, mockContext, 'detailed');

    expect(result.repository).toBe('test-owner/test-repo');
    expect(result.mode).toBe('detailed');
    expect(result.status).toBe('success');
    expect(result.summary.message).toBe('Detailed quality report generated');
    expect(result.summary.metrics).toBeDefined();
  });

  test('should include timestamp in result', async () => {
    const result = await analyzeQuality(mockOctokit, mockContext, 'summary');

    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp)).toBeInstanceOf(Date);
  });
});
