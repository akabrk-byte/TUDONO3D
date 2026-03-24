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

    const dispatchEnter = (clientX, clientY) => {
      wrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false, cancelable: false }));
      wrapper.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: false, cancelable: false }));
    };

    const dispatchMove = (clientX, clientY) => {
      clearTimeout(idleTimer);
      wrapper.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: false, cancelable: false }));
    };

    const dispatchLeave = () => {
      clearTimeout(idleTimer);
      wrapper.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
    };

    // Desktop: mouse move
    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return; // handled by touch events below
      clearTimeout(idleTimer);
      dispatchMove(e.clientX, e.clientY);
      idleTimer = setTimeout(dispatchLeave, 100);
    };

    // Mobile: only activate on touchstart → touchmove, fade on touchend
    const onTouchStart = (e) => {
      const t = e.touches[0];
      if (t) dispatchEnter(t.clientX, t.clientY);
    };

    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) dispatchMove(t.clientX, t.clientY);
    };

    const onTouchEnd = () => dispatchLeave();

    if (isTouch) {
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    } else {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerleave', dispatchLeave, { passive: true });
    }

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', dispatchLeave);
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
