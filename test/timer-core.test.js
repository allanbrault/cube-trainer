import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DNF, result, format, formatSolve, inspectionPenalty, mean, average, rolling, summarize } from '../public/js/timer-core.js';

const ok = ms => ({ ms, pen: 'ok' });

test('times are truncated, never rounded up', () => {
  assert.equal(result(ok(9999)), 999);
  assert.equal(format(result(ok(9999))), '9.99');
  assert.equal(format(result(ok(10000))), '10.00');
  assert.equal(format(result(ok(5))), '0.00');
  assert.equal(format(result(ok(61234))), '1:01.23');
  assert.equal(format(result(ok(600009))), '10:00.00');
  assert.equal(format(null), '–');
});

test('+2 adds two seconds after truncation, DNF has no time', () => {
  assert.equal(result({ ms: 12349, pen: '+2' }), 1434);
  assert.equal(formatSolve({ ms: 12349, pen: '+2' }), '14.34+');
  assert.equal(result({ ms: 12349, pen: 'dnf' }), DNF);
  assert.equal(formatSolve({ ms: 12349, pen: 'dnf' }), 'DNF');
  assert.equal(formatSolve(ok(12349)), '12.34');
});

test('inspection: 15 s free, +2 up to 17 s, then DNF', () => {
  assert.equal(inspectionPenalty(0), 'ok');
  assert.equal(inspectionPenalty(15000), 'ok');
  assert.equal(inspectionPenalty(15001), '+2');
  assert.equal(inspectionPenalty(17000), '+2');
  assert.equal(inspectionPenalty(17001), 'dnf');
});

test('ao5 drops best and worst and rounds to the hundredth', () => {
  assert.equal(average([1000, 1100, 1200, 1300, 9000]), 1200);
  assert.equal(average([1234, 1235, 1236, 500, 9000]), 1235);
  assert.equal(average([1000, 1000, 1001, 1, 9999]), 1000); // 1000.33 → 1000
  assert.equal(average([1000, 1001, 1001, 1, 9999]), 1001); // 1000.67 → 1001
  assert.equal(average([1000, 1100]), null);
});

test('one DNF is the dropped worst, two make the average a DNF', () => {
  assert.equal(average([1000, 1100, 1200, 1300, DNF]), 1200);
  assert.equal(average([1000, 1100, 1200, DNF, DNF]), DNF);
  assert.equal(mean([1000, 1100, DNF]), DNF);
  assert.equal(mean([1000, 1100, 1200]), 1100);
});

test('ao12 trims one each side, ao100 trims five', () => {
  const twelve = [1, 9999, ...Array(10).fill(1500)];
  assert.equal(average(twelve), 1500);
  assert.equal(average([DNF, DNF, ...Array(10).fill(1500)]), DNF);
  const hundred = [...Array(5).fill(1), ...Array(5).fill(DNF), ...Array(90).fill(2000)];
  assert.equal(average(hundred), 2000);
  assert.equal(average([...Array(6).fill(DNF), ...Array(94).fill(2000)]), DNF);
});

test('rolling windows line up with the solve they end on', () => {
  const r = rolling([1000, 1100, 1200, 1300, 1400, 1500], 5);
  assert.deepEqual(r, [null, null, null, null, 1200, 1300]);
});

test('summarize reports current and best of each average', () => {
  const times = [20000, 18000, 19000, 17000, 16000, 15000, 30000];
  const s = summarize(times.map(ok));
  assert.equal(s.count, 7);
  assert.equal(s.best, 1500);
  assert.deepEqual(s.ao5, { current: 1733, best: 1700 });  // (17+16+19)/3 = 17.33 ; (18+17+16)/3 = 17.00
  assert.deepEqual(s.mo3, { current: 2033, best: 1600 });
  assert.deepEqual(s.ao12, { current: null, best: null });

  const withDnf = summarize([ok(10000), { ms: 9000, pen: 'dnf' }, { ms: 11000, pen: '+2' }]);
  assert.equal(withDnf.dnfs, 1);
  assert.equal(withDnf.best, 1000);
  assert.equal(withDnf.mean, 1150);
  assert.equal(withDnf.mo3.current, DNF);
  assert.equal(withDnf.mo3.best, DNF);

  const empty = summarize([]);
  assert.equal(empty.best, null);
  assert.equal(empty.ao5.current, null);
});
