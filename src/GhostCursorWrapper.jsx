import { useRef, useEffect, useState } from 'react';
import GhostCursor from './GhostCursor';

// Accurate touch-only detection (maxTouchPoints > 0 is also true on touchscreen laptops)
const isTouchOnly =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none) and (pointer: coarse)').matches;

export default function GhostCursorWrapper(props) {
  const wrapperRef = useRef(null);
  // Mobile: don't mount until user actually drags — prevents initial blob at centre
  const [mounted, setMounted] = useState(!isTouchOnly);
  const firstPos = useRef(null);

  // Mobile: wait for the first real drag (touchmove), not a tap (touchstart)
  useEffect(() => {
    if (!isTouchOnly) return;
    const onFirstDrag = (e) => {
      const t = e.touches[0];
      if (t) firstPos.current = { x: t.clientX, y: t.clientY };
      setMounted(true);
    };
    window.addEventListener('touchmove', onFirstDrag, { passive: true, once: true });
    return () => window.removeEventListener('touchmove', onFirstDrag);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // ── MOBILE ──────────────────────────────────────────────────────────────
    if (isTouchOnly) {
      // Immediately place cursor at the drag start position
      if (firstPos.current) {
        wrapper.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: firstPos.current.x,
            clientY: firstPos.current.y,
            bubbles: false,
          })
        );
      }

      const onMove = (e) => {
        const t = e.touches[0];
        if (!t) return;
        wrapper.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: t.clientX,
            clientY: t.clientY,
            bubbles: false,
          })
        );
      };

      const onEnd = () => {
        wrapper.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
      };

      window.addEventListener('touchmove',   onMove, { passive: true });
      window.addEventListener('touchend',    onEnd,  { passive: true });
      window.addEventListener('touchcancel', onEnd,  { passive: true });

      return () => {
        window.removeEventListener('touchmove',   onMove);
        window.removeEventListener('touchend',    onEnd);
        window.removeEventListener('touchcancel', onEnd);
      };
    }

    // ── DESKTOP ─────────────────────────────────────────────────────────────
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
      clearTimeout(idleTimer);
      window.removeEventListener('pointermove', forwardMove);
      document.removeEventListener('pointerleave', forwardLeave);
    };
  }, [mounted]);

  if (!mounted) return null;

  // Mobile: kill bloom (bloom pass is what creates the visible ring/circle around the touch).
  // Raise bloomThreshold so only the bright core glows, not the outer edge.
  // Compensate with slightly higher brightness so the soft aura stays visible.
  const mobileProps = isTouchOnly
    ? {
        inertia: 0.15,
        trailLength: 12,
        fadeDelayMs: 0,
        fadeDurationMs: 600,
        bloomStrength: 0.02,
        bloomRadius: 0.2,
        bloomThreshold: 0.5,
        brightness: 1.6,
      }
    : {};

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
    >
      <GhostCursor {...props} {...mobileProps} />
    </div>
  );
}
