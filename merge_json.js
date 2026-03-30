const fs = require('fs');

const src = JSON.parse(fs.readFileSync('./question_annotate_run2_filtered.json', 'utf8'));
const dst = JSON.parse(fs.readFileSync('./annotate_slider.json', 'utf8'));

const existingKeys = new Set(
  dst.annotations.map(e => e.table + '|' + e.summary_idx + '|' + e.question_idx)
);

const newEntries = src.annotations.filter(
  e => !existingKeys.has(e.table + '|' + e.summary_idx + '|' + e.question_idx)
);

console.log('annotate_slider.json entries:', dst.annotations.length);
console.log('question_annotate_run2_filtered.json entries:', src.annotations.length);
console.log('Unique entries to add:', newEntries.length);

dst.annotations.push(...newEntries);
dst.metadata.total_entries = dst.annotations.length;
dst.metadata.merged_from = 'question_annotate_run2_filtered.json';
dst.metadata.merged_timestamp = new Date().toISOString().slice(0, 10);

fs.writeFileSync('./annotate_slider.json', JSON.stringify(dst, null, 2));
console.log('Done. New total:', dst.annotations.length);
