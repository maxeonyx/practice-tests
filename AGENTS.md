# Practice Tests — AGENTS.md

## Project

Lightweight static practice test platform. Moodle-style test experience, deployed to GitHub Pages at `practice-tests.maxeonyx.com`.

## Stack

- Static site with a lightweight CDN-loaded framework (e.g., Vue, Preact) — no build step
- GitHub Pages deployment
- Cloudflare DNS for custom domain
- localStorage for all state

## Repo Structure

```
practice-tests/
  index.html          — landing page (list of available tests)
  test.html           — test-taking page (shared by all tests)
  results.html        — results/marking page
  css/                — styles
  js/                 — application logic
  tests/              — test content as JSON files
  REQUIREMENTS.md     — stakeholder stories & requirements
  AGENTS.md           — this file
```

## Commands

- No build step — open HTML files directly or serve with any static server
- Local preview: `python -m http.server 4173`
- Deploy: push to `main`, GitHub Pages serves automatically

## Test Content Format

Tests are JSON files in `tests/`. Each test file contains metadata and an array of questions. See REQUIREMENTS.md for the four question types.
Landing page metadata lives in `tests/index.json`, which maps test ids to JSON files.

## Key Decisions

- Lightweight CDN framework (Vue, Preact, etc.) — gives reactivity without a build step
- localStorage for persistence — no accounts, no server
- One question per page with navigation — matches Moodle UX
- Auto-mark everything except short answers
