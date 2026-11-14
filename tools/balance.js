'use strict';
// Outpost 30 balance sim.
// usage: node tools/balance.js index.html data.js [--games N] [--level cadet|commander] [--set key=value ...] [--json] [--quiet]
//   --set lsPerSol=4            any TUNING path ([T] numbers only; [R] keys are refused)
//   --set card.moxie.gain.ls=14 any card cost/gain amount
// Plays every strategy on the same seeds 1..N. Uses only what a player can see:
// the hand, the bars, today's morning report and any Call Earth forecast. Never the hidden schedule.
const fs = require('fs'), vm = require('vm');

const args = process.argv.slice(2);
const htmlPath = args[0], dataPath = args[1];
let GAMES = 1000, JSON_OUT = false, QUIET = false, LEVEL = 'commander'; const sets = [];
for (let i = 2; i < args.length; i++) {
  if (args[i] === '--games') { GAMES = Number(args[++i]); }
  else if (args[i] === '--set') { sets.push(args[++i]); }
  else if (args[i] === '--level') { LEVEL = args[++i]; }
  else if (args[i] === '--json') { JSON_OUT = true; }
  else if (args[i] === '--quiet') { QUIET = true; }
}

/* ---------- load the real engine out of index.html ---------- */
const html = fs.readFileSync(htmlPath, 'utf8');
const m = /\/\* ENGINE:START \*\/([\s\S]*?)\/\* ENGINE:END \*\//.exec(html);
if (!m) { throw new Error('engine markers not found'); }
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(dataPath, 'utf8'), ctx);
vm.runInContext(m[1] + '\nthis.createEngine = createEngine;', ctx);
const D = ctx.OUTPOST_DATA, E = ctx.createEngine(D), T = E.TUNING;
const byId = {}; E.CARDS.forEach(c => { byId[c.id] = c; });
const REAL_KEYS = ['dose'];                       // [R] in TUNING: never touched

/* ---------- apply [T] overrides ---------- */
for (const kv of sets) {
  const [path, raw] = kv.split('='), val = Number(raw), p = path.split('.');
  if (!Number.isFinite(val)) { throw new Error('bad value ' + kv); }
  if (REAL_KEYS.indexOf(p[0]) >= 0) { throw new Error(path + ' is a REAL number; not allowed'); }
  let o;
  if (p[0] === 'card') { o = byId[p[1]]; if (!o) { throw new Error('no card ' + p[1]); } p.splice(0, 2); }
  else { o = T; }
  for (let i = 0; i < p.length - 1; i++) { if (!(p[i] in o)) { o[p[i]] = {}; } o = o[p[i]]; }
  o[p[p.length - 1]] = val;
}

