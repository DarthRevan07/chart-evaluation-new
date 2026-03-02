import React from 'react';
import type { Question } from '../data/questions';
import { DiscreteSlider } from './DiscreteSlider';
import { HoverHint } from './HoverHint';

export function Questionnaire(props: {
  pairId: string;
  questions: Question[];
  answers: Record<string, string | string[]>;
  setAnswer: (questionId: string, value: string | string[]) => void;
}) {
  return (
    <div className="qBox">
      {props.questions.map((q) => {
        const ans = props.answers?.[q.id];

        if (q.kind === 'discrete-slider') {
          return (
            <div key={q.id} className="qItem">
              <div className="qPrompt">{q.prompt}</div>
              <DiscreteSlider
                name={`${props.pairId}:${q.id}`}
                value={typeof ans === 'string' ? ans : undefined}
                options={q.options}
                onChange={(v) => props.setAnswer(q.id, v)}
              />
            </div>
          );
        }

        const selected = Array.isArray(ans) ? ans : [];
        return (
          <div key={q.id} className="qItem">
            <div className="qPrompt">{q.prompt}</div>
            <div className="checks">
              {q.options.map((opt) => {
                const isChecked = selected.includes(opt.value);
                return (
                  <label key={opt.value} className="checkRow">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const next = isChecked
                          ? selected.filter((x) => x !== opt.value)
                          : [...selected, opt.value];
                        if (q.maxSelect && next.length > q.maxSelect) return;
                        props.setAnswer(q.id, next);
                      }}
                    />
                    <HoverHint text={opt.hint}>
                      <span>{opt.label}</span>
                    </HoverHint>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
