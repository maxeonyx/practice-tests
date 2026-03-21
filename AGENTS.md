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

- No build step — serve the site over HTTP for local preview because the app fetches JSON files
- Local preview: `python -m http.server 4173`
- Deploy: push to `main`, GitHub Pages serves automatically

## Test Content Format

Tests are JSON files in `tests/`. Each test file contains metadata and an array of questions. See REQUIREMENTS.md for the four question types.
Landing page metadata lives in `tests/index.json`, which maps test ids to JSON files.

### Catalog entry schema (`tests/index.json`)

- `id` — unique test id string
- `title` — landing page title
- `description` — landing page summary
- `durationMinutes` — whole-number duration
- `questionCount` — whole-number count kept in sync with the test file
- `questionTypes` — display labels shown on the landing page
- `file` — path to the test JSON file

### Test file schema (`tests/<name>.json`)

- top-level fields: `id`, `title`, `description`, `durationMinutes`, `questions`
- every question needs `id`, `type`, and `prompt`
- every question needs a positive `marks` value; current weighting is 1 mark for `multiple-choice`, 1 for `true-false`, 2 for `matching`, and 4 for `short-answer`
- `multiple-choice`: add `options` array and `correctAnswer` matching one of the options
- `true-false`: add `correctAnswer` with `True` or `False`
- `matching`: add unique `options` plus `pairs`, where each pair has a unique `prompt` and an `answer` present in `options`
- `short-answer`: no `correctAnswer`; optional `sampleResponseGuide` can help future authors review expected responses

### Notes

- Matching answers are treated as one-to-one, so each correct answer should be unique within a question
- Keep placeholder or schema-reference tests out of `tests/index.json` so they are not shown to students

## Key Decisions

- Lightweight CDN framework (Vue, Preact, etc.) — gives reactivity without a build step
- localStorage for persistence — no accounts, no server
- One question per page with navigation — matches Moodle UX
- Auto-mark everything except short answers
