# Phase 8 Migration Notes

## Runtime

Use Node.js 22:

```bash
nvm use
npm ci
```

## Quality Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run audit:production
npm run test:e2e
```

`npm run check` runs every non-browser quality gate. Playwright requires a built application and Chromium:

```bash
npx playwright install chromium
npm run test:e2e
```

## CI

GitHub Actions runs on pull requests and pushes to `main`. It uses Node.js 22, installs with `npm ci`, executes every quality gate, and retains Playwright reports after failures.

## Dependency Audit

The production dependency tree currently reports two moderate PostCSS advisories bundled through Next.js. Do not run the suggested forced automated fix because it would downgrade Next.js to an incompatible release. Monitor Next.js updates and upgrade when a compatible fix is available.

## Phase Boundary

The eight-phase production-readiness plan is complete. Remaining operational work is listed in `PROJECT_ANALYSIS.md`, `DEPLOYMENT.md`, and `SECURITY.md`.
