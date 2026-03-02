export type DiscreteOption = { value: string; label: string; hint: string };

export type Question =
  | {
      id: string;
      kind: 'discrete-slider';
      prompt: string;
      options: DiscreteOption[];
    }
  | {
      id: string;
      kind: 'checkbox-group';
      prompt: string;
      options: DiscreteOption[];
      maxSelect?: number;
    };

export const QUESTIONS: Question[] = [
  {
    id: 'clarity',
    kind: 'discrete-slider',
    prompt: 'Clarity / ease of reading',
    options: [
      { value: 'A', label: 'A better', hint: 'Chart A is noticeably clearer or easier to parse.' },
      { value: 'slightlyA', label: 'A slightly', hint: 'Chart A is a bit clearer, but difference is small.' },
      { value: 'same', label: 'Same', hint: 'No meaningful clarity difference.' },
      { value: 'slightlyB', label: 'B slightly', hint: 'Chart B is a bit clearer, but difference is small.' },
      { value: 'B', label: 'B better', hint: 'Chart B is noticeably clearer or easier to parse.' },
    ],
  },
  {
    id: 'clutter',
    kind: 'discrete-slider',
    prompt: 'Clutter / visual overload',
    options: [
      { value: 'A', label: 'A less cluttered', hint: 'A feels cleaner; fewer distracting elements.' },
      { value: 'same', label: 'Same', hint: 'Both have similar clutter level.' },
      { value: 'B', label: 'B less cluttered', hint: 'B feels cleaner; fewer distracting elements.' },
      { value: 'NA', label: 'N/A', hint: 'Not applicable / cannot judge clutter here.' },
    ],
  },
  {
    id: 'issues',
    kind: 'checkbox-group',
    prompt: 'If any issues are present (select all that apply)',
    options: [
      { value: 'axis', label: 'Axis / scale issue', hint: 'Misleading or unclear scale, ticks, or baseline.' },
      { value: 'labels', label: 'Labeling issue', hint: 'Missing/ambiguous labels, legend, or units.' },
      { value: 'encoding', label: 'Encoding issue', hint: 'Chart type or visual encoding is inappropriate.' },
      { value: 'none', label: 'No issues', hint: 'No obvious issues.' },
    ],
    maxSelect: 3,
  },
];
