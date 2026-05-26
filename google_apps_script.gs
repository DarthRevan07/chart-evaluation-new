// ─────────────────────────────────────────────────────────────────────────────
// Google Apps Script — Assignment + Response Collector
//
// Supports two POST actions:
// 1) action: "assign_entries"   -> returns 15 assigned entry IDs for a session
// 2) regular submission payload  -> writes evaluation responses
//
// Assignment guarantees:
// - Session sticky: same sessionId gets same assignment on repeat requests.
// - Counter-based balancing: entries with lower assignment counts are prioritized.
// - Uses script lock to avoid race conditions under concurrent users.
// ─────────────────────────────────────────────────────────────────────────────

const SPREADSHEET_ID = '1zeTt5v5XPtdVJ9yEy_N7Mlr2o2Mp54gM8YC81hE2XT4'; // replace this
const RESPONSES_SHEET = 'CrowdResponses';
const ASSIGNMENTS_SHEET = 'AssignmentCounts';
const SESSION_ASSIGNMENTS_SHEET = 'SessionAssignments';
const COMPLETION_COUNTS_SHEET = 'CompletionCounts';
const COMPLETION_LOG_SHEET = 'CompletionLog';

const RESPONSE_HEADERS = [
  'timestamp', 'sessionId', 'pairId', 'entryId', 'artefact', 'table', 'question',
  'chartA_path', 'chartB_path',
  'chartA_readability_score', 'chartA_readability_label',
  'chartA_precision_score',   'chartA_precision_label',
  'chartA_aesthetics_score',  'chartA_aesthetics_label',
  'chartB_readability_score', 'chartB_readability_label',
  'chartB_precision_score',   'chartB_precision_label',
  'chartB_aesthetics_score',  'chartB_aesthetics_label',
  'chartA_readability_updatedAt', 'chartA_precision_updatedAt', 'chartA_aesthetics_updatedAt',
  'chartB_readability_updatedAt', 'chartB_precision_updatedAt', 'chartB_aesthetics_updatedAt',
  'overallPreference', 'comments_a', 'comments_b', 'comments_pref',
  'chartADisplayedAt', 'chartBDisplayedAt',
  'prefDisplayedAt', 'preferenceLastUpdatedAt',
  'displayedAt', 'savedAt', 'timeToSave_seconds',
  'userAgent'
];

const ASSIGNMENT_HEADERS = ['entryId', 'assignedCount', 'lastAssignedAt'];
const SESSION_HEADERS = ['sessionId', 'assignedAt', 'sampleSize', 'targetPerEntry', 'entryIdsJson'];
const COMPLETION_COUNT_HEADERS = ['entryId', 'completedCount', 'lastCompletedAt'];
const COMPLETION_LOG_HEADERS = ['sessionId', 'entryId', 'loggedAt'];

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  return JSON.parse(e.postData.contents);
}

function balancedPick(entryIds, countById, pickCount) {
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
      const j = Math.floor(Math.random() * (i + 1));
      const temp = bucket[i];
      bucket[i] = bucket[j];
      bucket[j] = temp;
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

function loadCountMap(sheet, headerLength) {
  const map = {};
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return map;

  const width = headerLength || ASSIGNMENT_HEADERS.length;
  const rows = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  rows.forEach(row => {
    const id = String(row[0] || '').trim();
    if (!id) return;
    map[id] = Number(row[1] || 0);
  });
  return map;
}

function writeCountMap(sheet, map, headers) {
  const width = (headers && headers.length) ? headers.length : ASSIGNMENT_HEADERS.length;
  const ids = Object.keys(map);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, width).clearContent();
  }
  if (ids.length === 0) return;

  const now = new Date().toISOString();
  const rows = ids.map(id => [id, map[id], now]);
  sheet.getRange(2, 1, rows.length, width).setValues(rows);
}

function loadCompletionKeySet(sheet) {
  const keySet = {};
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return keySet;

  const rows = sheet.getRange(2, 1, lastRow - 1, COMPLETION_LOG_HEADERS.length).getValues();
  rows.forEach(row => {
    const sessionId = String(row[0] || '').trim();
    const entryId = String(row[1] || '').trim();
    if (!sessionId || !entryId) return;
    keySet[sessionId + '||' + entryId] = true;
  });
  return keySet;
}

