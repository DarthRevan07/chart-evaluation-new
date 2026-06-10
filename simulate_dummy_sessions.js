// ─────────────────────────────────────────────────────────────────────────────
// Dummy-session load test for the chart-evaluation backend.
//
// Spins up N fake participant sessions. Each session:
//   1. Calls the Apps Script `assign_entries` action to receive its quota-aware
//      set of entry IDs (same path the real UI uses).
//   2. Generates RANDOM slider scores (0-4) for all 6 dimensions and a random
//      overall preference for every assigned pair.
//   3. Submits the whole batch to the backend exactly like submitSimpleEvaluation().
//
// Every dummy session id is prefixed with DUMMY_PREFIX so the rows are trivial to
// find and delete from the sheets afterwards.
//
// Run:  node simulate_dummy_sessions.js [numUsers]
// e.g.  node simulate_dummy_sessions.js 40
//
// Requires Node 18+ (uses the built-in global fetch).
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbz1Iv6wcCWnWv_8fqLRLVRl11gKjRMg3w3jUcf_2XZyqYbbt73j4-Mo3mLdFl4tXDkcdw/exec';
const DATA_FILE = path.join(__dirname, 'integrated', 'sampled_all.json');

const NUM_USERS = Number(process.argv[2] || 40);
const SAMPLE_SIZE = 25;
const TARGET_PER_ENTRY = 5;
const DUMMY_PREFIX = 'dummytest_'; // delete rows whose sessionId starts with this

// ─── Helpers that mirror annotation_data_loader_slider.js ────────────────────
const SLIDER_LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
const PREFERENCES = ['Chart A', 'Chart B', 'Both similar'];

