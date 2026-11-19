// Checks every algorithm in the trainer's database on the sticker model:
// it must leave the first two layers alone, and all variants listed under one
// case must really solve the same case.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { apply, solved, invert } from '../public/js/cube.js';

// The database lives inline in index.html
const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const source = html.slice(html.indexOf('const OLL_ALGS = ['), html.indexOf('// ═', html.indexOf('const PLL_ALGS = [')));
const { OLL_ALGS, PLL_ALGS } = new Function(`${source}; return { OLL_ALGS, PLL_ALGS };`)();

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