function updateCompletionCoverage(submissions, ss) {
  const completionCountSheet = getOrCreateSheet(ss, COMPLETION_COUNTS_SHEET, COMPLETION_COUNT_HEADERS);
  const completionLogSheet = getOrCreateSheet(ss, COMPLETION_LOG_SHEET, COMPLETION_LOG_HEADERS);

  const completionMap = loadCountMap(completionCountSheet, COMPLETION_COUNT_HEADERS.length);
  const completionKeySet = loadCompletionKeySet(completionLogSheet);
  const newLogRows = [];
  const now = new Date().toISOString();
  let increments = 0;

  for (const p of submissions) {
    const ev = p.evaluation || {};
    const md = ev.metadata || {};
    const sessionId = String(p.sessionId || '').trim();
    const entryId = String(md.entry_id || p.pairId || '').trim();
    const isComplete = !!(ev.overallPreference);

    if (!sessionId || !entryId || !isComplete) continue;

    const dedupeKey = sessionId + '||' + entryId;
    if (completionKeySet[dedupeKey]) continue;

    completionKeySet[dedupeKey] = true;
    completionMap[entryId] = Number(completionMap[entryId] || 0) + 1;
    newLogRows.push([sessionId, entryId, now]);
    increments++;
  }

  if (newLogRows.length > 0) {
    completionLogSheet
      .getRange(completionLogSheet.getLastRow() + 1, 1, newLogRows.length, COMPLETION_LOG_HEADERS.length)
      .setValues(newLogRows);
    writeCountMap(completionCountSheet, completionMap, COMPLETION_COUNT_HEADERS);
  }

  return increments;
}

function findExistingSessionAssignment(sheet, sessionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;

  const rows = sheet.getRange(2, 1, lastRow - 1, SESSION_HEADERS.length).getValues();
  for (let i = 0; i < rows.length; i++) {
    const rowSession = String(rows[i][0] || '');
    if (rowSession !== sessionId) continue;
    try {
      const entryIds = JSON.parse(rows[i][4] || '[]');
      if (Array.isArray(entryIds) && entryIds.length > 0) {
        return entryIds;
      }
    } catch (_) {
      return null;
    }
  }
  return null;
}

function appendSessionAssignment(sheet, sessionId, entryIds, sampleSize, targetPerEntry) {
  sheet.appendRow([
    sessionId,
    new Date().toISOString(),
    sampleSize,
    targetPerEntry,
    JSON.stringify(entryIds)
  ]);
}

function assignEntries(payload, ss) {
  const sessionId = String(payload.sessionId || '').trim();
  const allEntryIds = Array.isArray(payload.entryIds) ? payload.entryIds.map(String) : [];
  const sampleSize = Math.max(1, Number(payload.sampleSize || 15));
  const targetPerEntry = Math.max(1, Number(payload.targetPerEntry || 5));

  if (!sessionId) return { status: 'error', message: 'sessionId is required' };
  if (allEntryIds.length === 0) return { status: 'error', message: 'entryIds is required' };

  const assignmentSheet = getOrCreateSheet(ss, ASSIGNMENTS_SHEET, ASSIGNMENT_HEADERS);
  const sessionSheet = getOrCreateSheet(ss, SESSION_ASSIGNMENTS_SHEET, SESSION_HEADERS);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const existing = findExistingSessionAssignment(sessionSheet, sessionId);
    if (existing && existing.length > 0) {
      return {
        status: 'ok',
        source: 'existing',
        assignedEntryIds: existing
      };
    }

    const countById = loadCountMap(assignmentSheet);
    allEntryIds.forEach(id => {
      if (typeof countById[id] !== 'number') countById[id] = 0;
    });

    const underTarget = allEntryIds.filter(id => (countById[id] || 0) < targetPerEntry);
    let selected = balancedPick(underTarget, countById, Math.min(sampleSize, underTarget.length));

    if (selected.length < sampleSize) {
      const selectedSet = new Set(selected);
      const remaining = allEntryIds.filter(id => !selectedSet.has(id));
      const filler = balancedPick(remaining, countById, Math.min(sampleSize - selected.length, remaining.length));
      selected = selected.concat(filler);
    }

    selected.forEach(id => {
      countById[id] = (countById[id] || 0) + 1;
    });

    writeCountMap(assignmentSheet, countById, ASSIGNMENT_HEADERS);
    appendSessionAssignment(sessionSheet, sessionId, selected, sampleSize, targetPerEntry);

    const remainingUnderTarget = allEntryIds.filter(id => (countById[id] || 0) < targetPerEntry).length;
    return {
      status: 'ok',
      source: 'new',
      assignedEntryIds: selected,
      remainingUnderTarget
    };
  } finally {
    lock.releaseLock();
  }
}

