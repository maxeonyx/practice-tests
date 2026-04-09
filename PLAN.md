# Practice Tests — PLAN.md

## Current State (2026-04-09)

**Site is live at https://practice-tests.maxeonyx.com**

### What's done

- Vue 3 static site deployed via GitHub Pages + Cloudflare DNS (`practice-tests.maxeonyx.com`)
- GitHub Actions workflow auto-deploys on push to `main`
- Full Moodle-style test flow: landing → test (one question at a time) → review → submit → results
- All four question types: multiple choice, true/false, word matching (dropdowns), short answer
- Question map navigation (numbered jump buttons showing answered/in-progress/unanswered/flagged)
- Countdown timer with auto-submit on expiry
- Flag toggle per question
- localStorage persistence (answers, flags, timer, current question survive refresh)
- Weighted marks (MC: 1, T/F: 1, Matching: 2, Short Answer: 4)
- Auto-marking for MC/TF/matching with partial credit on matching; short answers shown for self-review with marking criteria
- Confirmation dialogs before destructive actions (reset/retake)
- Hardened localStorage handling (safe parse, stale data recovery)
- 72-question nursing bioscience test covering all 58 learning objectives across 4 topics
- Learning objective coverage audited — 2 gaps filled, ~23 weak areas strengthened with 12 additional questions

### Infrastructure

- Repo: https://github.com/maxeonyx/practice-tests
- Domain: practice-tests.maxeonyx.com (Cloudflare CNAME → maxeonyx.github.io, proxied)
- Cloudflare zone: b9f915ada0f11439554f96de87d6d625
- HTTPS: Cloudflare handles it (GitHub Pages cert may still be provisioning; `https_enforced` not yet set on GH Pages side)
- Deploy: push to `main` → GitHub Actions → GitHub Pages

### Browser testing done

Initial testing (2026-03-21):
- Landing page renders correctly, shows test card with metadata
- Question navigation map works (click number → jumps to question)
- All four question types render and accept input
- Flagging works and shows in map
- Timer counts down
- Auto-save message visible

Full flow testing (2026-04-09):
- Full submit → results flow ✅ — score, per-question breakdown, correct/incorrect/unanswered all display correctly
- Results page with marking criteria ✅ — short-answer cards show "What to include in your answer:" from sampleResponseGuide
- Retake flow ✅ — confirmation pattern works, clears state, fresh test with reset timer
- Timer expiry auto-submit ✅ — timer reaches 0:00, auto-submits, results show "submitted automatically" message
- Page refresh mid-test ✅ — answers, flags, timer, current question all restored from localStorage
- Mobile viewport (375×812) ✅ — all pages functional, no overflow or horizontal scroll
  - ~~UX issue: header pushed question below the fold~~ — fixed: compact mobile header deployed (header 184px, question visible at ~605px)

Accessibility audit + implementation (2026-04-09):
- Semantic HTML improvements ✅ — question map now uses a real `nav`; main/section regions are labelled consistently
- Question grouping semantics ✅ — multiple-choice and true/false questions now use `fieldset`/`legend`
- Dynamic focus management ✅ — focus moves to question, review, question map, and results headings during key transitions
- Status/error/live announcements ✅ — loading uses `role="status"`, errors use `role="alert"`, key UI transitions announce via live regions
- Control associations ✅ — question map toggle uses `aria-controls`; short-answer and matching helper text are associated to controls
- Visible focus styling ✅ — consistent `:focus-visible` treatment added for interactive controls and programmatically focused headings
- Skip links ✅ — all pages now expose a keyboard-accessible skip link to the main content without breaking initial heading focus
- Keyboard verification ✅ — full landing → test → review → submit → results → retake flow exercised locally after the accessibility changes

Partial answer status testing (2026-04-10):
- Matching question partial state ✅ — filling some but not all pairs shows "In progress" in map and review
- Matching question complete state ✅ — filling all pairs shows "Answered"
- MC/TF/short answer unaffected ✅ — still binary answered/unanswered
- Short answer whitespace handling ✅ — whitespace-only stays unanswered
- Summary counts ✅ — "X answered, Y need attention (N in progress, M unanswered)" when partial exists
- Persistence ✅ — statuses survive page refresh from localStorage
- Scoring unchanged ✅ — partial matching still gets partial credit on results

## Future Work

- **More tests** — the platform supports multiple tests via `tests/index.json`. Drop in new JSON files.
- **Question generation tooling** — currently questions are hand-authored as JSON. Could build a workflow from learning objectives → questions.
- ~~**HTTPS enforcement**~~ — done: `https_enforced` is enabled on GitHub Pages
- ~~**Favicon**~~ — done: SVG clipboard+checkmark icon, deployed
- ~~**Mobile header compactness**~~ — done: compact 3-column status strip on mobile, question visible without scrolling
- **Test content schema docs** — AGENTS.md has the schema but could be more detailed for non-technical test authors
- ~~**Dynamic document titles**~~ — done: test page shows "Q5/72 — Test Name", review mode shows "Review — Test Name", results page shows "Results — Test Name"
- **Accessibility follow-up** — improve timer accessibility and do a full screen reader pass (e.g. NVDA/VoiceOver)
- ~~**Print-friendly results**~~ — done: `@media print` styles hide navigation/chrome, show score summary and per-question breakdown cleanly
