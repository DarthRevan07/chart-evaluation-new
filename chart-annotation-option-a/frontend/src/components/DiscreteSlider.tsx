import React from 'react';
import { HoverHint } from './HoverHint';

export function DiscreteSlider(props: {
  name: string;
  value?: string;
  options: { value: string; label: string; hint: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="discreteSlider" role="radiogroup" aria-label={props.name}>
      {props.options.map((opt) => {
        const checked = props.value === opt.value;
        return (
          <label key={opt.value} className={'seg ' + (checked ? 'segActive' : '')}>
            <input type="radio" name={props.name} checked={checked} onChange={() => props.onChange(opt.value)} />
            <HoverHint text={opt.hint}>
              <span className="segLabel">{opt.label}</span>
            </HoverHint>
          </label>
        );
      })}
    </div>
  );
}
