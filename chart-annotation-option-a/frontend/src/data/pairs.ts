export type ChartPair = {
  id: string;
  questionPrompt: string;
  leftImage: string;
  rightImage: string;
  leftLabel?: string;
  rightLabel?: string;
};

export const PAIRS: ChartPair[] = [
  {
    id: 'pair001',
    questionPrompt: 'Which chart more clearly answers: “How did revenue change over time?”',
    leftImage: '/stimuli/pair001_a.png',
    rightImage: '/stimuli/pair001_b.png',
    leftLabel: 'Chart A',
    rightLabel: 'Chart B',
  },
  {
    id: 'pair002',
    questionPrompt: 'Which chart better supports comparing categories accurately?',
    leftImage: '/stimuli/pair002_a.png',
    rightImage: '/stimuli/pair002_b.png',
    leftLabel: 'Chart A',
    rightLabel: 'Chart B',
  },
];
