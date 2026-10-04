# Kira revision

Static, local-first nursing revision for Kira, deployed at https://practice-tests.maxeonyx.com through GitHub Pages on pushes to `main`.

## Development

Node 22, npm, TypeScript, Vite, idb, and vite-plugin-pwa. `npm ci` installs dependencies; `npm run dev` previews development; `npm run build` checks types and builds `dist`; `npm run check` checks types; `npm run lint` checks formatting; `npm test` exercises the production build in Chromium. Install the browser with `npx playwright install chromium` before testing. CI builds and tests before deploying.

## Boundaries

- `src/content/curriculum.ts`: source-linked curriculum types and the two course identities.
- `src/study/state.ts`: attempts, review state, and versioned learner preferences. Scheduling is a future implementation.
- `src/persistence/database.ts`: IndexedDB database `kira-revision`, version 1. Add explicit upgrade migrations when changing stores; preserve learner data.
- `src/main.ts`: presentation and hash navigation between Home and Courses.
- `src/style.css`: responsive presentation; no external fonts or runtime CDN dependencies.

Read [REQUIREMENTS.md](REQUIREMENTS.md) before product or content work for the user's full vision and subsequent corrections. Home presents the scheduler's recommendation; the course overview is separate. Course content, dates, marks, and readiness require supplied source material.

## Deployment

Root public path matches the custom domain. `public/CNAME` is copied into the built artifact and must match root `CNAME`. Preserve the domain and Pages workflow. Service-worker updates wait for the learner to select Reload; precached assets provide the offline shell. Storage is origin-scoped, so keeping the domain is essential to retaining progress. Browser data deletion removes local progress.
