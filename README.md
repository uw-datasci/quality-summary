# Quality Summary

A reusable GitHub Action template for generating quality summaries.

## Usage

Add the following to your workflow file (e.g., `.github/workflows/quality.yml`):

```yaml
name: Quality Summary

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Quality Summary
        uses: uw-datasci/quality-summary@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          mode: 'summary'
```

## Inputs

| Input          | Description                                    | Required | Default     |
| -------------- | ---------------------------------------------- | -------- | ----------- |
| `github-token` | GitHub token for API access                    | Yes      | `github.token` |
| `mode`         | The mode of operation (summary, detailed)      | No       | `summary`   |

## Outputs

| Output   | Description                                |
| -------- | ------------------------------------------ |
| `result` | The result of the quality summary analysis |

## Development

### Prerequisites

- Node.js 20.x or later
- npm

### Setup

```bash
# Install dependencies
npm install

# Build the action
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

### Project Structure

```
.
├── action.yml       # Action metadata file
├── src/
│   └── index.js     # Main action logic
├── dist/            # Compiled action (generated)
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## License

MIT License - see [LICENSE](LICENSE) for details.