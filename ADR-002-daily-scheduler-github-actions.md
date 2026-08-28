# ADR-002 — Daily collector runs on GitHub Actions (scheduled workflow)

- **Status:** accepted _(2026-08-28)_
- **Date:** 2026-08-28
- **Deciders:** owner + mentor
- **Context source:** `PRD-bitcoin-dashboard.md` §6 (auto refresh once/day), §8 ($0) · `Design-Doc-bitcoin-dashboard.md` §3, §5 failure mode, §6 D2
- **Related:** ADR-001 (data source), ADR-003 (storage)

## Context
Something must wake up once a day, run the collector, and put the result where the page can read
it — with no money and no server to babysit. The one failure the system cannot log about itself
is "the scheduler never fired", so whatever we pick, the page must detect staleness from data age
rather than from a "last run" flag.

## Decision
Run the collector as a **GitHub Actions scheduled workflow** (cron, once per UTC day after the
on-chain day closes) in the **same public repo** that hosts the page via GitHub Pages. The
workflow commits the updated CSV back to the repo.

## Options considered
- **GitHub Actions schedule — chosen** — $0 on a public repo; run history visible per day;
  collector, data and page live in one repo; output "lands" by committing.
- **Small always-on server / Raspberry Pi** — rejected: $5/mo or a device to keep alive,
  updates, power, uptime — the highest ops burden for a once-a-day job.
- **Serverless cron (Cloudflare Workers / Vercel)** — rejected for now: also free, but needs a
  separate storage + publish step and vendor-specific config. Reasonable fallback if Actions
  ever becomes unworkable.

## Consequences
- **Positive:** nothing to keep alive; every run is visible (green/red); rerunning is one click
  and safe because the collector is idempotent.
- **Negative:** scheduled runs can fire late (minutes to hours) — irrelevant for a daily glance.
  Actions on repos with no commits for 60 days get auto-disabled — the daily commit keeps it
  alive. The repo must be public for $0, so **no secrets in the repo**, only in Actions secrets.
- **Reversible?** Yes — the collector is a plain script; moving it to any other cron means
  changing where it runs, not what it does.

## Verdict
_W3 shadow bar:_ 7 consecutive daily runs, each producing exactly one new row. **Result:** _pending_.
