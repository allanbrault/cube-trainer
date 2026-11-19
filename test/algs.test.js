// Checks every algorithm in the trainer's database on the sticker model:
// it must leave everything it shouldn't touch alone, all variants listed under
// one case must really solve the same case, and each step's case list must be
// complete.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, solved, invert, tokenize } from '../public/js/cube.js';
import { CROSS_ALGS, F2L_ALGS, OLL_ALGS, PLL_ALGS } from '../public/js/algs.js';

const S = name => 'URFDLB'.indexOf(name[0]) * 9 + Number(name[1]) - 1;
const slots = names => names.split(' ').map(S);
const TOP = slots('U1 U2 U3 U4 U5 U6 U7 U8 U9');
const TOP_EDGES = slots('U2 U6 U8 U4');                       // back, right, front, left
const SIDE = slots('B3 B2 B1 R3 R2 R1 F3 F2 F1 L3 L2 L1');    // top rows, clockwise from above
const SIDE_CORNERS = slots('B3 B1 R3 R1 F3 F1 L3 L1');

// Rotations and wide moves can leave the whole cube turned: turn it back
const ROTATIONS = ['', 'x', 'x2', "x'", 'z', "z'"].flatMap(a => ['', 'y', 'y2', "y'"].map(b => `${a} ${b}`));
function upright(cube) {
  for (const r of ROTATIONS) {
    const turned = apply(cube, r);
    if ([4, 13, 22, 31, 40, 49].every((c, f) => turned[c] === 'URFDLB'[f])) return turned;
  }
  throw new Error('centres are not a rotation of a cube');
}

function firstTwoLayersSolved(cube) {
  for (let f = 0; f < 6; f++) {
    const face = 'URFDLB'[f];
    if (face === 'U') continue;
    const from = face === 'D' ? 0 : 3; // side faces: middle and bottom rows only
    for (let i = from; i < 9; i++) if (cube[f * 9 + i] !== face) return false;
  }
  return true;
}

// The case an algorithm solves, as seen before doing it
const caseOf = alg => upright(apply(solved(), invert(alg)));
const read = (cube, where) => where.map(i => cube[i]).join('');
// Smallest reading over the given equivalent views of a case
const canonical = (alg, views, readView) => views.map(([pre, post]) => readView(upright(apply(solved(), [pre, ...invert(alg), post].join(' '))))).sort()[0];

const TURNS = ['', 'U', 'U2', "U'"];
const ANY_ANGLE = TURNS.map(t => ['', t]);                       // same orientation case seen from any side
const ANY_ANGLE_AND_AUF = TURNS.flatMap(a => TURNS.map(b => [a, b])); // same permutation case

const orientation = cube => read(cube, [...TOP, ...SIDE]).replace(/[^U]/g, '.');
const edgeOrientation = cube => read(cube, TOP_EDGES).replace(/[^U]/g, '.');

const sections = [
  { tab: 'OLL', data: OLL_ALGS[0], claim: 'edge orientation', key: alg => canonical(alg, ANY_ANGLE, edgeOrientation) },
  { tab: 'OLL', data: OLL_ALGS[1], claim: 'orientation', key: alg => canonical(alg, ANY_ANGLE, orientation) },
  { tab: 'PLL', data: PLL_ALGS[0], claim: 'corner permutation', key: alg => canonical(alg, ANY_ANGLE_AND_AUF, c => read(c, SIDE_CORNERS)) },
  { tab: 'PLL', data: PLL_ALGS[1], claim: 'permutation', key: alg => canonical(alg, ANY_ANGLE_AND_AUF, c => read(c, SIDE)) },
];

test('database has the expected shape', () => {
  assert.equal(OLL_ALGS.length, 2);
  assert.equal(PLL_ALGS.length, 2);
  assert.deepEqual(sections.map(s => s.data.algs.length), [3, 7, 2, 4]);
});

for (const { tab, data, claim, key } of sections) {
  test(`${tab} · ${data.section}`, () => {
    const keys = new Map();
    for (const alg of data.algs) {
      for (const v of alg.variants) {
        const label = `${alg.name} / ${v.label}: ${v.alg}`;
        const before = caseOf(v.alg);
        assert.ok(firstTwoLayersSolved(before), `breaks the first two layers — ${label}`);
        if (claim === 'orientation')
          assert.equal(edgeOrientation(before), 'UUUU', `step 2 case should start with the cross done — ${label}`);
        if (tab === 'PLL')
          assert.equal(read(before, TOP), 'UUUUUUUUU', `PLL case should start with the top oriented — ${label}`);
        if (claim === 'permutation')
          assert.ok(TURNS.some(t => read(apply(before, t), SIDE_CORNERS) === 'BBRRFFLL'), `step 2 case should start with corners solved — ${label}`);
      }
      const variantKeys = alg.variants.map(v => key(v.alg));
      assert.equal(new Set(variantKeys).size, 1,
        `variants of "${alg.name}" solve different cases:\n${alg.variants.map((v, i) => `  ${variantKeys[i]}  ${v.label}`).join('\n')}`);
      assert.ok(!keys.has(variantKeys[0]), `"${alg.name}" is the same case as "${keys.get(variantKeys[0])}"`);
      keys.set(variantKeys[0], alg.name);
    }
  });
}

