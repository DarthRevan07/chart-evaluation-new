import React from 'react';

export function ProgressBar(props: { current: number; total: number }) {
  const pct = Math.round(((props.current + 1) / props.total) * 100);
  return (
    <div className="progressWrap" aria-label="Progress">
      <div className="progressMeta">{props.current + 1} / {props.total} ({pct}%)</div>
      <div className="progressBar">
        <div className="progressFill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
