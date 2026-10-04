# Kibra revision

Static, local-first nursing revision for Kibra, deployed at https://practice-tests.maxeonyx.com through GitHub Pages on pushes to `main`.

## Development

Node 22, npm, TypeScript, Vite, idb, ts-fsrs, and vite-plugin-pwa. `npm ci` installs dependencies; `npm run dev` previews development; `npm run build` checks types and builds `dist`; `npm run check` checks types; `npm run lint` checks formatting; `npm test` exercises the production build in Chromium and checks pure scheduling/content logic. Install the browser with `npx playwright install chromium` before testing. CI builds and tests before deploying.

## Boundaries

- `src/content/curriculum.ts` and `data.json`: source-linked curriculum, assessments, concepts, questions and visual clusters. Keep IDs stable after publishing; remove content only with a saved-session/progress migration.
- `src/study/state.ts`: versioned preferences, attempts, FSRS cards and the resumable prerequisite stack.
- `src/study/scheduler.ts`: pure recall scheduling and curriculum allocation. Use actual FSRS through ts-fsrs; separate assisted practice from independent evidence.
- `src/persistence/database.ts`: IndexedDB `kira-revision`, version 2. Explicit store migrations preserve preferences and learner data; revision checks prevent stale tabs overwriting progress. A rating, review and resulting session transition commit atomically.
- `src/main.ts`: presentation, study transitions and Home/Courses hash navigation.
- `src/ui/visuals.ts` and `src/style.css`: meaningful SVG learning cues and responsive presentation, with no external fonts or runtime CDN dependencies.

Read [REQUIREMENTS.md](REQUIREMENTS.md) before product changes for Max’s vision and corrections, [DESIGN.md](DESIGN.md) for the learning loop, and [CONTENT.md](CONTENT.md) before authoring or reviewing medical content. Home presents one scheduler recommendation; the curriculum view displays learning evidence and scope. Answers are self-marked. Seeing an answer or returning immediately after help cannot establish independent recall.

## Deployment

Root public path matches the custom domain. `public/CNAME` must match root `CNAME`. Preserve the domain and Pages workflow. Service-worker updates wait for Reload; precached curriculum and assets provide offline study. Storage is origin-scoped, so keeping the domain retains progress. Browser data deletion removes local progress. Raw course captures, session metadata and private archives belong outside the repository and deployment.
