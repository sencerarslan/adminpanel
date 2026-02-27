---
trigger: always_on
glob:
description: Git workflow, commit conventions, code quality, and PR rules
---

# Git & Code Quality Rules

## Commit Convention

All commits follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature or user-facing enhancement |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Tooling, config, dependency updates |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `perf` | Performance improvements |
| `style` | Formatting, whitespace (no logic change) |
| `ci` | CI/CD configuration |
| `revert` | Reverting a previous commit |

### Examples

```
feat(users): add bulk delete action to user table
fix(auth): prevent redirect loop on token refresh failure
refactor(data-table): extract column visibility into separate hook
chore: upgrade @tanstack/react-table to v8.20
```

- Scope is the affected domain or component (e.g. `auth`, `orders`, `sidebar`).
- Description is lowercase, imperative, no period at the end.
- Body explains *why*, not *what* (the diff shows what).

## Branching Strategy

```
main          — production-ready code; protected, no direct pushes
develop       — integration branch; PRs merge here
feature/*     — new features (branched from develop)
fix/*         — bug fixes (branched from develop or main for hotfixes)
chore/*       — tooling, config changes
release/*     — release preparation
```

## Pull Requests

- PRs are small and focused — one concern per PR.
- PR title follows Conventional Commits format.
- PR description includes:
  - **What**: summary of changes
  - **Why**: motivation / issue link
  - **How to test**: manual steps or automated test commands
  - **Screenshots**: required for UI changes
- At least one approval required before merge.
- CI must pass (lint, type-check, tests) before merge.
- Squash-merge preferred to keep `develop` history clean.

## Code Quality Gates

These checks run in CI and must all pass:

```bash
# Type checking
pnpm tsc --noEmit

# Linting (zero warnings policy)
pnpm eslint . --max-warnings 0

# Formatting check
pnpm prettier --check .

# Tests
pnpm test --run
```

## ESLint & Prettier Config

- **ESLint**: `eslint-config-next` + `@typescript-eslint/recommended-type-checked`.
- **Prettier**: 2-space indent, single quotes, trailing commas, 100-char print width.
- Pre-commit hook via `husky` + `lint-staged` enforces formatting and linting on staged files.

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

## What NOT to Commit

- `console.log`, `console.error`, `debugger` statements
- `.env` files (only `.env.example` is committed)
- Build artifacts (`/.next`, `/dist`, `/out`)
- Editor-specific config (`.vscode/settings.json` — only shared extensions file is OK)
- `eslint-disable` comments without an explanatory comment directly above
