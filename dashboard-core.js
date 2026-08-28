/* dashboard-core.js — shared by all three UI versions.
   Data seam: getZMVRV() → [{date, value, status, source}]
   Real data comes from data/zmvrv.js (written daily by scripts/collect.js, loaded via <script>).
   If that file is absent (e.g. a fresh clone before the first run) we fall back to sample data
   and say so. Nothing else in the page knows or cares where the rows came from. */

function getZMVRV() {
  if (window.ZMVRV_ROWS && window.ZMVRV_ROWS.length) return window.ZMVRV_ROWS;
  window.ZMVRV_SAMPLE = true;
  return sampleZMVRV();
}

function sampleZMVRV() {
  // Deterministic pseudo-random so all three versions show identical data.
  let seed = 42;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const rows = [];
  const start = new Date(Date.UTC(2019, 0, 1));
  const end = new Date(Date.UTC(2026, 7, 27)); // "yesterday UTC" relative to 2026-08-28
  const days = Math.round((end - start) / 86400000);
  let v = 0.4;
  for (let i = 0; i <= days; i++) {
    const t = i / 365;
    // a slow 4-year-ish cycle plus a longer trend and noise
    const cycle = 3.2 * Math.sin((t - 0.9) * Math.PI / 2.1) + 2.2;
    v = v * 0.93 + cycle * 0.07 + (rnd() - 0.5) * 0.25;
    const d = new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10);
    let status = 'ok', source = 'coinmetrics';
    if (i % 400 === 137) status = 'missing';
    else if (i === days - 220) status = 'suspicious';
    if (i % 90 === 45) source = 'bitcoindata';
    rows.push({ date: d, value: status === 'missing' ? null : +v.toFixed(2), status, source });
  }
  return rows;
}

const ZONES = [
  { max: 0,   label: '저평가 구간', key: 'low' },
  { max: 3.5, label: '중립',        key: 'mid' },
  { max: 7,   label: '과열 주의',   key: 'hot' },
  { max: 99,  label: '역사적 고점권', key: 'top' },
];
function zoneOf(v) { return ZONES.find(z => v < z.max); }

function daysSince(dateStr, todayUTC) {
  return Math.round((todayUTC - new Date(dateStr + 'T00:00:00Z')) / 86400000);
}