function getCoverageStats(payload, ss) {
  const allEntryIds = Array.isArray(payload.entryIds) ? payload.entryIds.map(String) : [];
  const targetPerEntry = Math.max(1, Number(payload.targetPerEntry || 5));

  const assignmentSheet = getOrCreateSheet(ss, ASSIGNMENTS_SHEET, ASSIGNMENT_HEADERS);
  const countById = loadCountMap(assignmentSheet, ASSIGNMENT_HEADERS.length);
  const completionSheet = getOrCreateSheet(ss, COMPLETION_COUNTS_SHEET, COMPLETION_COUNT_HEADERS);
  const completedById = loadCountMap(completionSheet, COMPLETION_COUNT_HEADERS.length);

  const ids = allEntryIds.length > 0 ? allEntryIds : Object.keys(countById);
  const totalEntries = ids.length;
  if (totalEntries === 0) {
    return {
      status: 'ok',
      totalEntries: 0,
      targetPerEntry,
      coveredEntries: 0,
      uncoveredEntries: 0,
      completionPercent: 0,
      completionCoveredEntries: 0,
      completionUncoveredEntries: 0,
      completionCoveragePercent: 0,
      minAssignedCount: 0,
      maxAssignedCount: 0,
      averageAssignedCount: 0,
      minCompletedCount: 0,
      maxCompletedCount: 0,
      averageCompletedCount: 0,
      totalAssignments: 0,
      totalCompletions: 0,
      remainingAssignmentsToTarget: 0,
      remainingCompletionsToTarget: 0,
      worstEntries: []
    };
  }

  const rows = ids.map(id => ({
    entryId: id,
    assignedCount: Number(countById[id] || 0),
    completedCount: Number(completedById[id] || 0)
  }));

  let coveredEntries = 0;
  let completionCoveredEntries = 0;
  let totalAssignments = 0;
  let totalCompletions = 0;
  let minAssignedCount = Number.MAX_SAFE_INTEGER;
  let maxAssignedCount = 0;
  let minCompletedCount = Number.MAX_SAFE_INTEGER;
  let maxCompletedCount = 0;
  let remainingAssignmentsToTarget = 0;
  let remainingCompletionsToTarget = 0;

  rows.forEach(r => {
    if (r.assignedCount >= targetPerEntry) coveredEntries++;
    if (r.completedCount >= targetPerEntry) completionCoveredEntries++;
    totalAssignments += r.assignedCount;
    totalCompletions += r.completedCount;
    if (r.assignedCount < minAssignedCount) minAssignedCount = r.assignedCount;
    if (r.assignedCount > maxAssignedCount) maxAssignedCount = r.assignedCount;
    if (r.completedCount < minCompletedCount) minCompletedCount = r.completedCount;
    if (r.completedCount > maxCompletedCount) maxCompletedCount = r.completedCount;
    if (r.assignedCount < targetPerEntry) {
      remainingAssignmentsToTarget += (targetPerEntry - r.assignedCount);
    }
    if (r.completedCount < targetPerEntry) {
      remainingCompletionsToTarget += (targetPerEntry - r.completedCount);
    }
  });

  rows.sort((a, b) => a.completedCount - b.completedCount || a.assignedCount - b.assignedCount);
  const worstEntries = rows.slice(0, 10);

  return {
    status: 'ok',
    totalEntries,
    targetPerEntry,
    coveredEntries,
    uncoveredEntries: totalEntries - coveredEntries,
    completionPercent: Number(((coveredEntries / totalEntries) * 100).toFixed(2)),
    completionCoveredEntries,
    completionUncoveredEntries: totalEntries - completionCoveredEntries,
    completionCoveragePercent: Number(((completionCoveredEntries / totalEntries) * 100).toFixed(2)),
    minAssignedCount,
    maxAssignedCount,
    averageAssignedCount: Number((totalAssignments / totalEntries).toFixed(3)),
    minCompletedCount,
    maxCompletedCount,
    averageCompletedCount: Number((totalCompletions / totalEntries).toFixed(3)),
    totalAssignments,
    totalCompletions,
    remainingAssignmentsToTarget,
    remainingCompletionsToTarget,
    worstEntries
  };
}

