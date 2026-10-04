# Recall

An offline nursing revision app at https://practice-tests.maxeonyx.com. A time choice opens one question from Integrated Care A5 (29 October,40%) or the Pharmacology final (2 November,50%).

Answer mentally. “I know it” reveals the answer and difficulty controls. “I don’t know it” steps into supporting questions, then returns to the original; a standalone fact reveals its answer and Next. Learning images ground the content, with a separate wordless prerequisite cue. The scheduler balances exam preparation and spaced recall. Progress stays on the device, with quick reopening at the saved step and fresh starts after a new day or three hours away.

The review link, https://practice-tests.maxeonyx.com/?review=1, uses separate practice progress.

Run `npm ci` and `npm run dev`. For production verification, run `npm run build`, `npx playwright install chromium`, and `npm test`. `npm run lint` checks formatting. GitHub Actions builds and tests before publishing pushes to `main`.

Read [REQUIREMENTS.md](REQUIREMENTS.md) before product work for Max’s original prompt, subsequent dictations, preferences, corrections and unresolved tensions. Read [DESIGN.md](DESIGN.md) for the product model guiding prototype feedback, and [PLAN.md](PLAN.md) before delivery work for the review loops, completion criteria and deadline. Read [CONTENT.md](CONTENT.md) before editing source-derived teaching, and [AGENTS.md](AGENTS.md) for implementation and deployment boundaries.
