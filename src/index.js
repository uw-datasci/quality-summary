import { info, getInput, setOutput, setFailed } from "@actions/core";
import { context as _context, getOctokit } from "@actions/github";
import { generateReport } from "./report";

async function run() {
  try {
    const context = _context;

    // Don't run on non-PR events
    if (context.eventName !== "pull_request") {
      info("Not a pull request event, skipping PR comment");
      return;
    }

    // Get inputs
    const token = getInput("github-token", { required: true });
    const codeQualityResult = getInput("code-quality-result", {
      required: true,
    });
    const buildResult = getInput("build-result", { required: true });

    const octokit = getOctokit(token);

    const jobResults = {
      codeQuality: codeQualityResult,
      build: buildResult,
    };

    // Generate the report comment
    const comment = generateReport(context, jobResults);

    // Find existing comment from bot
    const { data: comments } = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
    });

    const botComment = comments.find(
      (c) => c.user.type === "Bot" && c.body.includes("🚦 Quality Gate Report")
    );

    // Update existing comment or create new one
    if (botComment) {
      info(`Updating existing comment ID: ${botComment.id}`);
      await octokit.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: botComment.id,
        body: comment,
      });
    } else {
      info("Creating new comment");
      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: comment,
      });
    }

    info("✅ PR comment posted successfully");

    // Set output for whether all checks passed
    const allPassed =
      codeQualityResult === "success" && buildResult === "success";
    setOutput("all-passed", allPassed.toString());

    // Fail the action if quality gate didn't pass
    if (!allPassed) setFailed("Quality gate failed: not all checks passed");
  } catch (error) {
    setFailed(`Action failed: ${error.message}`);
  }
}

await run();
