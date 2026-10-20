// GET /api/market?view=grails|tens|new — real listings of graded Pokémon cards on Solana: Collector Crypt's vaulted,
// tokenized cards as listed on Magic Eden. This is the market the vault buys from. Cached 60s per view.
const ME = 'https://api-mainnet.magiceden.dev/v2/collections/collector_crypt/listings';
const SOL = 'So11111111111111111111111111111111111111112';
const POKE = [{ traitType: 'Category', value: 'Pokemon' }];
const TENS = ['GEM-MT 10', 'GEM MINT 10', 'PRISTINE 10', 'Pristine 10', 'Gem Mint 10', '10-PRISTINE', 'PERFECT 10', 'Perfect 10'].map(value => ({ traitType: 'The Grade', value }));
const VIEWS = {
  grails: { attrs: [POKE], sort: 'listPrice', dir: 'desc', extra: '&max_price=5000' },
  tens: { attrs: [POKE, TENS], sort: 'listPrice', dir: 'asc', extra: '&min_price=0.2' },
  new: { attrs: [POKE], sort: 'updatedAt', dir: 'desc', extra: '' },
};
const cache = new Map(); let solUsd = { v: null, at: 0 };
async function getJson(url, ms = 9000) { const r = await fetch(url, { signal: AbortSignal.timeout(ms), headers: { accept: 'application/json' } }); if (!r.ok) throw new Error('http ' + r.status); return r.json(); }
async function solPrice() {
  if (solUsd.v && Date.now() - solUsd.at < 120000) return solUsd.v;
  try { const j = await getJson('https://lite-api.jup.ag/price/v3?ids=' + SOL, 5000); const p = j && j[SOL] && Number(j[SOL].usdPrice); if (p) solUsd = { v: p, at: Date.now() }; } catch {}
  return solUsd.v;
}
function clean(name) {
  return String(name || '').replace(/^\d{4}\s+/, '').replace(/^#\S+\s+/, '').replace(/\b(PSA|CGC|BGS|SGC|TAG|ACE)\s*\d+(\.\d)?\b/gi, '')
    .replace(/\b(Pokemon|Pokémon|Game)\b\s*$/i, '').replace(/\s+-\s*$/, '').replace(/\s{2,}/g, ' ').trim().slice(0, 80);
}
module.exports = async (req, res) => {
  const view = new URL(req.url, 'http://x').searchParams.get('view') || 'grails';
  const send = (code, body, cc) => { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', cc || 'no-store'); res.end(JSON.stringify(body)); };
  const V = VIEWS[view]; if (!V) return send(400, { ok: false, msg: 'Unknown view.' });
  const c = cache.get(view); if (c && Date.now() - c.at < 60000) return send(200, c.v, 'public, max-age=0, s-maxage=60');
  try {
    const url = `${ME}?offset=0&limit=40&attributes=${encodeURIComponent(JSON.stringify(V.attrs))}&sort=${V.sort}&sort_direction=${V.dir}${V.extra}`;
    const [list, usd] = await Promise.all([getJson(url), solPrice()]);
    const seen = new Set(); const items = [];
    for (const x of Array.isArray(list) ? list : []) {
      const t = x.token || {}; if (!t.mintAddress || seen.has(t.mintAddress) || !(x.price > 0)) continue; seen.add(t.mintAddress);
      const a = Object.fromEntries((t.attributes || []).map(k => [k.trait_type, k.value]));
      const gradeStr = String(a['The Grade'] || ''); const num = (gradeStr.match(/(\d+(?:\.\d)?)\s*$/) || gradeStr.match(/(\d+(?:\.\d)?)/) || [])[1] || null;
      items.push({ mint: t.mintAddress, name: clean(t.name), full: t.name, image: t.image || (x.extra && x.extra.img) || null, price: x.price, usd: usd ? x.price * usd : null,
        grader: a['Grading Company'] || null, grade: num, gradeLabel: gradeStr || null, year: a.Year || null, insured: a['Insured Value'] ? Number(a['Insured Value']) : null,
        url: `https://magiceden.io/item-details/${t.mintAddress}` });
      if (items.length >= 18) break;
    }
    const v = { ok: true, view, at: Date.now(), solUsd: usd, items };
    cache.set(view, { v, at: Date.now() }); send(200, v, 'public, max-age=0, s-maxage=60');
  } catch (e) { if (c) return send(200, c.v, 'public, max-age=0, s-maxage=30'); send(502, { ok: false, msg: 'The card market is not answering right now.' }); }
};
