# ADR-003 — History stored as a CSV file in the repo (no database)

- **Status:** accepted _(2026-08-28)_
- **Date:** 2026-08-28
- **Deciders:** owner + mentor
- **Context source:** `Design-Doc-bitcoin-dashboard.md` §4 data model, §6 D3 · `PRD-bitcoin-dashboard.md` §7 (stale/suspicious states)
- **Related:** ADR-002 (scheduler commits the file), ADR-001

## Context
The data is ~1 row per day, forever: `date, value, status, source, note`. The page needs to read
all of it; nobody needs to query it. The owner is a non-developer who must be able to inspect and
fix a bad row by hand.

## Decision
One append-only file, `data/zmvrv.csv`, committed to the repo by the collector. The page fetches
it as a static file. Phase 2 indicators get their own files of the same shape.

## Options considered
- **CSV in repo — chosen** — human-readable, editable in Notepad, change history for free via
  git, zero infrastructure, < 100 KB for a decade.
- **SQLite file** — rejected: not readable by hand, no diff history, and there is nothing to
  query.
- **Hosted database (Supabase etc.)** — rejected: massive overkill for one writer and one
  reader; only justified if users ever *write* their own data (Phase 4+).

## Consequences
- **Positive:** "why does this day look weird?" is answered by opening the file or its history;
  the CSV doubles as the log (Design Doc §5 observability).
- **Negative:** no queries or joins — not needed. If the file is ever corrupted by a bad
  commit, git restore fixes it in seconds.
- **Reversible?** Yes — the page reads rows through one loader; swapping to a DB later changes
  the loader, not the chart.
