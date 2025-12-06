const core = require('@actions/core');
const github = require('@actions/github');
const { generateReport } = require('./report');

async function run() {
  try {
    const context = github.context;

    // Don't run on non-PR events
    if (context.eventName !== 'pull_request') {
      core.info('Not a pull request event, skipping PR comment');
      return;
    }

    // Get inputs
    const token = core.getInput('github-token', { required: true });
    const codeQualityResult = core.getInput('code-quality-result', { required: true });
    const buildResult = core.getInput('build-result', { required: true });

    const octokit = github.getOctokit(token);

    const jobResults = {
      codeQuality: codeQualityResult,
      build: buildResult
    };

    // Generate the report comment
    const comment = generateReport(context, jobResults);

    // Find existing comment from bot
    const { data: comments } = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number
    });

    const botComment = comments.find(
      (c) => c.user.type === 'Bot' && c.body.includes('🚦 Quality Gate Report')
    );

    // Update existing comment or create new one
    if (botComment) {
      core.info(`Updating existing comment ID: ${botComment.id}`);
      await octokit.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: botComment.id,
        body: comment
      });
    } else {
      core.info('Creating new comment');
      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: comment
      });
    }

    core.info('✅ PR comment posted successfully');

    // Set output for whether all checks passed
    const allPassed = codeQualityResult === 'success' && buildResult === 'success';
    core.setOutput('all-passed', allPassed.toString());
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
