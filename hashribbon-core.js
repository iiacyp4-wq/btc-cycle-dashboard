/* hashribbon-core.js — renders the Hash Ribbon card (ADR-005).
   Data seam: window.HASHRIBBON_ROWS from data/hashribbon.js (written daily by scripts/collect-hashribbon.js).
   Element ids: hr-state, hr-sub, hr-signal, hr-chart, hr-tooltip, hr-ranges, hr-legend, hr-footer */

function renderHashRibbon(opts) {
  const c = opts.colors; // {hr30, hr60, capFill, gray, green, blue, grid, muted, price}
  const rows = window.HASHRIBBON_ROWS || [];
  const el = id => document.getElementById(id);
  if (!rows.length) { el('hr-state').textContent = '아직 데이터가 없어요 — 첫 수집을 기다리는 중'; return; }

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const good = rows.filter(r => r.status === 'ok');
  const last = good.at(-1);
  const lastBuy = [...good].reverse().find(r => r.cross === 'buy');
  const lastCap = [...good].reverse().find(r => r.cross === 'capitulation');
  const ago = d => Math.round((todayUTC - new Date(d + 'T00:00:00Z')) / 86400000);

  // headline
  const st = el('hr-state');
  if (last.phase === 'capitulation') {
    const days = lastCap ? ago(lastCap.date) - ago(last.date) + 1 : '?';
    st.textContent = last.marker === 'green' ? '회복 중' : '항복 진행 중';
    st.className = 'hr-state ' + (last.marker === 'green' ? 'green' : 'gray');
    el('hr-sub').textContent = `${lastCap ? lastCap.date + '부터 ' : ''}${days}일째 · 30일선이 60일선 아래`;
  } else if (last.phase === 'recovered') {
    st.textContent = '회복 완료 — 가격 모멘텀 대기'; st.className = 'hr-state green';
    el('hr-sub').textContent = '30일선이 60일선 위로 복귀 · 가격 10일선 > 20일선이면 매수 신호';
  } else {
    st.textContent = '정상'; st.className = 'hr-state normal';
    el('hr-sub').textContent = `30일선 ${last.hr30.toFixed(0)} EH/s > 60일선 ${last.hr60.toFixed(0)} EH/s`;
  }
  const sig = el('hr-signal');
  if (lastBuy) {
    const n = ago(lastBuy.date);
    sig.innerHTML = `<span class="dot blue"></span>마지막 매수 신호 <b>${lastBuy.date}</b> (${n === 0 ? '오늘' : n + '일 전'})`;
    sig.classList.toggle('fresh', n <= 30);
  } else sig.textContent = '';
  el('hr-footer').textContent = `출처: ${last.source} · 규칙: Capriole Hash Ribbons (30/60일 해시레이트 평균, 가격 10/20일 평균) · 마지막 데이터 ${last.date} UTC`;

  // range toggle (own key)
  let range = '3Y';
  try { range = localStorage.getItem('hr-range') || '3Y'; } catch (e) {}
  const btns = document.querySelectorAll('#hr-ranges button');
  const setRange = r => { range = r; try { localStorage.setItem('hr-range', r); } catch (e) {} btns.forEach(b => b.classList.toggle('active', b.dataset.r === r)); draw(); };
  btns.forEach(b => b.onclick = () => setRange(b.dataset.r));

  // chart
  const canvas = el('hr-chart'), tip = el('hr-tooltip');
  let pts = [];
  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    const yrs = range === '1Y' ? 1 : range === '3Y' ? 3 : 99;
    const cutoff = new Date(todayUTC.getTime() - yrs * 365 * 86400000).toISOString().slice(0, 10);
    const data = good.filter(r => r.date >= cutoff);
    const pad = { l: 44, r: 12, t: 10, b: 40 };
    const vals = data.flatMap(r => [r.hr30, r.hr60]);
    const yMin = Math.min(...vals) * 0.95, yMax = Math.max(...vals) * 1.03;
    const x = i => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
    const y = v => pad.t + (1 - (v - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);
    ctx.clearRect(0, 0, W, H);
    // capitulation fill between the two MAs
    ctx.fillStyle = c.capFill;
    for (let i = 1; i < data.length; i++) if (data[i].phase === 'capitulation') {
      ctx.beginPath(); ctx.moveTo(x(i - 1), y(data[i - 1].hr60)); ctx.lineTo(x(i), y(data[i].hr60));
      ctx.lineTo(x(i), y(data[i].hr30)); ctx.lineTo(x(i - 1), y(data[i - 1].hr30)); ctx.closePath(); ctx.fill();
    }
    // grid
    ctx.strokeStyle = c.grid; ctx.fillStyle = c.muted; ctx.font = '11px ' + opts.font; ctx.textAlign = 'right';
    const step = niceStep((yMax - yMin) / 4);
    for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) {
      ctx.beginPath(); ctx.moveTo(pad.l, y(v)); ctx.lineTo(W - pad.r, y(v)); ctx.stroke();
      ctx.fillText(v >= 1 ? v.toFixed(0) : v.toFixed(2), pad.l - 6, y(v) + 4);
    }
    ctx.textAlign = 'center';
    data.forEach((r, i) => { if (r.date.endsWith('-01-01') || (yrs === 1 && r.date.endsWith('-01'))) ctx.fillText(yrs === 1 ? r.date.slice(5, 7) + '월' : r.date.slice(0, 4), x(i), H - 22); });
    // lines
    const line = (key, color, w) => { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); data.forEach((r, i) => i ? ctx.lineTo(x(i), y(r[key])) : ctx.moveTo(x(i), y(r[key]))); ctx.stroke(); };
    line('hr60', c.hr60, 1.4); line('hr30', c.hr30, 1.8);
    // marker row (circles like TradingView)
    pts = [];
    const my = H - 8;
    data.forEach((r, i) => {
      pts.push({ px: x(i), r });
      if (!r.marker) return;
      const col = r.marker === 'blue' ? c.blue : r.marker === 'green' ? c.green : c.gray;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x(i), my, r.marker === 'blue' ? 4.5 : 2.5, 0, 7); ctx.fill();
      if (r.marker === 'blue') { ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x(i), my - 6); ctx.lineTo(x(i), y(r.hr30)); ctx.stroke(); }
    });
  }
  function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw))); const m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
  canvas.onmousemove = canvas.ontouchstart = e => {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    let best = null; for (const p of pts) if (!best || Math.abs(p.px - cx) < Math.abs(best.px - cx)) best = p;
    if (!best) return;
    const r = best.r;
    const tag = r.cross === 'buy' ? ' <b class="blue">매수 신호</b>' : r.cross === 'capitulation' ? ' <b class="gray">항복 시작</b>' : r.cross === 'recovery' ? ' <b class="green">회복</b>' : r.phase === 'capitulation' ? ' <span class="gray">항복 중</span>' : '';
    tip.style.display = 'block';
    tip.innerHTML = `${r.date} · 30d <b>${r.hr30.toFixed(0)}</b> / 60d ${r.hr60.toFixed(0)} EH/s · $${r.price.toLocaleString()}${tag}`;
    tip.style.left = Math.min(best.px, canvas.clientWidth - 260) + 'px'; tip.style.top = '6px';
  };
  canvas.onmouseleave = () => tip.style.display = 'none';
  window.addEventListener('resize', draw);
  setRange(range);
}