/* Renders into elements with ids: banner, value, date, delta, zone, chart, tooltip, ranges, footer-src */
function renderDashboard(opts) {
  const colors = opts.colors; // {line, latest, suspicious, band:{low,mid,hot,top}, grid, text, muted}
  const rows = getZMVRV();
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const lastGood = [...rows].reverse().find(r => r.status !== 'missing');
  const prevGood = [...rows].reverse().find(r => r.status !== 'missing' && r.date < lastGood.date);
  const age = daysSince(lastGood.date, todayUTC);

  // banner
  const banner = document.getElementById('banner');
  banner.className = 'banner';
  if (lastGood.status === 'suspicious') {
    banner.textContent = '오늘 값이 평소와 많이 달라요 — 확인 필요'; banner.classList.add('warn');
  } else if (age >= 3) {
    banner.textContent = '데이터가 오래됐어요 · ' + lastGood.date + ' 이후 갱신 실패'; banner.classList.add('bad');
  } else if (age === 2) {
    banner.textContent = '아직 오늘 데이터가 없어요 · 마지막: ' + lastGood.date; banner.classList.add('stale');
  } else { banner.classList.add('hidden'); }

  // headline
  document.getElementById('value').textContent = lastGood.value.toFixed(2);
  document.getElementById('date').textContent = lastGood.date + ' UTC 기준';
  const diff = lastGood.value - prevGood.value;
  const deltaEl = document.getElementById('delta');
  deltaEl.textContent = (diff >= 0 ? '▲ ' : '▼ ') + Math.abs(diff).toFixed(2);
  deltaEl.className = 'delta ' + (diff >= 0 ? 'up' : 'down');
  const z = zoneOf(lastGood.value);
  const zoneEl = document.getElementById('zone');
  zoneEl.textContent = z.label; zoneEl.className = 'zone ' + z.key;
  document.getElementById('footer-src').textContent = (window.ZMVRV_SAMPLE ? '⚠ 샘플 데이터 (data/zmvrv.js 없음) · ' : '') + '출처: ' + lastGood.source + ' · 매일 자동 갱신 · 계산식: (시가총액 − 실현시총) ÷ 표준편차';

  // range toggle
  let range = 'ALL';
  try { range = localStorage.getItem('zmvrv-range') || '3Y'; } catch (e) { range = '3Y'; }
  const rangeBtns = document.querySelectorAll('#ranges button');
  const setRange = r => {
    range = r; try { localStorage.setItem('zmvrv-range', r); } catch (e) {}
    rangeBtns.forEach(b => b.classList.toggle('active', b.dataset.r === r));
    draw();
  };
  rangeBtns.forEach(b => b.onclick = () => setRange(b.dataset.r));

  // chart
  const canvas = document.getElementById('chart');
  const tip = document.getElementById('tooltip');
  let pts = [];
  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    const yrs = range === '1Y' ? 1 : range === '3Y' ? 3 : 99;
    const cutoff = new Date(todayUTC.getTime() - yrs * 365 * 86400000).toISOString().slice(0, 10);
    const data = rows.filter(r => r.date >= cutoff);
    const pad = { l: 36, r: 12, t: 10, b: 24 };
    const vals = data.filter(r => r.value != null).map(r => r.value);
    const yMin = Math.min(-1, Math.floor(Math.min(...vals)) - 0.5);
    const yMax = Math.max(4, Math.ceil(Math.max(...vals)) + 0.5);
    const x = i => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
    const y = v => pad.t + (1 - (v - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);
    ctx.clearRect(0, 0, W, H);
    // zone bands
    let lo = yMin;
    for (const zn of ZONES) {
      const hi = Math.min(zn.max, yMax);
      if (hi > lo) { ctx.fillStyle = colors.band[zn.key]; ctx.fillRect(pad.l, y(hi), W - pad.l - pad.r, y(lo) - y(hi)); }
      lo = hi; if (lo >= yMax) break;
    }
    // grid + y labels
    ctx.strokeStyle = colors.grid; ctx.fillStyle = colors.muted; ctx.font = '11px ' + opts.font; ctx.textAlign = 'right';
    for (let v = Math.ceil(yMin); v <= yMax; v++) {
      ctx.beginPath(); ctx.moveTo(pad.l, y(v)); ctx.lineTo(W - pad.r, y(v)); ctx.stroke();
      ctx.fillText(v, pad.l - 6, y(v) + 4);
    }
    // x labels (Jan of each year)
    ctx.textAlign = 'center';
    data.forEach((r, i) => { if (r.date.endsWith('-01-01') || (yrs === 1 && r.date.endsWith('-01'))) ctx.fillText(yrs === 1 ? r.date.slice(5, 7) + '월' : r.date.slice(0, 4), x(i), H - 6); });
    // line (gap on missing)
    ctx.strokeStyle = colors.line; ctx.lineWidth = 1.6; ctx.beginPath(); let pen = false;
    pts = [];
    data.forEach((r, i) => {
      if (r.value == null) { pen = false; return; }
      const px = x(i), py = y(r.value); pts.push({ px, py, r });
      if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
    });
    ctx.stroke();
    // suspicious points
    data.forEach((r, i) => { if (r.status === 'suspicious') { ctx.fillStyle = colors.suspicious; ctx.beginPath(); ctx.arc(x(i), y(r.value), 4, 0, 7); ctx.fill(); } });
    // latest point
    const li = data.length - 1 - [...data].reverse().findIndex(r => r.value != null);
    ctx.fillStyle = colors.latest; ctx.beginPath(); ctx.arc(x(li), y(data[li].value), 5, 0, 7); ctx.fill();
    ctx.strokeStyle = colors.latestRing; ctx.lineWidth = 2; ctx.stroke();
  }
  canvas.onmousemove = canvas.ontouchstart = e => {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    let best = null; for (const p of pts) if (!best || Math.abs(p.px - cx) < Math.abs(best.px - cx)) best = p;
    if (!best) return;
    tip.style.display = 'block';
    tip.innerHTML = best.r.date + ' · <b>' + best.r.value.toFixed(2) + '</b>' + (best.r.status === 'suspicious' ? ' <span class="susp">의심</span>' : '');
    tip.style.left = Math.min(best.px, canvas.clientWidth - 150) + 'px'; tip.style.top = (best.py - 36) + 'px';
  };
  canvas.onmouseleave = () => tip.style.display = 'none';
  window.addEventListener('resize', draw);
  setRange(range);
}
