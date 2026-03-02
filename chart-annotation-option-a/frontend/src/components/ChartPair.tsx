import React, { useState } from 'react';
import { LightboxModal } from './LightboxModal';

export function ChartPair(props: {
  leftSrc: string;
  rightSrc: string;
  leftLabel?: string;
  rightLabel?: string;
}) {
  const [open, setOpen] = useState<null | 'left' | 'right'>(null);

  return (
    <div className="pair">
      <div className="chartCard" onClick={() => setOpen('left')} role="button" tabIndex={0}>
        <div className="chartLabel">{props.leftLabel ?? 'Left'}</div>
        <img className="chartImg" src={props.leftSrc} alt={props.leftLabel ?? 'Left chart'} />
        <div className="hintSmall">Click to enlarge</div>
      </div>

      <div className="chartCard" onClick={() => setOpen('right')} role="button" tabIndex={0}>
        <div className="chartLabel">{props.rightLabel ?? 'Right'}</div>
        <img className="chartImg" src={props.rightSrc} alt={props.rightLabel ?? 'Right chart'} />
        <div className="hintSmall">Click to enlarge</div>
      </div>

      {open === 'left' && (
        <LightboxModal title={props.leftLabel ?? 'Left'} src={props.leftSrc} onClose={() => setOpen(null)} />
      )}
      {open === 'right' && (
        <LightboxModal title={props.rightLabel ?? 'Right'} src={props.rightSrc} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}
