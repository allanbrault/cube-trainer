// Random-state 3×3 scrambles, made the way official competition scrambles are:
// draw one of the 43 quintillion cube positions uniformly at random, solve it
// with Kociemba's two-phase algorithm, and hand out the inverse of the
// solution. Every position is equally likely, which random move sequences
// cannot offer.
//
// No DOM here: runs in a Worker in the app and under Node in the tests.

// Corners and edges are numbered as in Kociemba's cubie model
const [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB] = [0, 1, 2, 3, 4, 5, 6, 7];
const [UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// The six clockwise face turns: position i receives the piece that was at
// cp[i] / ep[i], and its orientation grows by co[i] / eo[i]
const TURNS = [
  { // U
    cp: [UBR, URF, UFL, ULB, DFR, DLF, DBL, DRB], co: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [UB, UR, UF, UL, DR, DF, DL, DB, FR, FL, BL, BR], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  { // R
    cp: [DFR, UFL, ULB, URF, DRB, DLF, DBL, UBR], co: [2, 0, 0, 1, 1, 0, 0, 2],
    ep: [FR, UF, UL, UB, BR, DF, DL, DB, DR, FL, BL, UR], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  { // F
    cp: [UFL, DLF, ULB, UBR, URF, DFR, DBL, DRB], co: [1, 2, 0, 0, 2, 1, 0, 0],
    ep: [UR, FL, UL, UB, DR, FR, DL, DB, UF, DF, BL, BR], eo: [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0],
  },
  { // D
    cp: [URF, UFL, ULB, UBR, DLF, DBL, DRB, DFR], co: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [UR, UF, UL, UB, DF, DL, DB, DR, FR, FL, BL, BR], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  { // L
    cp: [URF, ULB, DBL, UBR, DFR, UFL, DLF, DRB], co: [0, 1, 2, 0, 0, 2, 1, 0],
    ep: [UR, UF, BL, UB, DR, DF, FL, DB, FR, UL, DL, BR], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  { // B
    cp: [URF, UFL, UBR, DRB, DFR, DLF, ULB, DBL], co: [0, 0, 1, 2, 0, 0, 2, 1],
    ep: [UR, UF, UL, BR, DR, DF, DL, BL, FR, FL, UB, DB], eo: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1],
  },
];

export const MOVE_NAMES = [...'URFDLB'].flatMap(f => [f, f + '2', f + "'"]);

export const solvedState = () => ({
  cp: [0, 1, 2, 3, 4, 5, 6, 7], co: [0, 0, 0, 0, 0, 0, 0, 0],
  ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
});

// The position reached by doing `b` on position `a`
export function multiply(a, b) {
  return {
    cp: b.cp.map(from => a.cp[from]),
    co: b.cp.map((from, i) => (a.co[from] + b.co[i]) % 3),
    ep: b.ep.map(from => a.ep[from]),
    eo: b.ep.map((from, i) => (a.eo[from] + b.eo[i]) % 2),
  };
}

// MOVES[face * 3 + (turns − 1)], faces in the order U R F D L B
export const MOVES = TURNS.flatMap(turn => {
  const once = multiply(solvedState(), turn);
  const twice = multiply(once, turn);
  return [once, twice, multiply(twice, turn)];
});

const sameState = (a, b) => ['cp', 'co', 'ep', 'eo'].every(k => a[k].every((v, i) => v === b[k][i]));

// ── Coordinates ──────────────────────────────────────────────────────────
// Phase 1 brings the cube into the subgroup <U, D, R2, L2, F2, B2>:
// corners twisted right, edges flipped right, middle-layer edges in the
// middle layer. Phase 2 finishes using only those ten moves.

const N_TWIST = 2187;  // 3^7 corner orientations
const N_FLIP = 2048;   // 2^11 edge orientations
const N_SLICE = 495;   // C(12,4) places for the four middle-layer edges
const N_PERM8 = 40320; // 8! corner (or U/D-layer edge) permutations
const N_PERM4 = 24;    // 4! orders of the middle-layer edges

const CHOOSE = Array.from({ length: 13 }, () => new Array(13).fill(0));
for (let n = 0; n <= 12; n++) {
  CHOOSE[n][0] = 1;
  for (let k = 1; k <= n; k++) CHOOSE[n][k] = CHOOSE[n - 1][k - 1] + (CHOOSE[n - 1][k] || 0);
}

export function getTwist(co) {
  let t = 0;
  for (let i = 0; i < 7; i++) t = t * 3 + co[i];
  return t;
}
export function setTwist(t) {
  const co = new Array(8);
  let sum = 0;
  for (let i = 6; i >= 0; i--) { co[i] = t % 3; sum += co[i]; t = (t / 3) | 0; }
  co[7] = (3 - (sum % 3)) % 3;
  return co;
}

export function getFlip(eo) {
  let f = 0;
  for (let i = 0; i < 11; i++) f = f * 2 + eo[i];
  return f;
}
export function setFlip(f) {
  const eo = new Array(12);
  let sum = 0;
  for (let i = 10; i >= 0; i--) { eo[i] = f & 1; sum += eo[i]; f >>= 1; }
  eo[11] = sum & 1;
  return eo;
}

// Which four places hold the middle-layer edges (FR FL BL BR); 0 when home
export function getSlice(ep) {
  let a = 0, x = 0;
  for (let j = 11; j >= 0; j--)
    if (ep[j] >= FR) { a += CHOOSE[11 - j][x + 1]; x++; }
  return a;
}
export function setSlice(a) {
  const ep = new Array(12).fill(-1);
  let x = 3;
  for (let j = 0; j < 12 && x >= 0; j++)
    if (a >= CHOOSE[11 - j][x + 1]) { a -= CHOOSE[11 - j][x + 1]; ep[j] = FR + x; x--; }
  let other = 0;
  for (let j = 0; j < 12; j++) if (ep[j] < 0) ep[j] = other++;
  return ep;
}

// Lexicographic rank of a permutation of 0…n−1; 0 for the identity
export function permRank(p) {
  const n = p.length;
  let r = 0;
  for (let i = 0; i < n; i++) {
    let smaller = 0;
    for (let j = i + 1; j < n; j++) if (p[j] < p[i]) smaller++;
    r = r * (n - i) + smaller;
  }
  return r;
}
export function permUnrank(r, n) {
  const digits = new Array(n);
  for (let i = n - 1; i >= 0; i--) { digits[i] = r % (n - i); r = (r / (n - i)) | 0; }
  const pool = Array.from({ length: n }, (_, i) => i);
  return digits.map(d => pool.splice(d, 1)[0]);
}

const sliceOrder = ep => permRank(ep.slice(8).map(e => e - 8));

// ── Tables ───────────────────────────────────────────────────────────────

const PHASE2_MOVES = [0, 1, 2, 9, 10, 11, 4, 13, 7, 16]; // U U2 U' D D2 D' R2 L2 F2 B2
const IS_PHASE2_MOVE = MOVE_NAMES.map((_, m) => PHASE2_MOVES.includes(m));

let tables = null;

// Distance from solved for every pair of two coordinates, by breadth-first search
function distances(nA, nB, moveA, moveB, nMoves) {
  const dist = new Int8Array(nA * nB).fill(-1);
  const queue = new Int32Array(nA * nB);
  let head = 0, tail = 1;
  dist[0] = 0;
  while (head < tail) {
    const idx = queue[head++];
    const a = (idx / nB) | 0, b = idx % nB, d = dist[idx] + 1;
    for (let m = 0; m < nMoves; m++) {
      const next = moveA[a * nMoves + m] * nB + moveB[b * nMoves + m];
      if (dist[next] < 0) { dist[next] = d; queue[tail++] = next; }
    }
  }
  return dist;
}

// Builds the lookup tables once (about a quarter of a second)
export function initTables() {
  if (tables) return tables;
  const base = solvedState();

  const twistMove = new Uint16Array(N_TWIST * 18);
  for (let t = 0; t < N_TWIST; t++) {
    const state = { ...base, co: setTwist(t) };
    for (let m = 0; m < 18; m++) twistMove[t * 18 + m] = getTwist(multiply(state, MOVES[m]).co);
  }

  const flipMove = new Uint16Array(N_FLIP * 18);
  for (let f = 0; f < N_FLIP; f++) {
    const state = { ...base, eo: setFlip(f) };
    for (let m = 0; m < 18; m++) flipMove[f * 18 + m] = getFlip(multiply(state, MOVES[m]).eo);
  }

  const sliceMove = new Uint16Array(N_SLICE * 18);
  for (let s = 0; s < N_SLICE; s++) {
    const ep = setSlice(s);
    for (let m = 0; m < 18; m++) sliceMove[s * 18 + m] = getSlice(MOVES[m].ep.map(from => ep[from]));
  }

  const cornerMove = new Uint16Array(N_PERM8 * 10);
  const edgeMove = new Uint16Array(N_PERM8 * 10);
  for (let p = 0; p < N_PERM8; p++) {
    const perm = permUnrank(p, 8);
    for (let k = 0; k < 10; k++) {
      const move = MOVES[PHASE2_MOVES[k]];
      cornerMove[p * 10 + k] = permRank(move.cp.map(from => perm[from]));
      // The eight U/D-layer edges stay in the first eight places under these moves
      edgeMove[p * 10 + k] = permRank(move.ep.slice(0, 8).map(from => perm[from]));
    }
  }

  const orderMove = new Uint8Array(N_PERM4 * 10);
  for (let p = 0; p < N_PERM4; p++) {
    const ep = [0, 1, 2, 3, 4, 5, 6, 7, ...permUnrank(p, 4).map(e => e + 8)];
    for (let k = 0; k < 10; k++)
      orderMove[p * 10 + k] = sliceOrder(MOVES[PHASE2_MOVES[k]].ep.map(from => ep[from]));
  }

  tables = {
    twistMove, flipMove, sliceMove, cornerMove, edgeMove, orderMove,
    twistDist: distances(N_TWIST, N_SLICE, twistMove, sliceMove, 18),
    flipDist: distances(N_FLIP, N_SLICE, flipMove, sliceMove, 18),
    cornerDist: distances(N_PERM8, N_PERM4, cornerMove, orderMove, 10),
    edgeDist: distances(N_PERM8, N_PERM4, edgeMove, orderMove, 10),
  };
  return tables;
}

// ── Two-phase search ─────────────────────────────────────────────────────

const PHASE2_FIRST_PASS = 10; // longest phase 2 tried while hunting for a short solution
const NO_FACE = -9;

// Finds a move sequence that solves `state`. Keeps looking for a shorter one
// until it is at most `maxLength` moves or `timeLimit` ms have passed, then
// returns the shortest found; a first solution always arrives in a few ms.
// Returns move indices into MOVE_NAMES.
export function solve(state, { maxLength = 21, timeLimit = 1500, phase2Cap = PHASE2_FIRST_PASS } = {}) {
  const { twistMove, flipMove, sliceMove, cornerMove, edgeMove, orderMove,
    twistDist, flipDist, cornerDist, edgeDist } = initTables();

  const path = new Int8Array(64);
  const started = performance.now();
  let best = null;
  let bound = 30;      // longest total still worth finding
  let done = false;
  let gaveUp = false;
  let nodes = 0;

  function phase2(corner, edge, order, left, lastFace, n) {
    if (left === 0) return corner === 0 && edge === 0 && order === 0;
    for (let k = 0; k < 10; k++) {
      const m = PHASE2_MOVES[k];
      const face = (m / 3) | 0;
      // Never the same face twice, and opposite faces in one fixed order
      if (face === lastFace || face + 3 === lastFace) continue;
      const nc = cornerMove[corner * 10 + k], ne = edgeMove[edge * 10 + k], no = orderMove[order * 10 + k];
      if (cornerDist[nc * N_PERM4 + no] >= left || edgeDist[ne * N_PERM4 + no] >= left) continue;
      path[n] = m;
      if (phase2(nc, ne, no, left - 1, face, n + 1)) return true;
    }
    return false;
  }

  // Phase 1 is done after path[0…n): replay it, then try to finish
  function finish(n) {
    let cp = state.cp, ep = state.ep;
    for (let i = 0; i < n; i++) {
      const move = MOVES[path[i]];
      cp = move.cp.map(from => cp[from]);
      ep = move.ep.map(from => ep[from]);
    }
    const corner = permRank(cp), edge = permRank(ep.slice(0, 8)), order = sliceOrder(ep);
    const lastFace = n ? (path[n - 1] / 3) | 0 : NO_FACE;
    const budget = Math.min(bound - n, phase2Cap);
    const need = Math.max(cornerDist[corner * N_PERM4 + order], edgeDist[edge * N_PERM4 + order]);
    for (let left = need; left <= budget; left++) {
      if (!phase2(corner, edge, order, left, lastFace, n)) continue;
      best = Array.from(path.subarray(0, n + left));
      bound = best.length - 1;
      if (best.length <= maxLength) done = true;
      return;
    }
  }

  function phase1(twist, flip, slice, left, lastFace, n) {
    if (left === 0) {
      // A phase 1 ending in a phase 2 move was already tried one move shorter
      if (twist === 0 && flip === 0 && slice === 0 && (n === 0 || !IS_PHASE2_MOVE[path[n - 1]])) finish(n);
      return;
    }
    if ((++nodes & 1023) === 0) {
      const elapsed = performance.now() - started;
      if (best ? elapsed > timeLimit : elapsed > timeLimit * 4) { done = true; gaveUp = !best; return; }
    }
    for (let m = 0; m < 18; m++) {
      const face = (m / 3) | 0;
      if (face === lastFace || face + 3 === lastFace) continue;
      const nt = twistMove[twist * 18 + m], nf = flipMove[flip * 18 + m], ns = sliceMove[slice * 18 + m];
      if (twistDist[nt * N_SLICE + ns] >= left || flipDist[nf * N_SLICE + ns] >= left) continue;
      path[n] = m;
      phase1(nt, nf, ns, left - 1, face, n + 1);
      if (done) return;
    }
  }

  const twist = getTwist(state.co), flip = getFlip(state.eo), slice = getSlice(state.ep);
  for (let depth = 0; depth <= bound && !done; depth++) phase1(twist, flip, slice, depth, NO_FACE, 0);

  // Never seen in practice: nothing within the first-pass limits. Take the
  // first phase 1 solution and let phase 2 run as long as it needs (≤ 18).
  if (gaveUp) return solve(state, { maxLength: 30, timeLimit: Infinity, phase2Cap: 18 });
  return best;
}

// ── Random states ────────────────────────────────────────────────────────

// Uniform integer in [0, n) from the platform's cryptographic generator
export function cryptoRandInt(n) {
  const limit = 0x100000000 - (0x100000000 % n);
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf); while (buf[0] >= limit);
  return buf[0] % n;
}

function shuffled(n, randInt) {
  const p = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}

function isOdd(p) {
  let odd = false;
  for (let i = 0; i < p.length; i++)
    for (let j = i + 1; j < p.length; j++) if (p[i] > p[j]) odd = !odd;
  return odd;
}

// One of the 43,252,003,274,489,856,000 reachable positions, each equally likely
export function randomState(randInt = cryptoRandInt) {
  const cp = shuffled(8, randInt);
  const ep = shuffled(12, randInt);
  // Corner and edge permutations must have the same parity on a real cube
  if (isOdd(cp) !== isOdd(ep)) [ep[0], ep[1]] = [ep[1], ep[0]];
  return {
    cp, ep,
    co: setTwist(randInt(N_TWIST)),
    eo: setFlip(randInt(N_FLIP)),
  };
}

// WCA regulation 4b3: a scrambled 3×3 must need at least two moves to solve
const tooEasy = state => sameState(state, solvedState()) || MOVES.some(move => sameState(state, move));

export function invertMoves(moves) {
  return moves.slice().reverse().map(m => m - (m % 3) + (2 - (m % 3)));
}

// { scramble: "R U2 F' …", state } for a fresh random position
export function randomScramble({ randInt = cryptoRandInt, maxLength = 21, timeLimit = 1500 } = {}) {
  let state;
  do state = randomState(randInt); while (tooEasy(state));
  const solution = solve(state, { maxLength, timeLimit });
  return { scramble: invertMoves(solution).map(m => MOVE_NAMES[m]).join(' '), state };
}
