import { useRef, useEffect } from 'react';
import GhostCursor from './GhostCursor';

/**
 * Wraps GhostCursor in a position:fixed viewport-sized overlay.
 * Forwards window pointermove events via dispatchEvent so GhostCursor
 * receives them even though the wrapper has pointer-events:none.
 */
export default function GhostCursorWrapper(props) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let idleTimer = null;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const idleDelay = isTouch ? 300 : 100;

    const dispatchMove = (clientX, clientY) => {
      clearTimeout(idleTimer);
      wrapper.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX,
          clientY,
          bubbles: false,
          cancelable: false,
        })
      );
      idleTimer = setTimeout(() => {
        wrapper.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
      }, idleDelay);
    };

    const dispatchLeave = () => {
      clearTimeout(idleTimer);
      wrapper.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
    };

    const forwardPointerMove = (e) => dispatchMove(e.clientX, e.clientY);
    const forwardTouchMove = (e) => {
      const t = e.touches[0];
      if (t) dispatchMove(t.clientX, t.clientY);
    };

    window.addEventListener('pointermove', forwardPointerMove, { passive: true });
    window.addEventListener('touchmove', forwardTouchMove, { passive: true });
    window.addEventListener('touchend', dispatchLeave, { passive: true });
    window.addEventListener('touchcancel', dispatchLeave, { passive: true });
    document.addEventListener('pointerleave', dispatchLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', forwardPointerMove);
      window.removeEventListener('touchmove', forwardTouchMove);
      window.removeEventListener('touchend', dispatchLeave);
      window.removeEventListener('touchcancel', dispatchLeave);
      document.removeEventListener('pointerleave', dispatchLeave);
      clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <GhostCursor {...props} />
    </div>
  );
}
