import React, { useEffect } from 'react';

export function LightboxModal(props: { title: string; src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && props.onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props]);

  return (
    <div className="modalBackdrop" onClick={props.onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">{props.title}</div>
          <button className="btn" onClick={props.onClose}>Close</button>
        </div>
        <img className="modalImg" src={props.src} alt={props.title} />
      </div>
    </div>
  );
}
