import React from 'react';

export function HoverHint(props: { text: string; children: React.ReactNode }) {
  return (
    <span className="hoverHint">
      {props.children}
      <span className="hoverHintBox">{props.text}</span>
    </span>
  );
}
