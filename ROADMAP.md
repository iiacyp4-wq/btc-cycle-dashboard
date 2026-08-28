# Roadmap — BTC Cycle Dashboard (living doc)

> **Cross-session memory anchor.** Paste this at the start of each Claude Code session.
> Update the status board and session log every session.
>
> **사용법(한글):** 새 세션 시작할 때 이 파일 전체를 붙여넣고 "이어서 하자"라고 하면 됩니다. 세션 끝날 때 Claude가 Status board와 Session log를 갱신합니다.

## Status board (update every session)
- **Current week:** W3 (Shadow) · **Repo:** https://github.com/iiacyp4-wq/btc-cycle-dashboard · **Live:** https://iiacyp4-wq.github.io/btc-cycle-dashboard/
- **Last done:** Hash Ribbon added (Capriole rule reproduced, ADR-005): collector, data, second card on the page, workflow step. Latest buy signal 2026-08-26.
- **Next step:** 7-day shadow for BOTH indicators (Z-MVRV vs bitcoin-data.com · Hash Ribbon vs TradingView Capriole script). Then W4 Live.
- **Blockers:** none.

## 10-week plan (goal per week · status)
| Week | Goal | Status |
|---|---|---|
| W1 | PRD · TRD · UI (3 variations, pick one) · ADR-001~004 · **verify free data source** | ✅ 2026-08-28 |
| W2 | Collector script · full-history backfill · page wired to real data | ✅ 2026-08-28 |
| W3 | Push to GitHub ✅ · Pages live ✅ · daily Action running ✅ · **Shadow**: compare with reference site 7 days ⬜ | 🔄 started 2026-08-28 |
| W4 | **Live**: stop visiting the paid site · start 30-day reliability count (PRD §8) | ⬜ |
| W5 | Tune sanity thresholds from real data · fix whatever broke in W3–W4 | ⬜ |
| W6 | Phase 2 #1: Hash Ribbon as a second `IndicatorSource` (repeat W2→W3 for it) | ✅ pulled forward 2026-08-28 (ADR-005); shadows alongside Z-MVRV |
| W7 | Phase 2 #2: spot-ETF net flow (decide US-only + weekend rule first) | ⬜ |
| W8 | Phase 2 #3: stablecoin market cap (decide which coins count first) | ⬜ |
| W9 | 30-day PRD §8 verdict · Phase 3 alert thresholds decided (not built) | ⬜ |
| W10 | Present · deploy · run · 60-day habit check scheduled | ⬜ |

## Documents (this project)
- PRD → `PRD-bitcoin-dashboard.md` (v2, Z-MVRV-only MVP)
- Design Doc → `Design-Doc-bitcoin-dashboard.md`
- UI → `UI-bitcoin-dashboard.md` (chosen: version2 dark terminal → `index.html`)
- Decisions → `ADR-001` … `ADR-005`
- Code → `scripts/collect.js` + `scripts/collect-hashribbon.js` (collectors) · `hashribbon-core.js` · `dashboard-core.js` (page logic) · `.github/workflows/daily.yml` (scheduler) · `data/zmvrv.csv` + `data/zmvrv.js` (history)

## Decisions log (one line each → link the ADR)
- **ADR-001** — Compute Z-MVRV from CoinMetrics Community (`CapMrktCurUSD` ÷ `CapMVRVCur` → realized cap); fallback bitcoin-data.com → $0, formula under our control; verified 2026-08-28 (mean diff −0.01 vs reference).
- **ADR-002** — Daily run on GitHub Actions cron, commits data to the same repo → nothing to keep alive; staleness detected from data age on the page.
- **ADR-003** — History is one CSV in the repo (+ a JS twin for the page) → readable by hand, diff-able, no DB.
- **ADR-004** — Single static HTML + own canvas chart, no framework/library; dark terminal style → hours not days, works from file:// too.
- **ADR-005** — Hash Ribbon = Capriole rule computed from CoinMetrics hash rate + price; validated against known buy signals → second indicator with zero new dependencies.
- *(inline, collect.js)* — Jump rule (±0.5/day) applies only to the newest 7 days; history before 2011-07-18 dropped (stdev meaningless with < 1 yr of data).

## Open questions
- Payment ceiling if a free source dies (PRD §9) — **now moot for MVP** (two free sources work), keep for Phase 2 indicators.
- Data-source terms of use for **public** re-display (blocks Phase 4, not MVP).
- Sanity thresholds: 0.5/day jump and [-1.5, 12] range are first guesses — revisit W5 with real runs.
- Zone labels (저평가 < 0 < 중립 < 3.5 < 과열 < 7 < 고점권) are display hints, not Phase 3 alert levels — decide those in W9.

## Session log (append, newest last)
- **2026-08-28** — Wrote PRD (grilled, narrowed 4 → 1 indicator), TRD with A/B trade-off tables, UI doc + 3 HTML variations (dark terminal chosen), ADR-001~004. W1 verify: `CapRealUSD` is paid-only, but `CapMVRVCur` is free → realized cap derived; Z matches bitcoin-data.com within ±0.03 typical. Built `scripts/collect.js` (idempotent, primary+fallback, sanity rules), workflow, backfilled 2011-07-18→2026-08-27. Page reads `data/zmvrv.js`; sample data only as fallback with a visible warning.
- **2026-08-28 (later)** — Created public repo `iiacyp4-wq/btc-cycle-dashboard`, pushed everything except the workflow (OAuth token lacks `workflow` scope), enabled Pages → live URL serves real data. Owner added `workflow` scope; workflow pushed and run once (success). Shadow started.
- **2026-08-28 (evening)** — Hash Ribbon (W6) pulled forward. Reference: TradingView Capriole script; rule reconstructed (30/60d hash-rate SMA, gray/green/blue circles, buy = recovery + price SMA10>SMA20) and validated by reproducing known signals. Data: CoinMetrics `HashRate`+`PriceUSD` free. New: `scripts/collect-hashribbon.js`, `data/hashribbon.*`, `hashribbon-core.js`, second card in `index.html`, ADR-005, workflow step.
