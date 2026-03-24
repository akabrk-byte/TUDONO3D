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

    const forwardMove = (e) => {
      clearTimeout(idleTimer);
      wrapper.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: false,
          cancelable: false,
        })
      );
      // Dispatch synthetic pointerleave 100ms after last move so the
      // fade-out timer inside GhostCursor can start counting.
      idleTimer = setTimeout(() => {
        wrapper.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
      }, 100);
    };

    const forwardLeave = () => {
      clearTimeout(idleTimer);
      wrapper.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
    };

    window.addEventListener('pointermove', forwardMove, { passive: true });
    document.addEventListener('pointerleave', forwardLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', forwardMove);
      document.removeEventListener('pointerleave', forwardLeave);
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
