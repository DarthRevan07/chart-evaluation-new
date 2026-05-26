const assert = require('assert');

function balancedPick(entryIds, countById, pickCount, rng = Math.random) {
  const remaining = entryIds.slice();
  const picked = [];

  while (picked.length < pickCount && remaining.length > 0) {
    let minCount = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < remaining.length; i++) {
      const id = remaining[i];
      const c = countById[id] || 0;
      if (c < minCount) minCount = c;
    }

    const bucket = [];
    for (let i = 0; i < remaining.length; i++) {
      const id = remaining[i];
      if ((countById[id] || 0) === minCount) bucket.push(id);
    }

    for (let i = bucket.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = bucket[i];
      bucket[i] = bucket[j];
      bucket[j] = tmp;
    }

    while (bucket.length > 0 && picked.length < pickCount) {
      const id = bucket.pop();
      picked.push(id);
      const idx = remaining.indexOf(id);
      if (idx >= 0) remaining.splice(idx, 1);
    }
  }

  return picked;
}

function assignEntries({ sessionId, allEntryIds, sampleSize, targetPerEntry, sessionMap, countById, rng }) {
  if (sessionMap.has(sessionId)) {
    return sessionMap.get(sessionId);
  }

  const underTarget = allEntryIds.filter(id => (countById.get(id) || 0) < targetPerEntry);
  let selected = balancedPick(underTarget, Object.fromEntries(countById), Math.min(sampleSize, underTarget.length), rng);

  if (selected.length < sampleSize) {
    const selectedSet = new Set(selected);
    const remaining = allEntryIds.filter(id => !selectedSet.has(id));
    const fill = balancedPick(remaining, Object.fromEntries(countById), Math.min(sampleSize - selected.length, remaining.length), rng);
    selected = selected.concat(fill);
  }

  selected.forEach(id => countById.set(id, (countById.get(id) || 0) + 1));
  sessionMap.set(sessionId, selected);
  return selected;
}

function makeSeededRandom(seed) {
  let state = seed >>> 0;
  return function rng() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function runSimulation({ users, entries, sampleSize, targetPerEntry, seed }) {
  const rng = makeSeededRandom(seed);
  const allEntryIds = Array.from({ length: entries }, (_, i) => `entry_${i}`);
  const sessionMap = new Map();
  const countById = new Map(allEntryIds.map(id => [id, 0]));

  for (let i = 0; i < users; i++) {
    const sessionId = `session_${i}`;
    const assigned = assignEntries({
      sessionId,
      allEntryIds,
      sampleSize,
      targetPerEntry,
      sessionMap,
      countById,
      rng
    });

    assert.strictEqual(assigned.length, sampleSize, `session ${sessionId} should receive ${sampleSize}`);
    assert.strictEqual(new Set(assigned).size, assigned.length, `session ${sessionId} should not contain duplicate entries`);
  }

  const counts = allEntryIds.map(id => countById.get(id));
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const total = counts.reduce((a, b) => a + b, 0);

  assert.strictEqual(total, users * sampleSize, 'total assignments mismatch');

  return { min, max, total, counts, entries, users, sampleSize, targetPerEntry };
}

function testCoverageFor80Users() {
  const result = runSimulation({
    users: 80,
    entries: 209,
    sampleSize: 15,
    targetPerEntry: 5,
    seed: 42
  });

  assert.ok(
    result.min >= 5,
    `expected minimum coverage >= 5 but got ${result.min}`
  );

  console.log('PASS testCoverageFor80Users', result);
}

function testStickySessionDoesNotDoubleCount() {
  const rng = makeSeededRandom(123);
  const allEntryIds = Array.from({ length: 209 }, (_, i) => `entry_${i}`);
  const sessionMap = new Map();
  const countById = new Map(allEntryIds.map(id => [id, 0]));

  const first = assignEntries({
    sessionId: 'session_repeat',
    allEntryIds,
    sampleSize: 15,
    targetPerEntry: 5,
    sessionMap,
    countById,
    rng
  });

  const totalAfterFirst = Array.from(countById.values()).reduce((a, b) => a + b, 0);

  const second = assignEntries({
    sessionId: 'session_repeat',
    allEntryIds,
    sampleSize: 15,
    targetPerEntry: 5,
    sessionMap,
    countById,
    rng
  });

  const totalAfterSecond = Array.from(countById.values()).reduce((a, b) => a + b, 0);

  assert.deepStrictEqual(first, second, 'same session must get same assignment');
  assert.strictEqual(totalAfterFirst, 15, 'first assignment should increment 15 counts');
  assert.strictEqual(totalAfterSecond, 15, 'repeat assignment should not increment counts');

  console.log('PASS testStickySessionDoesNotDoubleCount');
}

function main() {
  testCoverageFor80Users();
  testStickySessionDoesNotDoubleCount();
  console.log('All allocator tests passed.');
}

main();
