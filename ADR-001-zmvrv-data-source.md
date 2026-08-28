# ADR-001 — Z-MVRV data source: compute from CoinMetrics Community, fallback bitcoin-data.com

- **Status:** accepted _(2026-08-28, after W1 verify — see Verdict)_
- **Date:** 2026-08-28
- **Deciders:** owner + mentor
- **Context source:** `PRD-bitcoin-dashboard.md` §4 (G1, guardrail), §8 ($0), §9 (make-or-break risk) · `Design-Doc-bitcoin-dashboard.md` §6 D1
- **Related:** ADR-002 (scheduler), ADR-003 (storage)

## Context
The whole product is one number, Z-MVRV, shown daily for free. The number is normally behind a
paywall. Paying defeats the PRD; depending on one small free site risks the guardrail ("never a
wrong number shown as today's"). All sources sit behind the `IndicatorSource` seam
(`getLatest() → {date, value, sourceName}`), so this decides the v0 backing, not a lock-in.

## Decision
**Primary:** fetch `CapMrktCurUSD` and `CapMVRVCur` (MVRV ratio) daily from the **CoinMetrics Community API**
(free), derive `Realized = Market ÷ MVRV`, and compute `Z = (Market − Realized) / stdev(Market, full history)` ourselves. (`CapRealUSD` itself turned out to be paid-only; the ratio is free and gives the same number.)
**Fallback:** the ready-made MVRV Z-score from **bitcoin-data.com**, used only when the primary
fails, and recorded as such in the `source` column.
**Gate:** if the W1 verify fails (realized cap not available free/daily), this ADR is superseded
and the PRD §9 payment-ceiling question is reopened before any code is written.

## Options considered
- **Compute from CoinMetrics Community — chosen** — reputable, versioned, stable API; the
  formula is ours and documented, so the accuracy check in PRD §8 has a fixed reference. Costs
  one extra day of work (stdev over history).
- **Ready-made Z from bitcoin-data.com** — kept as fallback, rejected as primary: a small
  site that can vanish or silently change its formula; we couldn't tell a real move from a
  formula change.
- **Pay Glassnode / CryptoQuant (~$30–40/mo)** — rejected: contradicts the PRD's reason to
  exist. Also, redistribution terms would block Phase 4.

## Consequences
- **Positive:** $0; independent of any single small site; the definition of the indicator
  is written down once and never drifts.
- **Negative:** our number may differ slightly (±0.1–0.2) from sites using a different stdev
  window — acceptable, and the reference site for accuracy checks must use the same formula.
  Fallback days may show a small step; mitigated by the `source` column and lighter plotting.
- **Reversible?** Yes, low blast radius — one file behind the seam. The page and CSV are unaware.

## Verdict
_W1 verify (do by hand before coding):_ fetch one day of `CapRealUSD` from the Community API,
compute Z on paper, compare with a reference site → **PASS** if within ±0.1 and the endpoint is
free at daily granularity.

**Result (2026-08-28): PASS.** `CapRealUSD` is *not* free (403), but `CapMVRVCur` is, and Market ÷ MVRV reproduces realized cap (1.065T vs bitcoin-data.com 1.067T). Full history 2010-07-18 → 2026-08-27 fetched in one call, 5,885 rows. Our Z vs bitcoin-data.com Z over the last 2 years: mean diff −0.012, latest day 0.90 vs 0.87 (within ±0.1). One-day max diff 0.34 — the free tier’s newest day is sometimes preliminary and revises the next day; the collector therefore re-fetches the last 7 days on every run.
