# Kibra

An offline nursing revision app at https://practice-tests.maxeonyx.com. Home chooses one next question across Integrated Care A5 (29 October, 40%) and the Pharmacology final (2 November, 50%).

Attempt a written exam-style question, check the answer guide, and rate recall. An unknown answer opens visual prerequisite questions, then returns to the whole question. FSRS schedules reviews; assessment dates, weights and curriculum gaps guide allocation. Drafts, attempts and the current step stay in IndexedDB on the device.

Run `npm ci` and `npm run dev`. For production verification, run `npm run build`, `npx playwright install chromium`, and `npm test`. `npm run lint` checks formatting. GitHub Actions builds and tests before publishing pushes to `main`.

Read [REQUIREMENTS.md](REQUIREMENTS.md) before product work for Max’s original prompt, subsequent dictations, preferences, corrections and unresolved tensions. Read [DESIGN.md](DESIGN.md) when continuing the product discussion: it is a proposal awaiting Max’s review before redesign implementation. Read [CONTENT.md](CONTENT.md) before editing source-derived teaching, and [AGENTS.md](AGENTS.md) for implementation and deployment boundaries.
