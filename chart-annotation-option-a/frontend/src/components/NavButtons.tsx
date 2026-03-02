import React from 'react';

export function NavButtons(props: {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
  nextLabel: string;
}) {
  return (
    <div className="navRow">
      <button className="btn" onClick={props.onPrev} disabled={props.prevDisabled}>Previous</button>
      <button className="btnPrimary" onClick={props.onNext} disabled={props.nextDisabled}>{props.nextLabel}</button>
    </div>
  );
}
