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
    for (let i = 0; i < 14; i++) { const e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.top = Math.random() * 100 + '%'; e.style.setProperty('--s', (6 + Math.random() * 10).toFixed(0) + 'px'); e.style.setProperty('--d', (3 + Math.random() * 4).toFixed(1) + 's'); e.style.setProperty('--dl', (-Math.random() * 6).toFixed(1) + 's'); tw.appendChild(e); }
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
      if (r.vaultSol != null && mStarted && mcache[mview]) { mgrid.dataset.sig = ''; mRender(mcache[mview].j); }
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

  /* ---------- 01 the story: the stage plays whichever move you are reading ---------- */
  const stage = $('#stage'), ssteps = $$('.sstep'), sCap = $('#stCap'), sStamp = $('#stStamp'), sWrap = $('.story-steps');
  const CAPS = ['01 · fees stack', '02 · cop a grail', '03 · relist higher', '04 · flip and burn'];
  const sList = $('#stList'); if (sList) sList.style.setProperty('--w', Math.min(96, Math.round(68 * (Number(C.markup) || 1.2))) + '%');
  let cur = 0;
  function setStep(i) {
    if (i === cur) return; cur = i; stage.dataset.s = i;
    ssteps.forEach((s, k) => s.classList.toggle('on', k === i));
    if (i === 1 || i === 3) sStamp.textContent = i === 3 ? 'SOLD' : 'BOUGHT';
    sCap.textContent = CAPS[i]; sCap.classList.remove('sw'); void sCap.offsetWidth; sCap.classList.add('sw');
  }
  function storyTick() {
    const sr = stage.getBoundingClientRect(), line = innerWidth <= 900 ? (Math.max(sr.bottom, 0) + innerHeight) / 2 : innerHeight / 2;
    let best = 0, bd = Infinity;
    ssteps.forEach((s, k) => { const b = s.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - line); if (d < bd) { bd = d; best = k; } });
    setStep(best);
    const wr = sWrap.getBoundingClientRect(); sWrap.style.setProperty('--sp', (Math.max(0, Math.min(1, (line - wr.top) / wr.height)) * 100).toFixed(1) + '%');
  }
  if (stage && ssteps.length) {
    ssteps[0].classList.add('on');
    let sraf = 0; const sq = () => { if (!sraf) sraf = requestAnimationFrame(() => { sraf = 0; storyTick(); }); };
    addEventListener('scroll', sq, { passive: true }); addEventListener('resize', sq); storyTick();
  }

  /* ---------- 02 the market: real graded Pokémon listings, through our own /api/market (Magic Eden underneath) ---------- */
  const mgrid = $('#mgrid'), mchip = $('#mktChip'), mtabs = $('#mktTabs'), mind = mtabs && mtabs.querySelector('.tab-ind');
  const mcache = {}; let mview = 'grails', mreq = 0, mAt = 0, mStarted = false;
  const solFmt = v => v >= 1000 ? Math.round(v).toLocaleString('en-US') : v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  const usd0 = v => v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'M' : v >= 1e5 ? '$' + Math.round(v / 1e3) + 'K' : v >= 1e4 ? '$' + (v / 1e3).toFixed(1) + 'K' : '$' + Math.round(v).toLocaleString('en-US');
  const trunc = (s, n) => (s = String(s || '')).length > n ? s.slice(0, n - 1).trim() + '…' : s;
  const thumb = (u, w) => 'https://wsrv.nl/?url=' + encodeURIComponent(u) + '&w=' + w + '&output=webp&q=80';
  const perView = () => innerWidth <= 1060 ? 8 : 12;
  const skeleton = n => Array.from({ length: n }, () => '<div class="mc sk shown"><div class="mimg"></div><div class="mbody"><i class="skl" style="width:84%"></i><i class="skl" style="width:52%"></i><i class="skl" style="width:40%;margin-top:auto"></i></div></div>').join('');
  function moveInd() { const b = mtabs && mtabs.querySelector('button.on'); if (!b || !mind) return; mind.style.width = b.offsetWidth + 'px'; mind.style.transform = `translateX(${b.offsetLeft}px)`; }
  function mCard(x, i) {
    const gl = [x.grader, x.grade].filter(Boolean).join(' ') || x.gradeLabel || '';
    const cop = C.vault && liveCache && liveCache.vaultSol != null && x.price <= liveCache.vaultSol;
    const meta = [x.year, x.gradeLabel].filter(Boolean).join(' · ') || 'graded, vaulted';
    return `<a class="mc" href="${esc(x.url)}" target="_blank" rel="noopener" style="--d:${(Math.min(i, 12) * .045).toFixed(3)}s" title="${esc(x.full || x.name)}">`
      + `<div class="mimg">${x.image ? `<img src="${esc(thumb(x.image, 400))}" data-o="${esc(x.image)}" alt="${esc(x.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '<span class="noimg">no photo</span>'}`
      + (gl ? `<span class="grade${Number(x.grade) === 10 ? ' g10' : ''}">${esc(gl)}</span>` : '') + (cop ? '<span class="mcop">vault can cop</span>' : '') + '</div>'
      + `<div class="mbody"><div class="mname">${esc(x.name || 'Graded card')}</div><div class="mmeta">${esc(meta)}</div>`
      + `<div class="mprice"><b>${solFmt(x.price)} SOL</b><span>${x.usd != null ? '≈ ' + usd0(x.usd) : ''}</span></div></div></a>`;
  }
  function mChip() { if (!mAt) return; const s = Math.max(0, Math.round((Date.now() - mAt) / 1000)); mchip.className = 'chip live'; mchip.innerHTML = `<i></i>live · ${s < 5 ? 'just now' : s < 90 ? s + 's ago' : Math.round(s / 60) + 'm ago'}`; }
  function mRender(j) {
    const items = j.items || [], sig = mview + ':' + items.map(x => x.mint + x.price).join(',');
    mAt = j.at || Date.now(); mChip();
    if (mgrid.dataset.sig === sig) return; mgrid.dataset.sig = sig;
    mgrid.classList.toggle('empty', !items.length);
    if (!items.length) { mgrid.innerHTML = '<div class="mempty"><p>Nothing on this shelf right now. Try another one.</p></div>'; return; }
    mgrid.innerHTML = items.map(mCard).join(''); mgrid.scrollLeft = 0;
    mgrid.querySelectorAll('img').forEach(im => { if (im.complete && im.naturalWidth) im.classList.add('ld'); });
    requestAnimationFrame(() => requestAnimationFrame(() => mgrid.querySelectorAll('.mc').forEach(m => m.classList.add('shown'))));
  }
  async function mFetch(v) {
    const c = mcache[v]; if (c && Date.now() - c.t < 55000) return c.j;
    const j = await getJ('/api/market?view=' + v, 12000); if (!j || !j.ok) throw new Error('bad');
    mcache[v] = { j, t: Date.now() }; return j;
  }
  async function loadMarket(v, quiet) {
    mview = v; const my = ++mreq;
    mtabs.querySelectorAll('button').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); }); moveInd();
    if (!quiet && !(mcache[v] && Date.now() - mcache[v].t < 55000)) { mgrid.dataset.sig = ''; mgrid.classList.remove('empty'); mgrid.innerHTML = skeleton(perView()); }
    try { const j = await mFetch(v); if (my === mreq) mRender(j); }
    catch {
      if (my !== mreq) return;
      if (mcache[v]) { mRender(mcache[v].j); return; }
      if (quiet && mgrid.dataset.sig) return;
      mchip.className = 'chip'; mchip.innerHTML = '<i></i>offline'; mgrid.dataset.sig = ''; mgrid.classList.add('empty');
      mgrid.innerHTML = '<div class="mempty"><p>The card market is not answering right now.</p><button class="btn ghost sm" type="button" data-retry>Try again</button></div>';
    }
  }
  if (mgrid && mtabs) {
    mgrid.innerHTML = skeleton(perView());
    mgrid.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.add('ld'); }, true);
    mgrid.addEventListener('error', e => { const im = e.target; if (im.tagName !== 'IMG') return; const o = im.dataset.o; if (o) { im.dataset.o = ''; im.src = o; } else { const n = document.createElement('span'); n.className = 'noimg'; n.textContent = 'no photo'; im.replaceWith(n); } }, true);
    mgrid.addEventListener('click', e => { if (e.target.closest('[data-retry]')) loadMarket(mview); });
    mtabs.addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (b && b.dataset.v !== mview) loadMarket(b.dataset.v); });
    mtabs.addEventListener('keydown', e => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; const bs = [...mtabs.querySelectorAll('button')], i = bs.findIndex(b => b.dataset.v === mview), n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length]; n.focus(); loadMarket(n.dataset.v); });
    addEventListener('resize', moveInd); if (document.fonts) document.fonts.ready.then(moveInd); moveInd();
    const mStart = () => { if (mStarted) return; mStarted = true; loadMarket('grails'); setTimeout(() => mFetch('tens').catch(() => {}), 2500); };
    if ('IntersectionObserver' in window) { const mo = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { mStart(); mo.disconnect(); } }, { rootMargin: '900px 0px' }); mo.observe($('#market')); } else mStart();
    setInterval(() => { if (!document.hidden && mStarted) mChip(); }, 5000);
    setInterval(() => { if (!document.hidden && mStarted) loadMarket(mview, true); }, 60000);
  }

  /* ---------- the tape: real listings between the strategy's moves ---------- */
  const tapeEl = $('#tape');
  tapeEl.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.remove(); }, true);
  setTimeout(async () => {
    try {
      const j = await mFetch('new'); const items = (j.items || []).slice(0, 12); if (items.length < 3) return;
      const cyc = steps.map((s, i) => `<span>${i === steps.length - 1 ? `<b>${esc(s)}</b>` : esc(s)}<i></i></span>`), out = [];
      items.forEach((x, k) => { out.push(`<span class="tl">${x.image ? `<img src="${esc(thumb(x.image, 60))}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}<em>listed</em>${esc(trunc(x.name, 30))}<b>${solFmt(x.price)} SOL</b><i></i></span>`); if (k % 3 === 2) out.push(cyc[(k / 3 | 0) % cyc.length]); });
      const lap = out.join(''); tapeEl.innerHTML = lap + lap;
      tapeEl.style.animationDuration = Math.max(40, tapeEl.scrollWidth / 2 / 50).toFixed(0) + 's';
    } catch {}
  }, 900);

  market(); vault();
  if (C.ca || C.vault) { setInterval(() => { if (!document.hidden) { market(); vault(); } }, 30000); setInterval(liveState, 1000); }
})();
