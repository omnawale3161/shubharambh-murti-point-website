# Phase 7 Migration Notes

## Deployment

No database migration, dependency installation, or new environment variable is required.

Deploy the completed build normally to Vercel.

## Application Shell

The root layout now includes a keyboard skip link and a persistent `#main-content` target. Keep this target unique when changing the application shell.

Global styles now provide:

- Visible keyboard focus
- Reduced-motion behavior
- Mobile page-title sizing

Do not remove focus outlines from future controls unless an equally visible replacement is provided.

## Modal Behavior

Global product search now:

- Traps keyboard focus while open
- Closes with Escape or backdrop interaction
- Restores focus to the triggering Search button
- Prevents background scrolling
- Announces result-state changes

## Forms and Controls

New or changed fields should continue using explicit labels, stable names, suitable autocomplete values, and status announcements where results update without navigation.

Filter and toggle controls should expose selected state using native semantics or `aria-pressed`.

## Fallback Surfaces

`app/loading.tsx` provides a shared route-loading surface. `app/error.tsx` provides a recoverable error boundary with retry and collection-navigation actions.

## Verification

- Production build and Next.js integrated TypeScript validation passed.
- Source and rendered-HTML audits confirmed shared navigation, form, modal, status, and responsive safeguards.
- In-app browser visual verification was unavailable in this session.

## Phase Boundary

ESLint modernization, TypeScript configuration modernization, automated unit/E2E tests, and CI/CD remain deferred to Phase 8.
