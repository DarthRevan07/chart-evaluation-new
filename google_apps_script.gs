// ─────────────────────────────────────────────────────────────────────────────
// Google Apps Script — Chart Evaluation Response Collector
//
// SETUP INSTRUCTIONS:
//   1. Create a Google Sheet and rename the first tab to "Responses"
//   2. Note the Spreadsheet ID from the URL:
//      https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
//   3. Paste this script into Extensions → Apps Script (replace all default code)
//   4. Set SPREADSHEET_ID below
//   5. Click Deploy → New deployment
//        Type: Web app
//        Execute as: Me
//        Who has access: Anyone
//   6. Copy the deployment URL and paste it into GOOGLE_SCRIPT_URL in
//      simple_evaluation_slider.js
// ─────────────────────────────────────────────────────────────────────────────

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // ← replace this
const SHEET_NAME = 'Responses';

const HEADERS = [
  'timestamp', 'sessionId', 'pairId', 'table', 'question',
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

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ev = payload.evaluation || {};

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    // Write header row on first use
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    const ca = ev.chartA || {};
    const cb = ev.chartB || {};

    sheet.appendRow([
      payload.timestamp                    || new Date().toISOString(),
      payload.sessionId                    || '',
      payload.pairId                       || '',
      (ev.metadata && ev.metadata.table)   || '',
      (ev.metadata && ev.metadata.question)|| '',
      ca.imagePath                         || '',
      cb.imagePath                         || '',
      (ca.readability && ca.readability.score) || '',
      (ca.readability && ca.readability.label) || '',
      (ca.precision  && ca.precision.score)    || '',
      (ca.precision  && ca.precision.label)    || '',
      (ca.aesthetics && ca.aesthetics.score)   || '',
      (ca.aesthetics && ca.aesthetics.label)   || '',
      (cb.readability && cb.readability.score) || '',
      (cb.readability && cb.readability.label) || '',
      (cb.precision  && cb.precision.score)    || '',
      (cb.precision  && cb.precision.label)    || '',
      (cb.aesthetics && cb.aesthetics.score)   || '',
      (cb.aesthetics && cb.aesthetics.label)   || '',
      (ca.readability && ca.readability.lastUpdatedAt) || '',
      (ca.precision   && ca.precision.lastUpdatedAt)   || '',
      (ca.aesthetics  && ca.aesthetics.lastUpdatedAt)  || '',
      (cb.readability && cb.readability.lastUpdatedAt) || '',
      (cb.precision   && cb.precision.lastUpdatedAt)   || '',
      (cb.aesthetics  && cb.aesthetics.lastUpdatedAt)  || '',
      ev.overallPreference || '',
      ev.comments_a        || '',
      ev.comments_b        || '',
      ev.comments_pref     || '',
      ev.chartADisplayedAt          || '',
      ev.chartBDisplayedAt          || '',
      ev.prefDisplayedAt            || '',
      ev.preferenceLastUpdatedAt    || '',
      ev.displayedAt       || '',
      ev.savedAt           || '',
      (ev.timeToSave_seconds !== null && ev.timeToSave_seconds !== undefined) ? ev.timeToSave_seconds : '',
      payload.userAgent    || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
