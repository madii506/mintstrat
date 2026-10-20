// MintStrat settings. Fill these in at launch; every live section switches on by itself.
window.MINT = {
  ca: '',            // the $MINTSTRAT token address (pump.fun)
  vault: '',         // the strategy wallet that buys, lists and burns (public)
  x: '',             // X handle without the @
  ticker: 'MINTSTRAT',
  markup: 1.2,       // each card is relisted at this multiple of what the vault paid
  burnPct: 100,      // share of every sale that buys back and burns $MINTSTRAT
  feePct: 100,       // share of creator fees that goes into the vault
};
