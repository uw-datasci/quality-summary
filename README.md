# Quality Gate Summary

A GitHub Action that generates and posts a markdown report to PRs showing the results of quality checks (linting, type checking, and build).

## Features

- 📊 Posts a clean markdown summary table to PRs
- 🔄 Updates existing comments to avoid spam
- ✅ Shows clear pass/fail status for each check
- 📝 Provides actionable guidance when checks fail
- 🎨 Clean, professional formatting with emojis

## Usage

Add this action to your workflow after your quality check jobs:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: pnpm install
      - name: Lint
        run: pnpm run lint
      - name: Type check
        run: pnpm run typecheck

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: pnpm install
      - name: Build
        run: pnpm run build

  quality-summary:
    name: Quality Gate Summary
    runs-on: ubuntu-latest
    needs: [code-quality, build]
    if: always()
    permissions:
      pull-requests: write
      contents: read

    steps:
      - name: Post Quality Gate Summary
        uses: uw-datasci/quality-summary@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          code-quality-result: ${{ needs.code-quality.result }}
          build-result: ${{ needs.build.result }}

      - name: Check quality gate status
        run: |
          if [ "${{ needs.code-quality.result }}" == "success" ] && \
             [ "${{ needs.build.result }}" == "success" ]; then
            exit 0
          else
            exit 1
          fi
```

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `github-token` | GitHub token for API access | Yes |
| `code-quality-result` | Result of code quality job (success/failure/cancelled/skipped) | Yes |
| `build-result` | Result of build job (success/failure/cancelled/skipped) | Yes |

## Outputs

| Output | Description |
|--------|-------------|
| `all-passed` | Whether all quality checks passed (`true`/`false`) |

## Example Output

### When All Checks Pass

![All checks passed](https://img.shields.io/badge/Quality%20Gate-Passed-success)

The action posts a comment showing:
- ✅ Linting passed
- ✅ Type checking passed
- ✅ Build passed
- A congratulatory message indicating the code is ready to merge

### When Checks Fail

![Quality gate failed](https://img.shields.io/badge/Quality%20Gate-Failed-critical)

The action posts a comment showing:
- Status for each check (passed/failed)
- Specific guidance on how to fix failures locally
- Link to the workflow run for detailed logs

## Development

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

### Setup

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the action
pnpm run build
```

### Project Structure

```
├── action.yml          # Action metadata
├── src/
│   ├── index.js        # Main entry point
│   ├── report.js       # Report generation logic
│   └── report.test.js  # Tests
├── dist/               # Bundled action (generated)
└── package.json
```

## License

MIT