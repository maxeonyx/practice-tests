# Practice Tests — Requirements

## Overview

A lightweight, static practice test platform deployed to `practice-tests.maxeonyx.com` via GitHub Pages + Cloudflare DNS. No backend — all state lives in localStorage. The first test is a nursing exam prep for Monday.

## Stakeholder Stories

### Students (primary users)

- **As a nursing student, I want to take a timed practice test that feels like Moodle**, so I can prepare realistically for my exam.
- **As a student, I want to see one question at a time with a progress indicator**, so I can focus without feeling overwhelmed.
- **As a student, I want to flag questions and come back to them**, just like in Moodle, so I can skip hard ones and return later.
- **As a student, I want a visible countdown timer (90 minutes)**, so I can practice time management. When the timer expires, the test auto-submits.
- **As a student, I want my progress saved automatically**, so I don't lose work if I accidentally close the tab or my browser crashes.
- **As a student, I want automatic marking at the end** for multiple choice, true/false, and word matching questions, with a total score.
- **As a student, I want short answer questions shown with my response but not auto-marked**, so I can self-assess those separately.
- **As a student, I want to be able to retake the test**, resetting my previous answers.

### Test Creator (Max)

- **As the test creator, I want to add new tests easily** by adding content files — the platform should support multiple tests over time.
- **As the test creator, I want to supply learning objectives and have questions generated from them**, covering all four question types.

### Developer/Maintainer

- **As a developer, I want the site to be fully static** — no server, no database, no build step beyond what GitHub Pages provides (or a simple static site generator).
- **As a developer, I want the deployment to be automatic on push to main** via GitHub Pages.

## Question Types

1. **Multiple choice** — one correct answer from 4-5 options
2. **True/False** — statement with true or false
3. **Word matching** — match items from set A to set B (drag or dropdown)
4. **Short answer** — free text response, shown at results but not auto-marked

## Test Experience

- Landing page shows available tests
- Each test has a title, description, and estimated duration
- Starting a test begins the countdown timer
- One question per page, with:
  - Progress bar or indicator (e.g., "Question 5 of 40")
  - Flag toggle button
  - Previous/Next navigation
- A review page before submission showing all questions, flagged status, and answered status
- Submit button on the review page
- Auto-submit when timer expires
- Results page showing:
  - Total score for auto-marked questions (X / Y)
  - Per-question breakdown: correct/incorrect/not-answered
  - Short answer responses displayed for self-review
  - Option to retake

## Technical

- Static site — a lightweight frontend framework (e.g., Vue, Preact) pulled from a CDN is fine and probably a good idea for managing the question/navigation/timer state, but no build step required
- All test state in localStorage (current answers, flags, timer remaining)
- GitHub Pages deployment from `main` branch (or `gh-pages`)
- Custom domain: `practice-tests.maxeonyx.com` via Cloudflare DNS
- Tests defined as JSON or similar data files — easy to add new ones
- Mobile-friendly (students may use phones)