test('first-look OLL shapes match their names', () => {
  const shape = name => sections[0].key(OLL_ALGS[0].algs.find(a => a.name === name).variants[0].alg);
  assert.equal(shape('Dot'), '....');
  assert.equal([...shape('Line')].filter(c => c === 'U').length, 2);
  assert.ok(['.U.U', 'U.U.'].includes(shape('Line')));
  assert.ok(['..UU', '.UU.', 'U..U', 'UU..'].includes(shape('L-Shape')));
});

// ── Cross and F2L: follow individual stickers, named U1…B9 by their home slot ──

const tagged = () => [...'URFDLB'].flatMap(f => Array.from({ length: 9 }, (_, i) => f + (i + 1)));
const home = i => 'URFDLB'[Math.floor(i / 9)] + ((i % 9) + 1);
const where = (cube, ids) => ids.map(id => home(cube.indexOf(id))).join(' ');
const setup = (alg, from = tagged()) => apply(from, invert(alg));
const centresHome = cube => [4, 13, 22, 31, 40, 49].every(i => cube[i] === home(i));
const allCases = sections => sections.flatMap(s => s.algs);

const PAIR = ['D3', 'F9', 'R7', 'F6', 'R4'];              // front-right corner and edge
const isF2LSlot = i => (i >= 27 && i < 36) || (i >= 9 && i % 9 >= 3);
const restOfF2LHome = cube => cube.every((id, i) => !isF2LSlot(i) || PAIR.includes(home(i)) || id === home(i));
const pairKey = alg => TURNS.map(t => where(apply(setup(alg), t), PAIR)).sort()[0];

test('F2L: 41 distinct cases, each variant valid', () => {
  const cases = allCases(F2L_ALGS);
  assert.equal(cases.length, 41);
  const keys = new Map();
  for (const c of cases) {
    for (const v of c.variants) {
      const label = `${c.name} / ${v.label}: ${v.alg}`;
      const before = setup(v.alg);
      assert.ok(centresHome(before), `turns the whole cube — ${label}`);
      assert.ok(restOfF2LHome(before), `needs more than the pair out of place — ${label}`);
      // Shown from the front-right: the corner must be where it can be seen
      assert.match(where(before, ['D3']), /^(U9|F3|R1|D3|F9|R7)$/, `corner hidden at the back — ${label}`);
    }
    const variantKeys = c.variants.map(v => pairKey(v.alg));
    assert.equal(new Set(variantKeys).size, 1, `variants of "${c.name}" solve different cases`);
    assert.notEqual(variantKeys[0], PAIR.join(' '), `"${c.name}" is already solved`);
    assert.ok(!keys.has(variantKeys[0]), `"${c.name}" is the same case as "${keys.get(variantKeys[0])}"`);
    keys.set(variantKeys[0], c.name);
    // The drill hands out scrambles made of face turns only
    assert.ok(c.variants.some(v => tokenize(v.alg).every(m => /^[RUFLDB]['2]?$/.test(m))), `"${c.name}" has no face-turn-only variant`);
  }
  assert.equal(new Set(cases.map(c => c.name)).size, 41);
});

test('F2L: a setup gives the same case whatever the last layer looks like', () => {
  const lastLayers = ['', "R U R' U R U2 R'", "R U R' U' R' F R2 U' R' U' R U R' F' U", "F R U R' U' F' U2 M2 U M U2 M' U M2"];
  for (const c of allCases(F2L_ALGS)) {
    const alg = c.variants[0].alg;
    const want = where(setup(alg), PAIR);
    for (const ll of lastLayers) {
      const after = setup(alg, apply(tagged(), ll));
      assert.equal(where(after, PAIR), want, `${c.name} after "${ll}"`);
      assert.ok(restOfF2LHome(after), `${c.name} after "${ll}"`);
    }
  }
});

const OTHER_CROSS_EDGES = ['D6', 'R8', 'D8', 'B8', 'D4', 'L8'];
const FRONT_CROSS_EDGE = ['D2', 'F8'];

test('cross: the 11 ways one edge can sit, each solved in at most 4 moves', () => {
  const cases = allCases(CROSS_ALGS);
  assert.equal(cases.length, 11);
  const keys = new Set();
  for (const c of cases) {
    for (const v of c.variants) {
      const before = setup(v.alg);
      assert.equal(where(before, OTHER_CROSS_EDGES), OTHER_CROSS_EDGES.join(' '), `${c.name}: other cross edges moved`);
      assert.notEqual(where(before, FRONT_CROSS_EDGE), FRONT_CROSS_EDGE.join(' '), `${c.name}: nothing to solve`);
      assert.ok(tokenize(v.alg).length <= 4, `${c.name}: ${v.alg}`);
    }
    keys.add(TURNS.map(t => where(apply(setup(c.variants[0].alg), t), FRONT_CROSS_EDGE)).sort()[0]);
  }
  assert.equal(keys.size, 11);
});
