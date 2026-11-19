// Generates random-state scrambles off the main thread, so building the
// solver's tables and the occasional slow search never freeze the timer.
import { initTables, randomScramble } from './scrambler.js';

self.onmessage = e => {
  if (e.data?.type !== 'scramble') return;
  self.postMessage({ type: 'scramble', scramble: randomScramble().scramble });
};

initTables();
