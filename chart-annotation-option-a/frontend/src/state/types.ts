export type AnswerValue = string | string[];

export type PairAnswers = Record<string, AnswerValue>;

export type Responses = Record<string, PairAnswers>;

export type AppState = {
  participantId: string;
  currentIndex: number;
  responses: Responses;
  submitted: boolean;
  submitError?: string;
};

export type Action =
  | { type: 'LOAD'; payload: Partial<AppState> }
  | { type: 'SET_ANSWER'; pairId: string; questionId: string; value: AnswerValue }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; message: string };
