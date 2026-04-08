# Practice Tests — PLAN.md

## Current State (2026-03-21)

**Site is live at https://practice-tests.maxeonyx.com**

### What's done

- Vue 3 static site deployed via GitHub Pages + Cloudflare DNS (`practice-tests.maxeonyx.com`)
- GitHub Actions workflow auto-deploys on push to `main`
- Full Moodle-style test flow: landing → test (one question at a time) → review → submit → results
- All four question types: multiple choice, true/false, word matching (dropdowns), short answer
- Question map navigation (numbered jump buttons showing answered/unanswered/flagged)
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

- Landing page renders correctly, shows test card with metadata
- Question navigation map works (click number → jumps to question)
- All four question types render and accept input
- Flagging works and shows in map
- Timer counts down
- Auto-save message visible

### Browser testing NOT done (no CDP was available earlier)

- Full submit → results flow
- Results page with marking criteria display
- Retake flow
- Timer expiry auto-submit
- Mobile viewport
- Page refresh mid-test (localStorage recovery)

## Future Work

- **More tests** — the platform supports multiple tests via `tests/index.json`. Drop in new JSON files.
- **Question generation tooling** — currently questions are hand-authored as JSON. Could build a workflow from learning objectives → questions.
- ~~**HTTPS enforcement**~~ — done: `https_enforced` is enabled on GitHub Pages
- ~~**Favicon**~~ — done: SVG clipboard+checkmark icon, deployed
- **Test content schema docs** — AGENTS.md has the schema but could be more detailed for non-technical test authors
- **Accessibility audit** — keyboard navigation, screen reader testing
- **Print-friendly results** — students might want to print their results
