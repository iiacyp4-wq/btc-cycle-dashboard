# PRD — BTC Cycle Dashboard (working title) · 비트코인 온체인 지표 한눈에 보기

**Status:** Draft (v2 — scope cut after grilling)  ·  **Owner:** <you> · **Reviewers:** <mentor> · **Last updated:** 2026-08-28

> **v2 change:** MVP narrowed from four indicators to **one — Z-MVRV**. Everything else moved to §5.
> Reason: Z-MVRV is the indicator I most want *and* the one most likely to be paywalled. If it can be
> shown reliably from free data once a day, the other three are the same job repeated. If it can't,
> the whole idea needs rethinking — better to learn that first.

---

## 1. Summary
A single page that shows **one chart — Bitcoin's Z-MVRV** — with today's value, refreshed
**once a day** from **free** data, so I can check the cycle in one click instead of visiting a
paid site. Personal tool for now; nothing in it blocks opening it up later.

## 2. Problem & Motivation  ← 문제 (5-box #1)
Z-MVRV is the one number I check to judge where the Bitcoin cycle is. Today it lives on paid
on-chain sites (tens of dollars a month) behind a login. The cost: I either pay for one number,
or skip checking — and the value of the indicator comes from watching it *consistently*.
Z-MVRV moves on a daily cadence, so a free, once-a-day, one-click view is enough.

**Honest note on cost:** free sources need upkeep when they break. I'm choosing to spend time
instead of money partly because I want to build this myself. That is a valid goal, and it is
written here so the "$0" criterion isn't mistaken for the only reason.

## 3. Users & Use Cases  ← 유저 (5-box #2)
- **Primary (and only) user:** me — an individual long-term Bitcoin investor. No accounts, no sharing.
- **Core use case:** once a day, open the page → see today's Z-MVRV and the last few years of
  history → close. Under 10 seconds.
- **Not the user:** anyone wanting intraday data, trade signals, or a multi-indicator view (yet).

## 4. Goals & Success Metrics  ← MVP (5-box #3)
- **G1 — Every morning I get today's Z-MVRV, with history, on one page, without visiting any
  other site and without a paid subscription.**
- **Guardrail (counter-metric):** **never show a wrong or stale number as if it were today's.**
  The chart always shows the date of its latest data point; a failed refresh is visibly flagged.

## 5. Non-Goals (defer) ★ most important  ← Non-Goals (5-box #5)
| Deferred | Phase | Why not now |
|---|---|---|
| Hash Ribbon chart | Phase 2 | Same job as Z-MVRV; add once the one-indicator pipeline is proven. |
| Spot-ETF daily net flow chart | Phase 2 | Same as above. Also needs a decision on scope (US-only?) and a weekend/holiday rule. |
| Stablecoin total market cap chart | Phase 2 | Same as above. Needs a definition (which coins count, de-pegged excluded?). |
| A combined "where are we in the cycle" verdict when indicators disagree | Phase 2 | Meaningless with one indicator; decide only when there are several. |
| Buy/sell-zone alerts (thresholds + notifications) | Phase 3 | Requires trusted charts first, plus agreed threshold levels. |
| Public service: accounts, sharing, pricing | Phase 4 | Personal-first. **Also blocked until data-source terms of use are checked** — redistributing free-tier data publicly may violate them. |
| Selectable time ranges, BTC price overlay, indicator explanations | Phase 2 | Nice-to-have on top of the core chart. |
| Event markers on charts (halvings, ETF launches) | Phase 2 | Helps reading Hash Ribbon especially; not needed for Z-MVRV alone. |
| More indicators (SOPR, Puell, funding rates), intraday/real-time refresh, trade recommendations, mobile app, backtesting | Out of scope | Different products or no decision value for a daily glance. |

## 6. Functional Requirements (MoSCoW)
- **Must:**
  - One chart: Z-MVRV over time (at least the last 3 years) with the **latest value** and the
    **date of that value** shown prominently.
  - Automatic refresh once a day, from a free source.
  - Visible "stale since <date>" state when refresh fails; keep the last good data.
  - Sanity check: if the new value differs from the previous day by an implausible amount,
    flag it as suspicious rather than plotting it silently (guardrail against a source
    changing its format).
- **Should / Could:** none in MVP — see §5.
- **Won't (now):** see §5.
- **Acceptance criteria:** when I open the page on any morning, the Z-MVRV chart appears with a
  latest-data date no older than yesterday (UTC), and the value matches the chosen reference
  source within rounding.
- Screen layout → UI doc · data pipeline → Design Doc · data-source choice and Z-MVRV
  reference definition → ADR.

## 7. UX & Edge Cases (product-level only)
- **Happy path:** open page → chart loads with today's value → glance → done.
- **Empty state (first run):** "No data yet — first refresh pending," not a blank box.
- **Source unavailable:** last good chart stays, marked "stale since <date>."
- **Source unavailable before any data exists:** explicit "source unreachable, no data" — never
  a blank chart that looks like zero.
- **Implausible jump:** value shown with a warning; previous value stays visible for comparison.
- **Time zone:** "today" means the source's UTC day. A morning check in Korea will normally
  show yesterday's UTC date — this is *not* stale and must not be flagged as such.

## 8. Success Criteria & Verification ★  ← 성공 기준 (5-box #4)
- **Reliability:** over **30 consecutive days**, the chart shows a data date of today/yesterday
  (UTC) on at least 28 days; any exception is visibly flagged, never silent.
- **Accuracy:** on 5 random days, the latest value matches the reference source (fixed in the
  ADR) within rounding.
- **Cost:** paid subscriptions for this = **$0**. If no free Z-MVRV source exists, the ceiling
  is **[decide: max $/month]** — see §9.
- **Habit (real test):** 60 days after launch I still open it — measured by a simple open
  counter on the page, no login needed.

## 9. Open Questions & Risks
- **★ Risk — no free Z-MVRV source (make-or-break):** decide in the ADR, before building:
  (a) a free source with acceptable delay, (b) compute it from public on-chain data, or
  (c) pay up to a set ceiling. **Open: what is that ceiling?** If none of (a)–(c) works, this
  PRD is invalid and the idea should be re-scoped around a different first indicator.
- **Open — reference definition:** Z-MVRV differs across sites (calculation window). Pick one
  reference and document it; accuracy checks are impossible without it.
- **Open — "implausible jump" threshold:** what daily change counts as suspicious? Set from the
  historical data once loaded.
- **Risk — free source silently breaks or changes format:** covered by the stale/suspicious
  states in §7, but upkeep time is a recurring cost (acknowledged in §2).
- **Open — data-source terms of use:** check now, even though public service is Phase 4; the
  answer may kill Phase 4 entirely and that's worth knowing early.
