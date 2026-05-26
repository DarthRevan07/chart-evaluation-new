const assert = require('assert');

function applyCompletionUpdates({ existingKeys, completionMap, submissions }) {
  const keySet = new Set(existingKeys);
  let increments = 0;

  for (const p of submissions) {
    const ev = p.evaluation || {};
    const md = ev.metadata || {};
    const sessionId = String(p.sessionId || '').trim();
    const entryId = String(md.entry_id || p.pairId || '').trim();
    const isComplete = !!ev.overallPreference;

    if (!sessionId || !entryId || !isComplete) continue;

    const key = `${sessionId}||${entryId}`;
    if (keySet.has(key)) continue;

    keySet.add(key);
    completionMap.set(entryId, (completionMap.get(entryId) || 0) + 1);
    increments++;
  }

  return { increments, keySet, completionMap };
}

function testDedupesSameSessionSameEntry() {
  const completionMap = new Map();
  const existingKeys = [];

  const submissions = [
    {
      sessionId: 'u1',
      pairId: 'entry_1',
      evaluation: {
        metadata: { entry_id: 'entry_1' },
        overallPreference: 'Chart A'
      }
    },
    {
      sessionId: 'u1',
      pairId: 'entry_1',
      evaluation: {
        metadata: { entry_id: 'entry_1' },
        overallPreference: 'Chart B'
      }
    }
  ];

  const result = applyCompletionUpdates({ existingKeys, completionMap, submissions });

  assert.strictEqual(result.increments, 1, 'duplicate completion should not increment twice');
  assert.strictEqual(result.completionMap.get('entry_1'), 1, 'entry_1 completion count should be 1');
  console.log('PASS testDedupesSameSessionSameEntry');
}

function testCountsDistinctUsersForSameEntry() {
  const completionMap = new Map();
  const existingKeys = [];

  const submissions = [
    {
      sessionId: 'u1',
      pairId: 'entry_9',
      evaluation: {
        metadata: { entry_id: 'entry_9' },
        overallPreference: 'Chart A'
      }
    },
    {
      sessionId: 'u2',
      pairId: 'entry_9',
      evaluation: {
        metadata: { entry_id: 'entry_9' },
        overallPreference: 'Chart B'
      }
    }
  ];

  const result = applyCompletionUpdates({ existingKeys, completionMap, submissions });

  assert.strictEqual(result.increments, 2, 'distinct sessions should each increment');
  assert.strictEqual(result.completionMap.get('entry_9'), 2, 'entry_9 completion count should be 2');
  console.log('PASS testCountsDistinctUsersForSameEntry');
}

function testIgnoresIncompleteSubmissions() {
  const completionMap = new Map();
  const existingKeys = [];

  const submissions = [
    {
      sessionId: 'u1',
      pairId: 'entry_2',
      evaluation: {
        metadata: { entry_id: 'entry_2' },
        overallPreference: ''
      }
    },
    {
      sessionId: 'u2',
      pairId: 'entry_2',
      evaluation: {
        metadata: { entry_id: 'entry_2' }
      }
    }
  ];

  const result = applyCompletionUpdates({ existingKeys, completionMap, submissions });

  assert.strictEqual(result.increments, 0, 'incomplete submissions should not increment');
  assert.strictEqual(result.completionMap.get('entry_2') || 0, 0, 'entry_2 completion count should remain 0');
  console.log('PASS testIgnoresIncompleteSubmissions');
}

function main() {
  testDedupesSameSessionSameEntry();
  testCountsDistinctUsersForSameEntry();
  testIgnoresIncompleteSubmissions();
  console.log('All completion coverage tests passed.');
}

main();
