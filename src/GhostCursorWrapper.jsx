import { useRef, useEffect, useState } from 'react';
import GhostCursor from './GhostCursor';

const isTouch =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export default function GhostCursorWrapper(props) {
  const wrapperRef = useRef(null);
  // Mobile: monta o GhostCursor apenas após o primeiro toque
  // evita o blob vermelho no centro ao carregar a página
  const [mounted, setMounted] = useState(!isTouch);
  const firstPos = useRef(null);

  // ── Aguarda primeiro toque para montar ──
  useEffect(() => {
    if (!isTouch) return;
    const onFirst = (e) => {
      const t = e.touches[0];
      if (t) firstPos.current = { x: t.clientX, y: t.clientY };
      setMounted(true);
    };
    window.addEventListener('touchstart', onFirst, { passive: true, once: true });
    return () => window.removeEventListener('touchstart', onFirst);
  }, []);

  // ── Lógica de eventos após o componente estar montado ──
  useEffect(() => {
    if (!mounted) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let idleTimer = null;

    if (isTouch) {
      // Posiciona no ponto do primeiro toque imediatamente
      if (firstPos.current) {
        wrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
        wrapper.dispatchEvent(new PointerEvent('pointermove', {
          clientX: firstPos.current.x,
          clientY: firstPos.current.y,
          bubbles: false,
        }));
      }

      const onStart = (e) => {
        const t = e.touches[0];
        if (!t) return;
        clearTimeout(idleTimer);
        wrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
        wrapper.dispatchEvent(new PointerEvent('pointermove', {
          clientX: t.clientX, clientY: t.clientY, bubbles: false,
        }));
      };

      const onMove = (e) => {
        const t = e.touches[0];
        if (!t) return;
        clearTimeout(idleTimer);
        wrapper.dispatchEvent(new PointerEvent('pointermove', {
          clientX: t.clientX, clientY: t.clientY, bubbles: false,
        }));
      };

      const onEnd = () => {
        clearTimeout(idleTimer);
        wrapper.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
      };

      window.addEventListener('touchstart',  onStart,  { passive: true });
      window.addEventListener('touchmove',   onMove,   { passive: true });
      window.addEventListener('touchend',    onEnd,    { passive: true });
      window.addEventListener('touchcancel', onEnd,    { passive: true });

      return () => {
        clearTimeout(idleTimer);
        window.removeEventListener('touchstart',  onStart);
        window.removeEventListener('touchmove',   onMove);
        window.removeEventListener('touchend',    onEnd);
        window.removeEventListener('touchcancel', onEnd);
      };
    }

    // ── Desktop: comportamento original exato ──
    const forwardMove = (e) => {
      clearTimeout(idleTimer);
      wrapper.dispatchEvent(new PointerEvent('pointermove', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: false,
        cancelable: false,
      }));
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

  // Mobile: inertia e trail menores → efeito localizado onde o dedo toca
  const mobileProps = isTouch
    ? { inertia: 0.1, trailLength: 10, fadeDelayMs: 0, fadeDurationMs: 500 }
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
