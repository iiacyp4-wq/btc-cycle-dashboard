# ADR-004 — Page is a single static HTML + hand-drawn canvas chart (no framework, no chart library)

- **Status:** accepted _(2026-08-28)_ — style chosen: **version2 dark terminal** → `index.html`
- **Date:** 2026-08-28
- **Deciders:** owner (style pick), mentor
- **Context source:** `UI-bitcoin-dashboard.md` · `Design-Doc-bitcoin-dashboard.md` §6 D4 · `PRD-bitcoin-dashboard.md` §8 (< 10 s)
- **Related:** ADR-003 (page reads the CSV directly)

## Context
One screen, one chart, one user. The owner should be able to read the whole page top to bottom.
Three style variations were built on a shared `dashboard-core.js` (data seam `getZMVRV()` +
canvas chart) and the dark terminal version was chosen.

## Decision
`index.html` (dark terminal style) + `dashboard-core.js`, hosted on GitHub Pages. The chart is
drawn directly on a `<canvas>` — **no external chart library** and **no framework, no build step**.
The data seam stays one function: `getZMVRV()` currently returns sample data; the next step
replaces its body with a CSV fetch and nothing else changes.

## Options considered
- **Static HTML + own canvas chart — chosen** — already built and rendering; zero dependencies
  means nothing to load from a CDN, works offline from a file, no version to keep updated.
- **Static HTML + Chart.js / uPlot / Plotly** — rejected for now: adds a network dependency and
  a version to track for one line chart with zone bands, which we already draw in ~80 lines.
  Revisit if Phase 2 needs richer interaction (zoom, crosshair sync across 4 charts).
- **React / Next app** — rejected: days instead of hours, a build pipeline, and a skill cliff
  for the owner. Earns its keep only past ~6 interactive charts.

## Consequences
- **Positive:** first chart done in hours; page readable by the owner; loads in well under a
  second.
- **Negative:** our chart code is ours to maintain (tooltip, resize, gaps). Phase 2 means
  copying the chart block ×4 — acceptable up to a point; that point triggers a new ADR.
- **Reversible?** Yes — the data seam and CSV are library-agnostic; swapping the chart is
  local to the drawing function.
