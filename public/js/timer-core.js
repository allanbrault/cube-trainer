// Timing rules for full solves, following the WCA regulations: times are
// truncated to the hundredth, averages are rounded, +2 and DNF behave as on a
// score sheet. Results are handled in centiseconds; DNF is Infinity.
//
// A solve is { ms, pen, scr, at }: raw milliseconds, 'ok' | '+2' | 'dnf',
// the scramble text and when it finished.

export const DNF = Infinity;
export const HOLD_MS = 550;           // a Stackmat needs about this long before it arms
export const INSPECTION_MS = 15000;

// Final result of a solve in centiseconds, penalty included
export function result(solve) {
  if (solve.pen === 'dnf') return DNF;
  return Math.floor(solve.ms / 10) + (solve.pen === '+2' ? 200 : 0);
}

// 12.34, 1:02.34, or DNF
export function format(cs) {
  if (cs == null) return '–';
  if (cs === DNF) return 'DNF';
  const cc = String(cs % 100).padStart(2, '0');
  const sec = Math.floor(cs / 100);
  if (sec < 60) return `${sec}.${cc}`;
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}.${cc}`;
}

export function formatSolve(solve) {
  if (solve.pen === 'dnf') return 'DNF';
  return format(result(solve)) + (solve.pen === '+2' ? '+' : '');
}

// Penalty for starting the solve `elapsedMs` into inspection (WCA A3d)
export function inspectionPenalty(elapsedMs) {
  if (elapsedMs <= INSPECTION_MS) return 'ok';
  return elapsedMs <= INSPECTION_MS + 2000 ? '+2' : 'dnf';
}

// Plain mean ("mo3"): any DNF makes it a DNF
export function mean(results) {
  if (!results.length) return null;
  if (results.includes(DNF)) return DNF;
  return Math.round(results.reduce((a, b) => a + b, 0) / results.length);
}

// Trimmed average ("ao5", "ao12", "ao100"): drop the best and worst 5 %
// (at least one each), a DNF counts as the worst result
export function average(results) {
  const n = results.length;
  if (n < 3) return null;
  const trim = Math.ceil(n / 20);
  const kept = results.slice().sort((a, b) => a - b).slice(trim, n - trim);
  return mean(kept);
}

// stat(results.slice(i − n + 1, i + 1)) for every i; null until n results exist
export function rolling(results, n, stat = average) {
  return results.map((_, i) => (i + 1 < n ? null : stat(results.slice(i + 1 - n, i + 1))));
}

const smallest = values => values.reduce((best, v) => (v != null && (best == null || v < best) ? v : best), null);

// Everything the stats panel shows, from the full list of solves (oldest first)
export function summarize(solves) {
  const results = solves.map(result);
  const finished = results.filter(r => r !== DNF);
  const windows = { mo3: rolling(results, 3, mean), ao5: rolling(results, 5), ao12: rolling(results, 12), ao100: rolling(results, 100) };
  const stats = { count: results.length, dnfs: results.length - finished.length, best: smallest(finished), mean: mean(finished), results, windows };
  for (const [name, series] of Object.entries(windows))
    stats[name] = { current: series.length ? series[series.length - 1] : null, best: smallest(series) };
  return stats;
}
