# ADR-005 — Hash Ribbon: Capriole rule, computed from CoinMetrics hash rate + price

- **Status:** accepted _(2026-08-28)_
- **Date:** 2026-08-28
- **Deciders:** owner (chose the TradingView reference) + mentor
- **Context source:** `PRD-bitcoin-dashboard.md` §5 (Phase 2 #1) · `ROADMAP.md` W6 · reference: TradingView "Hash Ribbons" by capriole_charles (`kr.tradingview.com/script/kT7jIvqv-Hash-Ribbons/`)
- **Related:** ADR-001 (same data source), ADR-003 (same storage shape)

## Context
Second indicator, added early because the Z-MVRV pipeline is live and waiting in shadow. The
owner wants it to look and behave like the Capriole TradingView script — the de-facto standard.
That script's Pine source is not visible on the page, so the rule was reconstructed from its
published description and **validated by reproducing its known historical buy signals**.

## Decision
Implement the Capriole rule exactly as described, recomputed from full history daily:
- `hr30` / `hr60` = 30- and 60-day simple moving averages of network hash rate.
- **Capitulation** starts when `hr30` crosses under `hr60` → gray circles while under and falling.
- **Recovering** = still under, but `hr30` rising day-over-day → green circles.
- **Recovery** = `hr30` crosses back over `hr60` → last green circle.
- **Buy** = first day after recovery where price `SMA10 > SMA20` → blue circle. One per cycle.

**Data:** CoinMetrics Community `HashRate` + `PriceUSD` (free, daily, 2010→). Fallback:
blockchain.com `hash-rate` + `market-price` charts. Output: `data/hashribbon.csv` + `.js`, same
shape as Z-MVRV (date · values · phase · marker · cross · status · source).

## Options considered
- **Reconstruct Capriole rule, compute ourselves — chosen** — free, same source as Z-MVRV (no new
  dependency), and the reproduction test passed: our buy signals match the script's well-known
  ones (2019-01, 2019-12, 2020-04, 2020-07, 2020-12, 2021-08, 2022-08, 2023-01, 2024-07 …).
- **Embed the TradingView widget** — rejected: needs a TradingView account for that indicator,
  no data ownership, breaks the "one CSV per indicator" shape, and can't drive our alerts later.
- **Use a site's ready-made "hash ribbon" signal** — rejected: none free and stable; and the
  rule is simple enough that owning it is cheaper than depending on someone.

## Consequences
- **Positive:** zero extra cost; owner can read the rule in 8 lines; signals reproducible; Phase 3
  alerts can key off the `cross` column directly.
- **Negative:** daily hash rate is noisy, so short whipsaw capitulations (2–3 days) occur — the
  original script has the same property. We don't smooth beyond what Capriole does, to stay
  faithful. Recomputing full history each run may *retroactively* change a marker if the source
  revises a recent hash-rate value; acceptable (same happens on TradingView).
- **Reversible?** Yes — one collector file and one render function; nothing else knows about it.

## Verdict
_Reproduction test, 2026-08-28:_ 28 buy signals since 2011; all Capriole-published signals since
2019 reproduced within ±2 days. **PASS.** Latest signal: **2026-08-26 (blue)**, current phase: normal.
