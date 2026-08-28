# UI — BTC Cycle Dashboard (text mockup)

**Related:** `PRD-bitcoin-dashboard.md` v2 · `Design-Doc-bitcoin-dashboard.md` · **Last updated:** 2026-08-28
**Versions built:** `version1-classic.html` · `version2-dark-terminal.html` · `version3-editorial.html`
(same data, same behavior — only the look differs). **Chosen 2026-08-28: version2 dark terminal → `index.html`** (ADR-004).

## Screen: Dashboard (the only screen)
A single centered column, phone-friendly: status banner on top, the big "today" number,
the chart in the middle, a small footer with data provenance at the bottom.

- **Status banner** (top, full width): hidden when fresh. Yellow when the latest row is 2 days
  old (`"아직 오늘 데이터가 없어요 · 마지막: 2026-08-26"`), red when 3+ days
  (`"데이터가 오래됐어요 · 2026-08-25 이후 갱신 실패"`), orange when today's row is
  `suspicious` (`"오늘 값이 평소와 많이 달라요 — 확인 필요"`).
- **Headline** (below banner): title `"Z-MVRV"`, then the latest value very large
  (e.g. `2.41`), then the data date in small text (`"2026-08-27 UTC 기준"`), then the
  change vs. yesterday (`"▲ 0.08"` / `"▼ 0.12"`).
- **Zone label** (next to the value): plain-language reading of the number, fixed thresholds —
  `< 0` → `"저평가 구간"`, `0–3.5` → `"중립"`, `3.5–7` → `"과열 주의"`, `> 7` → `"역사적 고점권"`.
  Product-level hint only; not a recommendation (PRD §5).
- **Chart** (middle, ~60% of height): line of Z-MVRV over time. Horizontal reference bands
  at the zone thresholds (tinted). Latest point highlighted. `suspicious` points drawn in a
  different color; `missing` days leave a visible gap, not a line across.
- **Range toggle** (above chart, right): `1Y · 3Y · 전체` — default `3Y`. (Tiny, cheap; PRD
  lists it as Phase 2 "should", but it costs nothing in a static page — keep it.)
- **Footer** (bottom): `"출처: coinmetrics · 매일 자동 갱신 · 계산식: (시가총액 − 실현시총) ÷ 표준편차"`
  and a link to the raw CSV.
- **Empty / loading / error state**:
  - Loading: skeleton grey box where the chart goes, number shows `"—"`.
  - No data at all (first run): chart area says `"아직 데이터가 없어요 — 첫 수집을 기다리는 중"`.
  - CSV fetch failed: `"데이터 파일을 불러오지 못했어요"` + retry button `"다시 시도"`.

## Behavior
- Page opens → reads `data/zmvrv.csv` → renders in < 1 s. Nothing to click for the core job.
- Tap/hover a point on the chart → tooltip with date + value (+ `"의심"` badge if suspicious).
- Tap range toggle → chart rescales; choice remembered in the browser.
- Latest row is 2 days old → yellow banner; 3+ → red banner; row `suspicious` → orange banner.
  Banner never hides the number — the last good value stays visible with its date.
- Korea-morning case: the latest row is dated *yesterday* UTC → **no banner** (this is normal).
- Long history (10 yrs) → chart stays readable: thin line, no per-point markers except latest.

## Style
- Mobile-first, one column, max width ~720 px on desktop.
- Numbers in a tabular/mono-figure font so the big value doesn't jitter day to day.
- Zone colors: blue (undervalued) · grey (neutral) · amber (caution) · red (top zone).
  Same palette in all three versions; only the surrounding look changes.

## Prompt to give Claude Code
> "Build this as a single self-contained HTML file. [paste the sections above]. The data comes
> from one function `getZMVRV()` that returns `[{date, value, status, source}]` — return
> realistic sample data for now (the collector will replace it with a CSV fetch). All UI text in
> Korean exactly as quoted. Make 3 style variations: classic light, dark terminal, editorial."

## Screen: Dashboard — card 2, Hash Ribbons (added 2026-08-28, ADR-005)
Second card directly under Z-MVRV, same width. Mirrors the TradingView Capriole look.

- **Headline:** current phase in words — `"정상"` (30d > 60d) · `"항복 진행 중"` (gray) ·
  `"회복 중"` (green) · `"회복 완료 — 가격 모멘텀 대기"`. Sub-line with the two averages in EH/s
  or `"<date>부터 N일째 · 30일선이 60일선 아래"`.
- **Signal line:** `"마지막 매수 신호 2026-08-26 (2일 전)"` — highlighted blue when ≤ 30 days old.
- **Chart:** two lines (30d orange, 60d light grey); the gap between them filled red while in
  capitulation; a row of circles along the bottom exactly like the reference — gray (capitulation),
  green (recovering), blue (buy, larger, with a thin line up to the ribbon).
- **Legend** under the chart: `해시레이트 30일 · 60일 · 항복 · 회복 · 매수 신호`.
- **Range toggle** `1Y · 3Y · 전체` (remembered separately from the Z-MVRV one).
- **Tooltip:** date · 30d/60d EH/s · price · tag (`매수 신호` / `항복 시작` / `회복` / `항복 중`).
- **Empty state:** `"아직 데이터가 없어요 — 첫 수집을 기다리는 중"`.

## Behavior added 2026-08-28 (both charts)
- **Drag-to-zoom:** mouse-down and drag on a chart draws a translucent box; on release the chart
  zooms to that date span. X-axis labels switch from years → months → days as the span shrinks.
  Range buttons un-highlight while zoomed. **Double-click** the chart, or tap any range button,
  to reset. Touch drag works the same on phones. Hint text next to `"범위"`:
  `"드래그로 확대 · 더블클릭 원복"`.
- **Hash Ribbons card — BTC price overlay:** purple line = BTC price in USD on a **right-hand
  log axis** (`$1k … $100k`), so the ribbon/price relationship reads like the TradingView
  original even on the `전체` range. Legend entry: `"BTC 가격 USD (우측 축, 로그)"`.
