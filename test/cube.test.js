import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, solved, isSolved, invert, tokenize } from '../public/js/cube.js';

// Facelet numbering used on scramble sheets: U1…U9, R1…R9, F, D, L, B
const slot = name => 'URFDLB'.indexOf(name[0]) * 9 + Number(name[1]) - 1;
const at = (cube, names) => names.split(' ').map(n => cube[slot(n)]).join('');

// What a clockwise quarter turn does to a solved cube, written out by hand
// from a real cube rather than from the model: a turn of R carries the front
// stickers up, the up stickers to the back, and so on.
test('single face turns move the right stickers', () => {
  const R = apply(solved(), 'R');
  assert.equal(at(R, 'U3 U6 U9'), 'FFF');
  assert.equal(at(R, 'F3 F6 F9'), 'DDD');
  assert.equal(at(R, 'D3 D6 D9'), 'BBB');
  assert.equal(at(R, 'B1 B4 B7'), 'UUU');
  assert.equal(at(R, 'R1 R5 R9 L5 U1 F1'), 'RRRLUF');

  const L = apply(solved(), 'L');
  assert.equal(at(L, 'F1 F4 F7'), 'UUU');
  assert.equal(at(L, 'D1 D4 D7'), 'FFF');
  assert.equal(at(L, 'B3 B6 B9'), 'DDD');
  assert.equal(at(L, 'U1 U4 U7'), 'BBB');

  const U = apply(solved(), 'U');
  assert.equal(at(U, 'F1 F2 F3'), 'RRR');
  assert.equal(at(U, 'L1 L2 L3'), 'FFF');
  assert.equal(at(U, 'B1 B2 B3'), 'LLL');
  assert.equal(at(U, 'R1 R2 R3'), 'BBB');

  const D = apply(solved(), 'D');
  assert.equal(at(D, 'F7 F8 F9'), 'LLL');
  assert.equal(at(D, 'R7 R8 R9'), 'FFF');
  assert.equal(at(D, 'B7 B8 B9'), 'RRR');
  assert.equal(at(D, 'L7 L8 L9'), 'BBB');

  const F = apply(solved(), 'F');
  assert.equal(at(F, 'U7 U8 U9'), 'LLL');
  assert.equal(at(F, 'R1 R4 R7'), 'UUU');
  assert.equal(at(F, 'D1 D2 D3'), 'RRR');
  assert.equal(at(F, 'L3 L6 L9'), 'DDD');

  const B = apply(solved(), 'B');
  assert.equal(at(B, 'U1 U2 U3'), 'RRR');
  assert.equal(at(B, 'L1 L4 L7'), 'UUU');
  assert.equal(at(B, 'D7 D8 D9'), 'LLL');
  assert.equal(at(B, 'R3 R6 R9'), 'DDD');
});

test('stickers keep their order along a turned face', () => {
  // Mark one sticker and follow it: U9 (front-right of the top) goes to the
  // top of the back face's left column under R, i.e. B1
  const cube = solved().map((f, i) => (i === slot('U9') ? '*' : f));
  assert.equal(apply(cube, 'R')[slot('B1')], '*');
  assert.equal(apply(cube, 'F')[slot('R7')], '*');
  assert.equal(apply(cube, 'U')[slot('U7')], '*');
});

test('well-known identities hold', () => {
  const same = alg => assert.ok(isSolved(apply(solved(), alg)), alg);
  same("R U R' U' R U R' U' R U R' U' R U R' U' R U R' U' R U R' U'"); // sexy move × 6
  same("R U R' U' R' F R2 U' R' U' R U R' F' R U R' U' R' F R2 U' R' U' R U R' F'"); // T-perm twice
  same("R U R' U R U2 R' R U2 R' U' R U' R'"); // Sune then its inverse
  same("M2 E2 S2 M2 E2 S2");
  same("x y z y' x' y'");                      // rotations compose like a real cube
  same("r R' M");                              // r = R M'
  same("l L' M'");                             // l = L M
  same("u U' E");
  same("d D' E'");
  same("f F' S'");
  same("b B' S");
  same("x R' L M");                            // x = R M' L'
  same("y U' D E");
  same("z F' B S'");
  for (const m of 'RLUDFBMESxyzrludfb') same(`${m} ${m} ${m} ${m}`);
});

test('superflip is not solved but has order 2', () => {
  const superflip = "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2";
  const once = apply(solved(), superflip);
  assert.ok(!isSolved(once));
  assert.equal(at(once, 'U2 U4 U6 U8'), 'BLRF'); // every edge flipped in place
  assert.equal(at(once, 'U1 U3 U7 U9'), 'UUUU');
  assert.ok(isSolved(apply(once, superflip)));
});

test('invert undoes any sequence', () => {
  const alg = "R U2 F' D L2 B' M E2 S' r u2 f' x y2 z'";
  assert.deepEqual(invert("R U2 F'"), ['F', 'U2', "R'"]);
  assert.ok(isSolved(apply(apply(solved(), alg), invert(alg))));
  assert.equal(tokenize(alg).length, 15);
});
