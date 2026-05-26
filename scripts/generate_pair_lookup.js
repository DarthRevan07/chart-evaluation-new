const fs = require('fs');
const path = require('path');

function toStableEntryId(entry, index) {
  if (entry && entry.entry_id) return String(entry.entry_id);

  const tableId = String(entry.table_id ?? entry.table ?? '');
  const summaryIdx = entry.summary_idx ?? 0;
  const questionIdx = entry.question_idx ?? 0;
  const artefact = entry.artefact || 'src';
  const variants = Array.isArray(entry.variants) ? entry.variants : [];

  // Keep this exactly aligned with annotation_data_loader_slider.js normalization logic.
  return `${artefact}_${tableId}_s${summaryIdx}_q${questionIdx}_${variants.join('__') || index}`;
}

function csvEscape(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function main() {
  const workspaceRoot = process.cwd();
  const inputPath = path.join(workspaceRoot, 'integrated', 'sampled_all.json');
  const outJsonPath = path.join(workspaceRoot, 'integrated', 'pair_lookup.json');
  const outCsvPath = path.join(workspaceRoot, 'integrated', 'pair_lookup.csv');

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const entries = raw.entries || raw.annotations || [];

  const records = entries.map((entry, index) => {
    const entryId = toStableEntryId(entry, index);
    const pairId = entryId;

    const tableId = String(entry.table_id ?? entry.table ?? '');
    const summaryIdx = entry.summary_idx ?? '';
    const questionIdx = entry.question_idx ?? '';
    const artefact = entry.artefact || '';
    const questionText = entry.question_text || entry.question_string || '';
    const renderedPath = entry.rendered_path || '';

    const variants = Array.isArray(entry.variants) ? entry.variants : [];
    const variantA = variants[0] || '';
    const variantB = variants[1] || '';

    return {
      row_index: index,
      pairId,
      entryId,
      artefact,
      table_id: tableId,
      summary_idx: summaryIdx,
      question_idx: questionIdx,
      question_text: questionText,
      rendered_path: renderedPath,
      variant_a: variantA,
      variant_b: variantB
    };
  });

  fs.writeFileSync(outJsonPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    source: 'integrated/sampled_all.json',
    total_records: records.length,
    records
  }, null, 2));

  const header = [
    'row_index',
    'pairId',
    'entryId',
    'artefact',
    'table_id',
    'summary_idx',
    'question_idx',
    'question_text',
    'rendered_path',
    'variant_a',
    'variant_b'
  ];

  const csvLines = [header.join(',')];
  for (const r of records) {
    csvLines.push([
      r.row_index,
      r.pairId,
      r.entryId,
      r.artefact,
      r.table_id,
      r.summary_idx,
      r.question_idx,
      r.question_text,
      r.rendered_path,
      r.variant_a,
      r.variant_b
    ].map(csvEscape).join(','));
  }

  fs.writeFileSync(outCsvPath, csvLines.join('\n'));

  console.log(`Generated lookup files:`);
  console.log(`- ${path.relative(workspaceRoot, outJsonPath)} (${records.length} records)`);
  console.log(`- ${path.relative(workspaceRoot, outCsvPath)} (${records.length} records)`);
}

main();
