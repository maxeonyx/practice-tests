# Recall

An offline nursing revision app at https://practice-tests.maxeonyx.com. A time choice opens one question from Integrated Care A5 (29 October,40%) or the Pharmacology final (2 November,50%).

Answer mentally. “I know” reveals the answer and difficulty controls. “I don’t know” steps into supporting questions, then returns to the original; a standalone fact reveals its answer and Next. Learning images ground the content, with a separate wordless prerequisite cue. The scheduler balances exam preparation and spaced recall. Progress stays on the device, with quick reopening at the saved step and fresh starts after a new day or three hours away.

The feed includes 740 focused cards and 180 larger exam questions, with multiple choice, true/false, diagram recall and scaffolded written answers. Short sessions use manageable cards; longer sessions can include full answers after supporting concepts are recalled. Curriculum accuracy and scope review continues; [CONTENT.md](CONTENT.md) records the assessment evidence and remaining gaps.

The review link, https://practice-tests.maxeonyx.com/?review=1, uses separate practice progress.

Installed copies check for updates when opened or brought back to the foreground. Saved progress survives automatic updates, and written-answer drafting delays the reload until that stage finishes. Offline study uses the downloaded version until a connection is available.

The interaction trial at https://practice-tests.maxeonyx.com/examples.html contains one exemplar each of an ordinary flashcard, multiple choice, true/false, diagram recall and a scaffolded open answer. It stores its position and written draft in session storage, independently of learner progress. Read [DESIGN.md](DESIGN.md) for the trial’s readiness rule and self-marking limits.

Run `npm ci` and `npm run dev`. For production verification, run `npm run build`, `npx playwright install chromium`, and `npm test`. `npm run lint` checks formatting. GitHub Actions builds and tests before publishing pushes to `main`.

Read [REQUIREMENTS.md](REQUIREMENTS.md) before product work for Max’s original prompt, subsequent dictations, preferences, corrections and unresolved tensions. Read [DESIGN.md](DESIGN.md) for the product model guiding prototype feedback, and [PLAN.md](PLAN.md) before delivery work for the review loops, completion criteria and deadline. Read [CONTENT.md](CONTENT.md) before editing source-derived teaching, and [AGENTS.md](AGENTS.md) for implementation and deployment boundaries.