function writeResponses(payload, ss) {
  const sheet = getOrCreateSheet(ss, RESPONSES_SHEET, RESPONSE_HEADERS);

  const submissions = Array.isArray(payload.submissions)
    ? payload.submissions
    : [payload];

  for (const p of submissions) {
    const ev = p.evaluation || {};
    const ca = ev.chartA || {};
    const cb = ev.chartB || {};
    const md = ev.metadata || {};

    sheet.appendRow([
      p.timestamp || new Date().toISOString(),
      p.sessionId || '',
      p.pairId || '',
      md.entry_id || '',
      md.artefact || '',
      md.table || '',
      md.question || '',
      ca.imagePath || '',
      cb.imagePath || '',
      (ca.readability && ca.readability.score) || '',
      (ca.readability && ca.readability.label) || '',
      (ca.precision && ca.precision.score) || '',
      (ca.precision && ca.precision.label) || '',
      (ca.aesthetics && ca.aesthetics.score) || '',
      (ca.aesthetics && ca.aesthetics.label) || '',
      (cb.readability && cb.readability.score) || '',
      (cb.readability && cb.readability.label) || '',
      (cb.precision && cb.precision.score) || '',
      (cb.precision && cb.precision.label) || '',
      (cb.aesthetics && cb.aesthetics.score) || '',
      (cb.aesthetics && cb.aesthetics.label) || '',
      (ca.readability && ca.readability.lastUpdatedAt) || '',
      (ca.precision && ca.precision.lastUpdatedAt) || '',
      (ca.aesthetics && ca.aesthetics.lastUpdatedAt) || '',
      (cb.readability && cb.readability.lastUpdatedAt) || '',
      (cb.precision && cb.precision.lastUpdatedAt) || '',
      (cb.aesthetics && cb.aesthetics.lastUpdatedAt) || '',
      ev.overallPreference || '',
      ev.comments_a || '',
      ev.comments_b || '',
      ev.comments_pref || '',
      ev.chartADisplayedAt || '',
      ev.chartBDisplayedAt || '',
      ev.prefDisplayedAt || '',
      ev.preferenceLastUpdatedAt || '',
      ev.displayedAt || '',
      ev.savedAt || '',
      (ev.timeToSave_seconds !== null && ev.timeToSave_seconds !== undefined) ? ev.timeToSave_seconds : '',
      p.userAgent || ''
    ]);
  }

  // Completion coverage is counted once per (sessionId, entryId) for complete submissions.
  let completionUpdates = 0;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    completionUpdates = updateCompletionCoverage(submissions, ss);
  } finally {
    lock.releaseLock();
  }

  return { status: 'ok', count: submissions.length, completionUpdates };
}

function doPost(e) {
  try {
    const payload = parsePayload(e);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (payload.action === 'assign_entries') {
      return jsonResponse(assignEntries(payload, ss));
    }

    if (payload.action === 'get_coverage_stats') {
      return jsonResponse(getCoverageStats(payload, ss));
    }

    return jsonResponse(writeResponses(payload, ss));
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}