function normalizePath(p) {
  return String(p || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function buildChartBasePath(renderedPath) {
  const rp = normalizePath(renderedPath);
  if (!rp) return '';
  if (rp.startsWith('integrated/')) return rp;
  if (rp.startsWith('charts/')) return `integrated/${rp}`;
  return `integrated/charts/${rp}`;
}

function extractVariants(rawVariants) {
  if (Array.isArray(rawVariants)) {
    return rawVariants.map(v => String(v || '').trim()).filter(Boolean);
  }
  if (rawVariants && typeof rawVariants === 'object') {
    return Object.values(rawVariants).map(v => String(v || '').trim()).filter(Boolean);
  }
  return [];
}

function buildVariantPath(basePath, variant) {
  const v = normalizePath(variant);
  if (!v) return '';
  if (v.startsWith('charts/')) return `integrated/${v}`;
  return basePath ? `${basePath}/${v}` : v;
}

// Replicate normalizeEntry() for integrated entries, keeping only entries with >=2 variants.
function loadEntries() {
  const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const rawEntries = raw.entries || raw.annotations || [];
  const out = [];
  for (const entry of rawEntries) {
    const tableId = String(entry.table_id ?? '');
    const variants = extractVariants(entry.variants).slice(0, 2);
    if (variants.length < 2) continue;
    const basePath = buildChartBasePath(entry.rendered_path || '');
    const entryId = `${entry.artefact || 'src'}_${tableId}_s${entry.summary_idx || 0}_q${entry.question_idx || 0}_${variants.join('__')}`;
    out.push({
      entry_id: entryId,
      artefact: entry.artefact || '',
      table: tableId,
      question: entry.question_text || '',
      variants,
      chartA_path: buildVariantPath(basePath, variants[0]),
      chartB_path: buildVariantPath(basePath, variants[1])
    });
  }
  return out;
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function makeSliderValue(score, ts) {
  return { score, label: SLIDER_LABELS[score] ?? String(score), lastUpdatedAt: ts };
}

function buildRandomEvaluation(entry) {
  const now = new Date();
  const displayedAt = new Date(now.getTime() - randInt(20000, 120000)).toISOString();
  const ts = now.toISOString();
  const dim = () => makeSliderValue(randInt(0, 4), ts);
  return {
    pairId: entry.entry_id,
    metadata: {
      entry_id: entry.entry_id,
      artefact: entry.artefact,
      table: entry.table,
      question: entry.question,
      variants: entry.variants
    },
    chartA: {
      readability: dim(),
      precision: dim(),
      aesthetics: dim(),
      imagePath: entry.chartA_path
    },
    chartB: {
      readability: dim(),
      precision: dim(),
      aesthetics: dim(),
      imagePath: entry.chartB_path
    },
    overallPreference: pick(PREFERENCES),
    comments_a: '',
    comments_b: '',
    comments_pref: '',
    comments: '',
    completed: true,
    displayedAt,
    savedAt: ts,
    timestamp: ts,
    timeToSave_seconds: randInt(10, 90),
    chartADisplayedAt: displayedAt,
    chartBDisplayedAt: displayedAt,
    prefDisplayedAt: ts,
    preferenceLastUpdatedAt: ts,
    displayedImages: { chartA: entry.chartA_path, chartB: entry.chartB_path },
    sliderTimestamps: {}
  };
}

async function postJson(body) {
  const res = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
    redirect: 'follow'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function runSession(sessionId, entries, entryById) {
  const allIds = entries.map(e => e.entry_id);

  // 1. Ask the backend for this session's assignment (quota-aware).
  const assignResp = await postJson({
    action: 'assign_entries',
    sessionId,
    entryIds: allIds,
    sampleSize: SAMPLE_SIZE,
    targetPerEntry: TARGET_PER_ENTRY
  });

  let assignedIds = Array.isArray(assignResp.assignedEntryIds) ? assignResp.assignedEntryIds : [];
  if (assignedIds.length === 0) {
    // Fallback: random local sample so the test still exercises submission.
    assignedIds = [...allIds].sort(() => Math.random() - 0.5).slice(0, SAMPLE_SIZE);
  }

  // 2. Build random evaluations for each assigned pair.
  const now = new Date().toISOString();
  const submissions = assignedIds.map(id => {
    const entry = entryById.get(id) || { entry_id: id, artefact: '', table: '', question: '', variants: [], chartA_path: '', chartB_path: '' };
    return {
      pairId: id,
      evaluation: buildRandomEvaluation(entry),
      userAgent: 'dummy-load-test/1.0',
      timestamp: now,
      sessionId,
      participantId: sessionId,
      participantName: sessionId,
      participantEmail: `${sessionId}@example.test`,
      url: 'https://dummy.local/load-test',
      isPartial: false
    };
  });

  // 3. Submit the whole batch.
  const writeResp = await postJson({ submissions });
  return { assigned: assignedIds.length, submitted: submissions.length, writeResp, source: assignResp.source };
}

async function main() {
  const entries = loadEntries();
  const entryById = new Map(entries.map(e => [e.entry_id, e]));
  console.log(`Loaded ${entries.length} eligible entries from ${path.basename(DATA_FILE)}`);
  console.log(`Simulating ${NUM_USERS} dummy sessions (sampleSize=${SAMPLE_SIZE}, targetPerEntry=${TARGET_PER_ENTRY})`);
  console.log(`Session id prefix: "${DUMMY_PREFIX}"  (use this to clean up the sheets later)\n`);

  const runStamp = Date.now();
  let ok = 0;
  let fail = 0;

  // Sequential to stay friendly with the Apps Script LockService on assign_entries.
  for (let i = 1; i <= NUM_USERS; i++) {
    const sessionId = `${DUMMY_PREFIX}${runStamp}_${String(i).padStart(3, '0')}`;
    try {
      const r = await runSession(sessionId, entries, entryById);
      ok++;
      console.log(`[${i}/${NUM_USERS}] ${sessionId}  assigned=${r.assigned} submitted=${r.submitted} source=${r.source || 'n/a'} status=${r.writeResp?.status || 'n/a'}`);
    } catch (err) {
      fail++;
      console.error(`[${i}/${NUM_USERS}] ${sessionId}  FAILED: ${err.message}`);
    }
  }

  console.log(`\nDone. ${ok} succeeded, ${fail} failed.`);
  console.log(`To clean up: delete CrowdResponses / SessionAssignments / AssignmentCounts / CompletionCounts / CompletionLog rows whose sessionId starts with "${DUMMY_PREFIX}".`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
