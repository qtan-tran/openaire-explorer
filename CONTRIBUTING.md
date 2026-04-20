# Contributing to OpenAIRE Explorer

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Code of Conduct

By participating in this project you agree to abide by our [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please report unacceptable behaviour to the project maintainers.

---

## Development Setup

### Prerequisites

- Node.js ≥ 20 — check with `node --version`
- npm ≥ 10 — check with `npm --version`

### 1. Fork and clone

```bash
git clone https://github.com/your-org/openaire-explorer.git
cd openaire-explorer
```

### 2. Install dependencies

```bash
npm install           # installs all workspace packages
```

### 3. Configure environment

```bash
cp packages/server/.env.example packages/server/.env
# Edit packages/server/.env — defaults work for local development
```

### 4. Start the dev servers

```bash
npm run dev
# Client → http://localhost:5173
# API    → http://localhost:3001
```

Changes to either package hot-reload automatically.

---

## Branch Naming

| Prefix | Use for |
|--------|---------|
| `feature/` | New capabilities |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code changes with no behaviour change |
| `chore/` | Tooling, dependencies, CI |

Examples: `feature/export-csv`, `fix/network-graph-overflow`, `docs/api-examples`

---

## Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

**Types**: `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore`

**Scopes**: `client` · `server` · `shared` · `ci` · `deps`

Examples:
```
feat(client): add CSV export for comparison results
fix(server): handle empty cursor in stream-fetcher
docs: update API.md with /metrics/trends params
chore(deps): upgrade Vite to 5.3
```

---

## Submitting a Pull Request

1. Create a branch from `main` using the naming convention above.
2. Make your changes with tests where appropriate.
3. Run the full check suite locally (see below).
4. Push and open a PR against `main`.
5. Fill in the PR template — all sections are required.
6. A maintainer will review within 3 business days.

**One concern per PR.** Split unrelated changes into separate PRs.

---

## Running Tests

```bash
# All packages
npm test

# Single package
npm test --workspace=packages/client
npm test --workspace=packages/server

# With coverage
npm run test:coverage

# Watch mode (development)
npm test --workspace=packages/server -- --watch
```

Tests live in `src/__tests__/` within each package. Vitest is the test runner for both client and server.

---

## Code Style

- **TypeScript strict mode** is enabled across all packages — no `any`, no implicit `any`.
- **Prettier** handles formatting with default settings. Run `npm run format` before committing.
- **ESLint** enforces lint rules. Run `npm run lint` to check.
- Imports are organised: external packages first, then internal `@/` aliases, then relative paths.
- Avoid barrel re-exports that create circular dependencies.

---

## Architecture Decision Records

Significant architectural decisions are documented in `docs/adr/`. Before making a major change (new dependency, different data-fetching strategy, routing changes), check whether an ADR already covers the area. If your change warrants a record, add one using the template at `docs/adr/0000-template.md`.

---

## Pre-PR Checklist

```bash
npm run lint         # no lint errors
npm run typecheck    # no type errors
npm test             # all tests pass
npm run build        # both packages build cleanly
```
