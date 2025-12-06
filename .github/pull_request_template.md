## PR Title Convention

**IMPORTANT:** Since PRs are squash merged, the PR Title becomes the commit message on main and determines the semantic version bump.

**For a Bug Fix:**

- Title your PR: `fix: handle null values in summary`
- Result: Automation creates v1.0.1 (Patch)

**For a New Feature:**

- Title your PR: `feat: add support for json output`
- Result: Automation creates v1.1.0 (Minor)

**For a Breaking Change:**

- Title your PR: `feat!: remove deprecated input field`
- Result: Automation creates v2.0.0 (Major)
