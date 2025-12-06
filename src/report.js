/**
 * Generate status emoji and text
 * @param {string} result - The job result
 * @returns {string} Status with emoji
 */
function getStatus(result) {
  return result === 'success' ? '✅ Passed' : '❌ Failed';
}

/**
 * Generate the quality gate report markdown
 * @param {object} context - GitHub context
 * @param {object} jobResults - Job results object
 * @param {string} jobResults.codeQuality - Code quality job result
 * @param {string} jobResults.build - Build job result
 * @returns {string} Markdown report
 */
function generateReport(context, jobResults) {
  const { codeQuality, build } = jobResults;

  // Both lint and typecheck are in the code-quality job, so they share the same result
  const lintStatus = getStatus(codeQuality);
  const typeCheckStatus = getStatus(codeQuality);
  const buildStatus = getStatus(build);

  const allPassed = codeQuality === 'success' && build === 'success';

  // Build the markdown report
  let comment = `# 🚦 Quality Gate Report\n\n`;

  // Results table
  comment += `## 📊 Check Results\n\n`;
  comment += `| Check | Status | Details |\n`;
  comment += `|-------|--------|----------|\n`;
  comment += `| 🔍 Linting | ${lintStatus} | ESLint code quality checks |\n`;
  comment += `| 🔒 Type Checking | ${typeCheckStatus} | TypeScript type safety |\n`;
  comment += `| 🏗️ Build | ${buildStatus} | Production build verification |\n\n`;

  // Overall status
  if (allPassed) {
    comment += `## ✅ All Checks Passed!\n\n`;
    comment += `Your code meets all quality standards and is ready to merge! 🎉\n\n`;
  } else {
    comment += `## ❌ Quality Gate Failed\n\n`;
    comment += `Some checks failed. Please review and fix:\n\n`;

    // Specific failure guidance
    if (codeQuality !== 'success') {
      comment += `- **Code quality errors**: Run \`pnpm run lint\` and \`pnpm run typecheck\` locally to see and fix issues\n`;
    }
    if (build !== 'success') {
      comment += `- **Build errors**: Run \`pnpm run build\` locally to reproduce\n`;
    }
    comment += `\n`;
  }

  // Run details
  comment += `---\n`;
  comment += `📝 **Run Details**\n`;
  comment += `- Commit: \`${context.sha.substring(0, 7)}\`\n`;

  // Handle case where payload.repository might be undefined in tests
  const repoUrl = context.payload?.repository?.html_url || `https://github.com/${context.repo.owner}/${context.repo.repo}`;
  comment += `- Workflow Run: [View Details](${repoUrl}/actions/runs/${context.runId})\n`;
  comment += `- Triggered by: @${context.actor}\n`;

  return comment;
}

module.exports = { generateReport, getStatus };
