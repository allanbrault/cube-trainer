import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, solved, isSolved } from '../public/js/cube.js';
import {
  MOVES, MOVE_NAMES, solvedState, multiply, initTables, solve, randomState, randomScramble, invertMoves,
  getTwist, setTwist, getFlip, setFlip, getSlice, setSlice, permRank, permUnrank,
} from '../public/js/scrambler.js';

// Seeded generator so failures can be replayed
function seeded(seed) {
  let s = seed >>> 0;
  return n => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * n);
  };
}

// Cubie position → the 54 stickers, using the published corner/edge facelet
// tables. Deliberately separate from both the solver and the sticker model.
const S = name => 'URFDLB'.indexOf(name[0]) * 9 + Number(name[1]) - 1;
const CORNER_SLOTS = ['U9 R1 F3', 'U7 F1 L3', 'U1 L1 B3', 'U3 B1 R3', 'D3 F9 R7', 'D1 L9 F7', 'D7 B9 L7', 'D9 R9 B7']
  .map(c => c.split(' ').map(S));
const EDGE_SLOTS = ['U6 R2', 'U8 F2', 'U4 L2', 'U2 B2', 'D6 R8', 'D2 F8', 'D4 L8', 'D8 B8', 'F6 R4', 'F4 L6', 'B6 L4', 'B4 R6']
  .map(e => e.split(' ').map(S));
const CORNER_COLORS = ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DBL', 'DRB'];
const EDGE_COLORS = ['UR', 'UF', 'UL', 'UB', 'DR', 'DF', 'DL', 'DB', 'FR', 'FL', 'BL', 'BR'];

function toStickers(state) {
  const cube = solved();
  for (let i = 0; i < 8; i++)
    for (let n = 0; n < 3; n++) cube[CORNER_SLOTS[i][(n + state.co[i]) % 3]] = CORNER_COLORS[state.cp[i]][n];
  for (let i = 0; i < 12; i++)
    for (let n = 0; n < 2; n++) cube[EDGE_SLOTS[i][(n + state.eo[i]) % 2]] = EDGE_COLORS[state.ep[i]][n];
  return cube;
}

const names = moves => moves.map(m => MOVE_NAMES[m]).join(' ');

