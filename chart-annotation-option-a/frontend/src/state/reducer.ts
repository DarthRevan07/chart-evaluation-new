import type { AppState, Action } from './types';

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload };

    case 'SET_ANSWER': {
      const pair = state.responses[action.pairId] ?? {};
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.pairId]: { ...pair, [action.questionId]: action.value },
        },
      };
    }

    case 'NEXT':
      return { ...state, currentIndex: state.currentIndex + 1 };

    case 'PREV':
      return { ...state, currentIndex: Math.max(0, state.currentIndex - 1) };

    case 'SUBMIT_SUCCESS':
      return { ...state, submitted: true, submitError: undefined };

    case 'SUBMIT_ERROR':
      return { ...state, submitError: action.message };

    default:
      return state;
  }
}