function mulberry(a) { return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const legalOf = s => s.hand.filter(id => E.canPlay(s, id).ok);
const pickRandom = (legal, rng) => legal[Math.floor(rng() * legal.length)];

/* ---------- single-action strategies: always take the favourite card, else a random legal one ---------- */
function prefer(list) {
  return (s, legal, rng) => { for (const id of list) { if (legal.indexOf(id) >= 0) { return id; } } return pickRandom(legal, rng); };
}
const alwaysShield = prefer(['shelter', 'roof', 'wall']);
const alwaysScience = prefer(['lab', 'rock']);
const alwaysSavePower = prefer(['psave']);
const randomPolicy = (s, legal, rng) => pickRandom(legal, rng);

/* ---------- smart greedy: try every way to finish today's picks, score the state after sunset ---------- */
// Knows only: bars, flags, hand, today's report, a Call Earth forecast, and its own past sols (e.g. "dust already came").
function seg(x, pts) {             // concave piecewise-linear utility: pts = [[upTo, slope], ...]
  let v = 0, lo = 0;
  for (const [hi, k] of pts) { const d = Math.min(x, hi) - lo; if (d <= 0) { break; } v += d * k; lo = hi; }
  return v;
}
function score(pre, post) {
  const G = T.goals;
  if (post.phase === 'won') { return 1e6 + post.shield; }
  if (post.phase === 'lost') { return -1e6 + (post.result.reasons[0] === 'goals' ? 5e5 : 0) + post.ls + post.power; }
  const R = T.sols - pre.sol;                                        // sols still to play after today
  const dustDone = pre.history.some(h => h.dust) || pre.schedule[pre.sol - 1].dust > 0;
  const fc = E.forecast(pre);
  const stormSoon = fc.some(f => f.items.some(it => it.kind === 'storm'));
  const stormsLeft = Math.min(T.stormCap - pre.stormsHit, R * 2 / 30) + (stormSoon ? 0.6 : 0);
  const roofM = pre.roofBuilt ? T.stormMult.roof : 1;
  const dose = pre.roofBuilt ? T.doseWithRoof : T.dose;
  let v = 0;

  // life support: count the air the plants still owe us
  const ls = post.ls + post.bonusDue + post.bonusNext;
  const lsNeed = Math.min(40, 6 + R * 1.5);
  v += seg(ls, [[lsNeed, 4], [lsNeed + 30, 1.2], [100, 0.3]]);
  // power
  const pwNeed = Math.min(35, 12 + R);
  v += seg(post.power, [[pwNeed, 2.5], [pwNeed + 30, 0.8], [100, 0.15]]);
  // shield: margin over what the rest of the mission will cost
  const shNeed = dose * R + stormsLeft * T.stormHit * roofM * (pre.wallArmed ? 0.5 : 1);
  const margin = post.shield - shNeed;
  v += margin < 0 ? margin * 14 : seg(margin, [[3, 5], [8, 1.5], [100, 0.2]]);

  // goals: worth more as time runs out
  const ns = Math.min(pre.stars, G.stars), nh = Math.min(pre.harvests, G.harvests);
  const urgency = 1 + Math.max(0, 12 - R) * 0.25;
  v += (ns * 22 + nh * 20) * urgency;
  const slotsLeft = R * T.crew, stillNeeded = (G.stars - ns) + (G.harvests - nh);
  if (stillNeeded > slotsLeft * 0.6) { v -= (stillNeeded - slotsLeft * 0.6) * 40; }

  // lasting things
  if (pre.roofBuilt) { v += 0; }                                     // already counted through the shield margin
  if (pre.panelsClean) { v += Math.min(R, dustDone ? R : 6) * T.cleanPanelBonus * 0.45; }
  if (pre.wallArmed) { v += stormSoon ? 6 : 2; }
  for (const f of pre.failures) { v -= Math.min(R, 8) * (f === 'recycler' ? T.failures.recyclerExtraLs * 1.5 : T.failures.panelPower * 0.6); }
  if (post.lostActionNext || pre.lostActionNext) { v -= 10; }
  return v;
}
function smart(s, legal) {
  let best = null, bestV = -Infinity;
  for (const a of legal) {
    const s1 = E.playCard(s, a);
    const seconds = s1.phase === 'plan' ? legalOf(s1) : [null];
    for (const b of seconds) {
      const s2 = b ? E.playCard(s1, b) : s1;
      if (s2.phase !== 'sunsetReady') { continue; }
      const v = score(s2, E.endSol(s2));
      if (v > bestV) { bestV = v; best = a; }
    }
  }
  return best || legal[0];
}

const STRATS = [
  ['always-shield', alwaysShield], ['always-science', alwaysScience], ['always-save-power', alwaysSavePower],
  ['random', randomPolicy], ['smart', smart]
];

/* ---------- play ---------- */
function playGame(seed, policy, tally) {
  const rng = mulberry(seed ^ 0x9e3779b9);
  let s = E.newGame(seed, { level: LEVEL });
  while (s.phase !== 'won' && s.phase !== 'lost') {
    s = E.startPlan(s);
    s.hand.forEach(id => { tally.offered[id] = (tally.offered[id] || 0) + 1; });
    let guard = 0;
    while (s.phase === 'plan') {
      if (++guard > 5) { throw new Error('plan loop stuck'); }
      const legal = legalOf(s);
      if (!legal.length) { throw new Error('no legal card, sol ' + s.sol); }
      const id = policy(s, legal, rng);
      tally.picked[id] = (tally.picked[id] || 0) + 1;
      s = E.playCard(s, id);
    }
    s = E.endSol(s);
    for (const k of ['ls', 'power', 'shield']) { if (!(s[k] >= 0 && s[k] <= T.max[k])) { throw new Error('bar out of range ' + k + '=' + s[k]); } }
  }
  return s;
}

const results = [];
for (const [name, pol] of STRATS) {
  const t = { name, won: 0, sols: 0, causes: { ls: 0, power: 0, shield: 0, goals: 0 }, offered: {}, picked: {}, stars3: 0 };
  for (let seed = 1; seed <= GAMES; seed++) {
    const s = playGame(seed, pol, t);
    t.sols += s.history.length;
    if (s.phase === 'won') { t.won++; if (s.result.rating === 3) { t.stars3++; } }
    else { s.result.reasons.forEach(r => { t.causes[r]++; }); }
  }
  t.winRate = t.won / GAMES; t.avgSols = t.sols / GAMES;
  const lost = GAMES - t.won, top = Object.keys(t.causes).sort((a, b) => t.causes[b] - t.causes[a])[0];
  t.mainCause = lost ? top + ' (' + Math.round(t.causes[top] / lost * 100) + '% of losses)' : '-';
  results.push(t);
}

if (JSON_OUT) { console.log(JSON.stringify(results.map(r => ({ name: r.name, win: r.winRate, sols: r.avgSols, causes: r.causes, picked: r.picked, offered: r.offered })))); process.exit(0); }

const pct = x => (x * 100).toFixed(1) + '%';
console.log('games per strategy:', GAMES, '| level:', LEVEL, sets.length ? '| overrides: ' + sets.join(' ') : '| baseline');
console.log('strategy           win     avg sols  main cause of failure        LS  PW  SH  goals');
for (const r of results) {
  console.log(r.name.padEnd(18) + pct(r.winRate).padStart(6) + r.avgSols.toFixed(1).padStart(10) + '   ' + r.mainCause.padEnd(28) +
    ['ls', 'power', 'shield', 'goals'].map(k => String(r.causes[k]).padStart(4)).join(''));
}
if (!QUIET) {
  const ids = E.CARDS.map(c => c.id);
  console.log('\npick rate when offered (picked / offered):');
  console.log('card      ' + results.map(r => r.name.slice(0, 13).padStart(14)).join(''));
  for (const id of ids) {
    console.log(id.padEnd(10) + results.map(r => (r.offered[id] ? pct((r.picked[id] || 0) / r.offered[id]) : '-').padStart(14)).join(''));
  }
}
const sm = results.find(r => r.name === 'smart'), rd = results.find(r => r.name === 'random');
const single = results.filter(r => /^always/.test(r.name));
const dead = E.CARDS.map(c => c.id).filter(id => !(sm.picked[id] > 0 && rd.picked[id] > 0));
console.log('\nGOALS: single-action <=70%:', single.every(r => r.winRate <= 0.7) ? 'PASS' : 'FAIL',
  '| random 20-40%:', rd.winRate >= 0.2 && rd.winRate <= 0.4 ? 'PASS' : 'FAIL',
  '| smart 60-80%:', sm.winRate >= 0.6 && sm.winRate <= 0.8 ? 'PASS' : 'FAIL',
  '| every card picked:', dead.length ? 'FAIL ' + dead.join(',') : 'PASS');