test('coordinates round-trip', () => {
  for (let t = 0; t < 2187; t++) assert.equal(getTwist(setTwist(t)), t);
  for (let f = 0; f < 2048; f++) assert.equal(getFlip(setFlip(f)), f);
  const seen = new Set();
  for (let s = 0; s < 495; s++) {
    const ep = setSlice(s);
    assert.equal(getSlice(ep), s);
    assert.deepEqual([...ep].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    seen.add(ep.map(e => (e >= 8 ? 1 : 0)).join(''));
  }
  assert.equal(seen.size, 495);
  for (let p = 0; p < 40320; p += 7) assert.equal(permRank(permUnrank(p, 8)), p);
  for (let p = 0; p < 24; p++) assert.equal(permRank(permUnrank(p, 4)), p);
  const solvedCube = solvedState();
  assert.equal(getTwist(solvedCube.co) + getFlip(solvedCube.eo) + getSlice(solvedCube.ep) + permRank(solvedCube.cp), 0);
});

test('the cubie moves match the sticker model', () => {
  MOVES.forEach((move, m) => {
    assert.deepEqual(toStickers(move), apply(solved(), MOVE_NAMES[m]), MOVE_NAMES[m]);
  });
  // …and so do long random sequences
  const rand = seeded(1);
  for (let round = 0; round < 50; round++) {
    let state = solvedState();
    const seq = [];
    for (let i = 0; i < 40; i++) { const m = rand(18); seq.push(m); state = multiply(state, MOVES[m]); }
    assert.deepEqual(toStickers(state), apply(solved(), names(seq)));
  }
});

test('distance tables are complete and have the known depths', () => {
  const t = initTables();
  const max = table => table.reduce((a, b) => Math.max(a, b), 0);
  for (const key of ['twistDist', 'flipDist', 'cornerDist', 'edgeDist'])
    assert.ok(t[key].every(d => d >= 0), `${key} has unreached entries`);
  // Any position can reach the phase 2 subgroup in 12 moves and be finished in 18
  assert.ok(max(t.twistDist) <= 12 && max(t.flipDist) <= 12);
  assert.ok(max(t.cornerDist) <= 18 && max(t.edgeDist) <= 18);
});

test('random states are legal cube positions', () => {
  const rand = seeded(2);
  const sign = p => { let odd = 0; for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (p[i] > p[j]) odd ^= 1; return odd; };
  for (let i = 0; i < 2000; i++) {
    const s = randomState(rand);
    assert.deepEqual([...s.cp].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual([...s.ep].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    assert.equal(s.co.reduce((a, b) => a + b) % 3, 0);
    assert.equal(s.eo.reduce((a, b) => a + b) % 2, 0);
    assert.equal(sign(s.cp), sign(s.ep));
  }
});

test('random states cover every kind of position evenly', () => {
  const rand = seeded(3);
  const N = 60000;
  const cornerAt0 = new Array(8).fill(0), edgeAt11 = new Array(12).fill(0), twist7 = [0, 0, 0], flip11 = [0, 0];
  for (let i = 0; i < N; i++) {
    const s = randomState(rand);
    cornerAt0[s.cp[0]]++; edgeAt11[s.ep[11]]++; twist7[s.co[7]]++; flip11[s.eo[11]]++;
  }
  const even = (counts, label) => counts.forEach(c => {
    const expected = N / counts.length;
    assert.ok(Math.abs(c - expected) < 5 * Math.sqrt(expected), `${label}: ${counts}`);
  });
  even(cornerAt0, 'corner in URF'); even(edgeAt11, 'edge in BR'); even(twist7, 'twist of DRB'); even(flip11, 'flip of BR');
  // Edges 0 and 1 are the ones swapped to repair parity: they must stay even too
  const edgeAt0 = new Array(12).fill(0);
  for (let i = 0; i < N; i++) edgeAt0[randomState(rand).ep[0]]++;
  even(edgeAt0, 'edge in UR');
});

test('solve handles the easy and the famous positions', () => {
  assert.deepEqual(solve(solvedState()), []);
  // One move from solved: any correct answer will do (such positions are never handed out)
  assert.ok(isSolved(apply(apply(solved(), 'R'), names(solve(MOVES[3])))));
  const fromAlg = alg => alg.split(' ').reduce((s, name) => multiply(s, MOVES[MOVE_NAMES.indexOf(name)]), solvedState());
  const superflip = fromAlg("U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2");
  const sol = solve(superflip, { maxLength: 22, timeLimit: 3000 });
  assert.ok(isSolved(apply(toStickers(superflip), names(sol))));
});

// 300 by default so `npm run deploy` stays quick; SCRAMBLES=1500 npm test for the long run
const COUNT = Number(process.env.SCRAMBLES) || 300;

test(`${COUNT} scrambles: correct, well-formed and short`, { timeout: 600000 }, () => {
  const rand = seeded(4);
  initTables();
  const lengths = {};
  let slowest = 0, total = 0;
  for (let i = 0; i < COUNT; i++) {
    const t0 = performance.now();
    const { scramble, state } = randomScramble({ randInt: rand });
    const ms = performance.now() - t0;
    slowest = Math.max(slowest, ms); total += ms;

    const moves = scramble.split(' ');
    // Applying the printed text to a solved cube gives exactly the drawn position
    assert.deepEqual(apply(solved(), scramble), toStickers(state), scramble);
    // Only face turns, in standard notation
    for (const mv of moves) assert.match(mv, /^[URFDLB]['2]?$/);
    // Never the same face twice in a row, never A B A on one axis (R L R)
    const axis = mv => 'UDRLFB'.indexOf(mv[0]) >> 1;
    for (let k = 1; k < moves.length; k++) {
      assert.notEqual(moves[k][0], moves[k - 1][0], scramble);
      if (k >= 2 && axis(moves[k]) === axis(moves[k - 1])) assert.notEqual(axis(moves[k]), axis(moves[k - 2]), scramble);
    }
    assert.ok(moves.length >= 2 && moves.length <= 23, `${moves.length} moves: ${scramble}`);
    lengths[moves.length] = (lengths[moves.length] || 0) + 1;
  }
  console.log('  scramble lengths', lengths, `· mean ${(total / COUNT).toFixed(1)} ms · slowest ${slowest.toFixed(0)} ms`);
  const over21 = Object.entries(lengths).filter(([len]) => len > 21).reduce((a, [, n]) => a + n, 0);
  assert.ok(over21 <= COUNT / 100, `${over21} scrambles longer than 21 moves`);
});

test('invertMoves reverses and flips direction', () => {
  assert.equal(names(invertMoves([0, 4, 8])), "F R2 U'");
});
