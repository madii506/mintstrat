// MintStrat: the page's motion (holo cards, twinkles, reveals, nav) and the live vault, read from public data only.
(function () {
  const C = window.MINT || {};
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const short = (a, n = 4) => a ? a.slice(0, n) + '…' + a.slice(-n) : '';
  const usd = v => v == null || !isFinite(v) ? '—' : v >= 1e9 ? '$' + (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'M' : v >= 1e4 ? '$' + (v / 1e3).toFixed(1) + 'K' : v >= 1 ? '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '$' + Number(v).toPrecision(3);
  const big = v => v == null || !isFinite(v) ? '—' : v >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1e4 ? (v / 1e3).toFixed(1) + 'K' : Math.round(v).toLocaleString('en-US');
  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2600); };
  const ticker = C.ticker || 'MINTSTRAT';

  /* ---------- the rules come from the config ---------- */
  $$('[data-cfg]').forEach(el => { const v = C[el.dataset.cfg]; if (v != null) el.textContent = v; });

  /* ---------- twinkles ---------- */
  const tw = $('#tw'); if (tw && !reduce) {
    for (let i = 0; i < 26; i++) { const e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.top = Math.random() * 100 + '%'; e.style.setProperty('--s', (6 + Math.random() * 10).toFixed(0) + 'px'); e.style.setProperty('--d', (3 + Math.random() * 4).toFixed(1) + 's'); e.style.setProperty('--dl', (-Math.random() * 6).toFixed(1) + 's'); tw.appendChild(e); }
  }

  /* ---------- the cycle tape ---------- */
  const steps = ['Fees in', 'Grail copped', `Relisted ${C.markup || 1.2}×`, 'Sold', `$${ticker} burned`];
  const lap = steps.map((s, i) => `<span>${i === steps.length - 1 ? `<b>${esc(s)}</b>` : esc(s)}<i></i></span>`).join('');
  $('#tape').innerHTML = lap.repeat(6);

  /* ---------- nav: scrolled state, section spy, phone menu ---------- */
  const nav = $('#nav'); const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10); addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const links = $$('#links a');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
    $$('section[id]').forEach(s => io.observe(s));
  }
  const menu = $('#menu'); menu.addEventListener('click', () => { const o = !nav.classList.contains('open'); nav.classList.toggle('open', o); menu.setAttribute('aria-expanded', String(o)); });
  $('#links').addEventListener('click', e => { if (e.target.closest('a')) nav.classList.remove('open'); });

  /* ---------- reveals ---------- */
  const rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io2.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(e => io2.observe(e));
    setTimeout(() => rv.forEach(e => e.classList.add('vis')), 5000);
  } else rv.forEach(e => e.classList.add('vis'));
  setTimeout(() => $$('.gp').forEach((g, i) => setTimeout(() => g.classList.add('show'), i * 220)), 700);

  /* ---------- holo cards: tilt toward the pointer, the foil and glare follow it; idle sway in the hero ---------- */
  const holos = $$('[data-tilt]');
  holos.forEach(h => {
    h.addEventListener('pointermove', e => {
      const r = h.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      h.classList.add('active'); h.style.setProperty('--ry', ((px - .5) * 26).toFixed(1) + 'deg'); h.style.setProperty('--rx', ((.5 - py) * 26).toFixed(1) + 'deg');
      h.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); h.style.setProperty('--my', (py * 100).toFixed(1) + '%'); h.style.setProperty('--o', '1');
    });
    h.addEventListener('pointerleave', () => { h.classList.remove('active'); h.style.setProperty('--rx', '0deg'); h.style.setProperty('--ry', '0deg'); h.style.setProperty('--o', '0'); });
  });
  if (!reduce) {
    let t0 = performance.now();
    const sway = t => {
      const k = (t - t0) / 1000;
      holos.forEach((h, i) => { if (h.classList.contains('active')) return; const a = k * .7 + i * 1.7;
        h.style.setProperty('--ry', (Math.sin(a) * 9).toFixed(2) + 'deg'); h.style.setProperty('--rx', (Math.cos(a * .8) * 5).toFixed(2) + 'deg');
        h.style.setProperty('--mx', (50 + Math.sin(a) * 40).toFixed(1) + '%'); h.style.setProperty('--my', (50 + Math.cos(a * .8) * 30).toFixed(1) + '%'); });
      if (!document.hidden) requestAnimationFrame(sway); else setTimeout(() => requestAnimationFrame(sway), 500);
    };
    requestAnimationFrame(sway);
  }
  // the step cards glow where the pointer is
  $$('.step').forEach(s => s.addEventListener('pointermove', e => { const r = s.getBoundingClientRect(); s.style.setProperty('--px', (e.clientX - r.left) + 'px'); s.style.setProperty('--py', (e.clientY - r.top) + 'px'); }));

  /* ---------- motion: reading progress, a soft glow that follows the pointer, hero parallax, rising sparkles,
     headings that rise word by word, magnetic buttons ---------- */
  const prog = $('#progress'), glow = $('#cglow'), art = $('#heroArt');
  let raf = 0; addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const h = document.documentElement.scrollHeight - innerHeight; prog.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h).toFixed(4) : 0})`; }); }, { passive: true });
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    let gx = innerWidth / 2, gy = innerHeight / 3, tx = gx, ty = gy;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (art) { const r = art.getBoundingClientRect(); const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight; art.style.setProperty('--px', (dx * -26).toFixed(1) + 'px'); art.style.setProperty('--py', (dy * -18).toFixed(1) + 'px'); } }, { passive: true });
    const follow = () => { gx += (tx - gx) * .08; gy += (ty - gy) * .08; glow.style.transform = `translate3d(${gx - 300}px, ${gy - 300}px, 0)`; requestAnimationFrame(follow); }; follow();
  } else if (glow) glow.remove();
  const rise = $('#rise'); if (rise && !reduce) for (let i = 0; i < 18; i++) { const e = document.createElement('i'); e.style.left = (20 + Math.random() * 60) + '%'; e.style.setProperty('--s', (4 + Math.random() * 7).toFixed(0) + 'px'); e.style.setProperty('--d', (4 + Math.random() * 5).toFixed(1) + 's'); e.style.setProperty('--dl', (-Math.random() * 8).toFixed(1) + 's'); e.style.setProperty('--x', ((Math.random() - .5) * 120).toFixed(0) + 'px'); rise.appendChild(e); }
  $$('h2').forEach(h => { const parts = []; h.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(w => parts.push(w.trim() ? `<span class="hw"><span>${esc(w)}</span></span>` : w)); else parts.push(`<b><span class="hw"><span>${esc(n.textContent)}</span></span></b>`); }); h.innerHTML = parts.join(''); h.querySelectorAll('.hw > span').forEach((s, i) => s.style.transitionDelay = (i * 60) + 'ms'); });
  $$('.btn.y, .btn.ghost').forEach(b => { if (!matchMedia('(pointer: fine)').matches) return; b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .18).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * .28).toFixed(1)}px)`; }); b.addEventListener('pointerleave', () => { b.style.transform = ''; }); });

  /* ---------- the binder: twelve slots, filled from the vault at launch ---------- */
  const pages = $('#pages');
  const emptySlots = (n = 12) => Array.from({ length: n }, (_, i) => `<div class="slot"><span>slot ${String(i + 1).padStart(2, '0')}</span></div>`).join('');
  pages.innerHTML = emptySlots();

  /* ---------- $MINTSTRAT: address and links only once they exist ---------- */
  const caBox = $('#caBox');
  if (C.ca) {
    caBox.innerHTML = `<div class="ca"><span class="mute">$${esc(ticker)}</span><code>${esc(C.ca)}</code><button class="btn y sm" type="button" id="copyCa">Copy</button></div>
      <div class="tlinks"><a class="btn ghost sm" href="https://pump.fun/coin/${esc(C.ca)}" target="_blank" rel="noopener">Buy on pump.fun ↗</a><a class="btn ghost sm" href="https://dexscreener.com/solana/${esc(C.ca)}" target="_blank" rel="noopener">Chart ↗</a>${C.x ? `<a class="btn ghost sm" href="https://x.com/${esc(C.x)}" target="_blank" rel="noopener">X ↗</a>` : ''}</div>`;
    $('#copyCa').onclick = async () => { try { await navigator.clipboard.writeText(C.ca); toast('Copied the $' + ticker + ' address.'); } catch { toast(C.ca); } };
    $('#navBuy').innerHTML = `<a class="btn y sm" href="https://pump.fun/coin/${esc(C.ca)}" target="_blank" rel="noopener">Buy $${esc(ticker)}</a>`;
  } else {
    caBox.innerHTML = `<div class="ca"><span class="mute">$${esc(ticker)}</span><code class="mute">The address goes up here and on X at launch.</code></div>${C.x ? `<div class="tlinks"><a class="btn ghost sm" href="https://x.com/${esc(C.x)}" target="_blank" rel="noopener">X ↗</a></div>` : ''}`;
  }

  /* ---------- live: Dexscreener for the market, Solana for the burn and the vault, Magic Eden for the cards ---------- */
  const getJ = async (u, ms = 9000) => { const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms); try { const r = await fetch(u, { signal: ctl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); } finally { clearTimeout(t); } };
  function countTo(el, to, fmt) {
    if (!el) return; const from = el._v || 0; el._v = to;
    if (reduce || !isFinite(to)) { el.textContent = fmt(to); return; }
    const t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  let lastOk = 0;
  function liveState() {
    const chip = $('#liveChip');
    if (lastOk) { chip.className = 'chip live'; chip.innerHTML = `<i></i>live · ${Math.round((Date.now() - lastOk) / 1000)}s ago`; }
  }
  let liveCache = null, liveAt = 0;
  async function liveApi() {
    if (liveCache && Date.now() - liveAt < 15000) return liveCache;
    const qs = new URLSearchParams(); if (C.ca) qs.set('ca', C.ca); if (C.vault) qs.set('vault', C.vault);
    liveCache = await getJ('/api/live?' + qs.toString()); liveAt = Date.now(); return liveCache;
  }
  async function market() {
    if (!C.ca) return;
    try {
      const j = await getJ('https://api.dexscreener.com/latest/dex/tokens/' + C.ca);
      const p = (j.pairs || []).filter(x => x.chainId === 'solana').sort((a, b) => ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0))[0];
      if (p) {
        countTo($('#sMcap'), Number(p.marketCap || p.fdv || 0), usd); countTo($('#sVol'), Number((p.volume && p.volume.h24) || 0), usd);
        $('#sPrice').textContent = p.priceUsd ? '$' + Number(p.priceUsd).toPrecision(3) : '—';
        const ch = p.priceChange && p.priceChange.h24; $('#sPriceD').textContent = ch != null ? `${ch >= 0 ? '+' : ''}${Number(ch).toFixed(1)}% in 24h` : '$' + ticker;
        $('#sMcapD').textContent = (p.dexId || 'chart') + ' · live'; lastOk = Date.now();
      } else { $('#sMcapD').textContent = 'no trading pair yet'; }
    } catch { $('#sMcapD').textContent = 'the chart is not answering, retrying'; }
    try {
      const r = await liveApi();
      if (r.burned != null) { countTo($('#sBurn'), r.burned, big); $('#sBurnD').textContent = `${(r.burned / 1e7).toFixed(2)}% of the supply, gone for good`; lastOk = Date.now(); }
      else $('#sBurnD').textContent = 'Solana is busy, retrying';
    } catch { $('#sBurnD').textContent = 'Solana is busy, retrying'; }
    liveState();
  }
  async function vault() {
    if (!C.vault) return;
    try {
      const r = await liveApi();
      if (r.vaultSol != null) { countTo($('#sVault'), r.vaultSol, v => v.toFixed(2) + ' SOL'); lastOk = Date.now(); } else $('#sVaultD').textContent = 'Solana is busy, retrying';
      if (r.cards) {
        const cards = r.cards; countTo($('#sCards'), cards.length, v => String(Math.round(v)));
        if (cards.length) {
          pages.innerHTML = cards.slice(0, 24).map(t => `<a class="slot full" href="https://solscan.io/token/${esc(t.mint)}" target="_blank" rel="noopener" title="${esc(t.name)}"><img src="${esc(t.image)}" alt="${esc(t.name)}" loading="lazy" referrerpolicy="no-referrer"><span class="nm">${esc(t.name)}</span></a>`).join('') + (cards.length < 12 ? emptySlots(12 - cards.length) : '');
          $('#binderNote').textContent = `${cards.length} card${cards.length === 1 ? '' : 's'} in the vault right now, read from the wallet.`;
        } else $('#binderNote').textContent = 'The vault holds no cards right now. The next grail lands here.';
      } else $('#sCardsD').textContent = 'the card index is not answering, retrying';
    } catch { $('#sVaultD').textContent = 'Solana is busy, retrying'; }
    liveState();
  }
  // receipts
  const rc = [];
  if (C.vault) rc.push(`<a href="https://solscan.io/account/${esc(C.vault)}" target="_blank" rel="noopener">Vault ${esc(short(C.vault))} ↗</a>`);
  if (C.ca) rc.push(`<a href="https://solscan.io/token/${esc(C.ca)}" target="_blank" rel="noopener">Token on Solscan ↗</a>`, `<a href="https://dexscreener.com/solana/${esc(C.ca)}" target="_blank" rel="noopener">Chart ↗</a>`);
  if (rc.length) { $('#receipts').innerHTML = rc.join(''); $('#liveLede').textContent = 'Read straight from Solana and the chart, every 30 seconds. Nothing here is typed in by hand.'; }
  if (C.vault) $('#binderLink').innerHTML = `<a href="https://solscan.io/account/${esc(C.vault)}" target="_blank" rel="noopener" style="color:var(--y);text-decoration:none">Open the vault ↗</a>`;
  market(); vault();
  if (C.ca || C.vault) { setInterval(() => { if (!document.hidden) { market(); vault(); } }, 30000); setInterval(liveState, 1000); }
})();
