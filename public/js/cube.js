// Sticker-level 3×3 model: applies move notation to a cube and reports where
// every sticker ends up. Geometry only (positions and normals rotated in 3D),
// so it knows nothing about the scrambler's cubie tables and can check them.
//
// A cube is an array of 54 face letters in the order U R F D L B, each face
// read row by row as drawn on an unfolded scramble sheet:
//
//         U
//       L F R B
//         D

export const FACES = 'URFDLB';

// x → right, y → up, z → toward the solver
const NORMALS = { U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1], D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1] };

// Same table as the 3D player: axis, layers along that axis, quarter turns
// (right-handed about the axis, so a clockwise R is −1 about x)
const BASE_MOVES = {
  R: ['x', [1], -1], L: ['x', [-1], 1],
  U: ['y', [1], -1], D: ['y', [-1], 1],
  F: ['z', [1], -1], B: ['z', [-1], 1],
  M: ['x', [0], 1], E: ['y', [0], 1], S: ['z', [0], -1],
  r: ['x', [1, 0], -1], l: ['x', [-1, 0], 1],
  u: ['y', [1, 0], -1], d: ['y', [-1, 0], 1],
  f: ['z', [1, 0], -1], b: ['z', [-1, 0], 1],
  x: ['x', [-1, 0, 1], -1], y: ['y', [-1, 0, 1], -1], z: ['z', [-1, 0, 1], -1],
};
const AXIS_INDEX = { x: 0, y: 1, z: 2 };

function rotQuarter([x, y, z], axis) {
  if (axis === 'x') return [x, -z, y];
  if (axis === 'y') return [z, y, -x];
  return [-y, x, z];
}

// Slot (0–53) of the sticker at cubie position p facing along n
function slotOf(p, n) {
  const [x, y, z] = p;
  if (n[1] === 1) return (z + 1) * 3 + (x + 1);            // U: back row first
  if (n[0] === 1) return 9 + (1 - y) * 3 + (1 - z);        // R: front column first
  if (n[2] === 1) return 18 + (1 - y) * 3 + (x + 1);       // F
  if (n[1] === -1) return 27 + (1 - z) * 3 + (x + 1);      // D: front row first
  if (n[0] === -1) return 36 + (1 - y) * 3 + (z + 1);      // L: back column first
  return 45 + (1 - y) * 3 + (1 - x);                       // B: right column first
}

const STICKERS = [];
for (const face of FACES) {
  const n = NORMALS[face];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++)
        if (n[0] * x + n[1] * y + n[2] * z === 1) STICKERS.push({ p: [x, y, z], n });
}

// dest[from] = slot a sticker in `from` moves to, for one quarter turn of each base move
const QUARTER_PERMS = {};
for (const [name, [axis, layers, quarters]] of Object.entries(BASE_MOVES)) {
  const dest = new Array(54);
  for (const { p, n } of STICKERS) {
    let np = p, nn = n;
    if (layers.includes(p[AXIS_INDEX[axis]]))
      for (let i = 0; i < (quarters + 4) % 4; i++) { np = rotQuarter(np, axis); nn = rotQuarter(nn, axis); }
    dest[slotOf(p, n)] = slotOf(np, nn);
  }
  QUARTER_PERMS[name] = dest;
}

const TOKEN = /[RLUDFBMESxyzrludfb](?:2'?|')?/g;

export const tokenize = alg => (typeof alg === 'string' ? alg.match(TOKEN) || [] : alg);

export function invert(alg) {
  return tokenize(alg).slice().reverse().map(tok => {
    if (tok.includes('2')) return tok[0] + '2';
    return tok.endsWith("'") ? tok[0] : tok + "'";
  });
}

export const solved = () => [...FACES].flatMap(face => Array(9).fill(face));

// Returns a new cube with the moves applied
export function apply(cube, alg) {
  let cur = cube;
  for (const tok of tokenize(alg)) {
    const dest = QUARTER_PERMS[tok[0]];
    const turns = tok.includes('2') ? 2 : tok.endsWith("'") ? 3 : 1;
    for (let t = 0; t < turns; t++) {
      const next = new Array(54);
      for (let i = 0; i < 54; i++) next[dest[i]] = cur[i];
      cur = next;
    }
  }
  return cur;
}

export const isSolved = cube => cube.every((face, i) => face === cube[i - (i % 9) + 4]);
