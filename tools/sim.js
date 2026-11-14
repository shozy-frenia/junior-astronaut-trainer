'use strict';
// usage: node tools/sim.js index.html data.js [mode]
// Loads the engine out of index.html (between ENGINE markers) and runs it with deep-frozen states.
const fs = require('fs'), vm = require('vm');
const [htmlPath, dataPath, mode = 'all'] = process.argv.slice(2);
const html = fs.readFileSync(htmlPath, 'utf8');
const m = /\/\* ENGINE:START \*\/([\s\S]*?)\/\* ENGINE:END \*\//.exec(html);
if (!m) { throw new Error('engine markers not found'); }
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(dataPath, 'utf8'), ctx);
vm.runInContext(m[1] + '\nthis.createEngine = createEngine;', ctx);
const D = ctx.OUTPOST_DATA, E = ctx.createEngine(D);

function deepFreeze(o) { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(deepFreeze); } return o; }
const fz = deepFreeze;
function mulberry(a) { return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function check(s, where) {
  const T = E.TUNING;
  for (const k of ['ls', 'power', 'shield', 'stars', 'harvests', 'totalDose']) {
    if (!Number.isFinite(s[k])) { throw new Error(where + ': ' + k + ' is ' + s[k]); }
  }
  if (s.ls < 0 || s.ls > T.max.ls || s.power < 0 || s.power > T.max.power || s.shield < 0 || s.shield > T.max.shield) { throw new Error(where + ': bar out of range ' + JSON.stringify([s.ls, s.power, s.shield])); }
  if (s.sol < 1 || s.sol > T.sols) { throw new Error(where + ': bad sol ' + s.sol); }
}

// policy(state, rng) -> card id among legal ones
function playGame(seed, policy, maxSols, verbose, opts) {
  const rng = mulberry(seed ^ 0x9e3779b9);
  let s = fz(E.newGame(seed, opts)); check(s, 'new');
  let sols = 0;
  while (s.phase !== 'won' && s.phase !== 'lost' && sols < maxSols) {
    s = fz(E.startPlan(s)); check(s, 'plan');
    const rep = E.report(s);
    if (E.cardViews(s).length !== 3) { throw new Error('hand size ' + E.cardViews(s).length + ' on sol ' + s.sol); }
    let guard = 0;
    while (s.phase === 'plan') {
      if (++guard > 5) { throw new Error('plan loop stuck'); }
      const legal = s.hand.filter(id => E.canPlay(s, id).ok);
      if (!legal.length) { throw new Error('no legal card in plan phase, sol ' + s.sol + ' hand ' + s.hand); }
      s = fz(E.playCard(s, policy(s, legal, rng))); check(s, 'play');
    }
    if (s.phase !== 'sunsetReady') { throw new Error('expected sunsetReady got ' + s.phase); }
    const picks = s.picks.join('+'), solN = s.sol, date = s.schedule[solN - 1].date;
    s = fz(E.endSol(s)); check(s, 'sunset');
    sols++;
    if (verbose) {
      console.log(`sol ${String(solN).padStart(2)} ${date} | ${rep.map(r => r.kind).join(',').padEnd(18)} | ${picks.padEnd(16)} | LS ${String(s.ls).padStart(3)} PW ${String(s.power).padStart(3)} SH ${String(s.shield).padStart(5)} | stars ${s.stars} harv ${s.harvests}`);
    }
  }
  return s;
}

const randomPolicy = (s, legal, rng) => legal[Math.floor(rng() * legal.length)];

// greedy bot: one-step lookahead on a weighted score, only used to gauge whether the tuned numbers are winnable
function greedy(s, legal) {
  let best = null, bestScore = -1e9;
  for (const id of legal) {
    const n = E.playCard(s, id);
    const need = Math.max(0, E.TUNING.goals.harvests - n.harvests) * 1 + Math.max(0, E.TUNING.goals.stars - n.stars) * 1;
    const left = E.TUNING.sols - s.sol;
    const score = Math.min(n.ls, 60) * 1.0 + Math.min(n.power, 60) * 0.8 + n.shield * 1.5 + n.stars * 8 + n.harvests * 6 + (need > 0 && left < 8 ? 0 : 0)
      + (n.roofBuilt ? 10 : 0) - (n.ls < 25 ? (25 - n.ls) * 2 : 0) - (n.power < 20 ? (20 - n.power) * 2 : 0);
    if (score > bestScore) { bestScore = score; best = id; }
  }
  return best;
}

const SHIELD_CARDS = ['wall', 'roof', 'shelter'];
// greedy, but never plays a shielding card unless nothing else is legal
function noShield(s, legal) {
  const other = legal.filter(id => SHIELD_CARDS.indexOf(id) < 0);
  return greedy(s, other.length ? other : legal);
}
// greedy, but always takes Storm shelter on storm days and builds the roof as soon as it can
function shieldFirst(s, legal) {
  if (legal.indexOf('shelter') >= 0) { return 'shelter'; }
  if (legal.indexOf('roof') >= 0 && s.power >= 35) { return 'roof'; }
  return greedy(s, legal);
}

function batch(name, policy, n) {
  const res = { won: 0, lostBars: {}, goals: 0, sols: 0 };
  let storms = 0;
  for (let i = 1; i <= n; i++) {
    const s = playGame(1000 + i, policy, 60, false);
    if (s.phase === 'won') { res.won++; }
    else if (s.result.reasons[0] === 'goals') { res.goals++; }
    else { const k = s.result.reasons.join('+'); res.lostBars[k] = (res.lostBars[k] || 0) + 1; }
    res.sols += s.history.length; storms += s.stormsHit;
  }
  console.log(name, 'games', n, '| won', res.won, '| survived but goals missed', res.goals, '| lost by', JSON.stringify(res.lostBars), '| avg sols', (res.sols / n).toFixed(1), '| avg storms', (storms / n).toFixed(2));
}

if (mode === 'ten' || mode === 'all') {
  let reached = 0, shown = 0, tried = 0;
  for (let seed = 1; seed <= 200; seed++) {                       // random choices; show the first seed that lasts 10 sols
    const quiet = playGame(seed, randomPolicy, 10, false);
    tried++; if (quiet.phase === 'morning' || quiet.phase === 'plan') { reached++; if (!shown) { shown = seed; } }
  }
  console.log(`random play: ${reached}/${tried} seeds were still alive after 10 sols. Showing seed ${shown}:`);
  const s = playGame(shown, randomPolicy, 10, true);
  console.log('after 10 sols: phase', s.phase, 'sol', s.sol, 'window', s.windowStart);
  console.log('--- seed 7 (ends early: random play ran out of power) ---');
  playGame(7, randomPolicy, 10, true);
}
if (mode === 'all') {
  console.log('--- data self-check ---');
  console.log('validate() problems:', D.validate().length);
  // schedule stats across every possible window
  const first = D.meta.window.start;
  const addD = (iso, n) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
  const stormHist = {}, causes = { sep: 0, cme: 0, flare: 0 }; let conj = 0, n = 0;
  for (let off = 0; off <= 365 - 30; off++) {
    const s = E.newGame(5, { windowStart: addD(first, off) }); n++;
    const st = s.schedule.filter(e => e.storm); stormHist[st.length] = (stormHist[st.length] || 0) + 1;
    st.forEach(e => causes[e.storm.cause]++); if (s.schedule.some(e => e.conjunction)) { conj++; }
  }
  console.log('storms per run over all', n, 'windows:', JSON.stringify(stormHist), 'causes', JSON.stringify(causes), '| windows with conjunction', conj);
  console.log('--- many full games (invariants checked, states frozen) ---');
  batch('random', randomPolicy, 400);
  batch('greedy', greedy, 400);
  batch('noShield', noShield, 400);
  batch('shieldFirst', shieldFirst, 400);
  // how often Storm shelter is in the hand on a storm day
  let stormDays = 0, dealt = 0;
  for (let seed = 1; seed <= 400; seed++) {
    let s = E.newGame(seed);
    while (s.phase !== 'won' && s.phase !== 'lost') {
      s = E.startPlan(s);
      if (s.schedule[s.sol - 1].storm) { stormDays++; if (s.hand.indexOf('shelter') >= 0) { dealt++; } }
      while (s.phase === 'plan') { s = E.playCard(s, greedy(s, s.hand.filter(id => E.canPlay(s, id).ok))); }
      s = E.endSol(s);
    }
  }
  console.log('Storm shelter dealt on', dealt, 'of', stormDays, 'storm days');
  // determinism + purity
  const a = JSON.stringify(playGame(42, randomPolicy, 60, false)), b = JSON.stringify(playGame(42, randomPolicy, 60, false));
  console.log('same seed -> same game:', a === b);
}
