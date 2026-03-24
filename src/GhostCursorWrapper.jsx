import { useRef, useEffect, useState } from 'react';
import GhostCursor from './GhostCursor';

const isTouch =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export default function GhostCursorWrapper(props) {
  const wrapperRef = useRef(null);

  // Mobile: não monta o GhostCursor até o primeiro toque
  // evita o blob vermelho no centro da tela antes de qualquer interação
  const [touchReady, setTouchReady] = useState(!isTouch);
  const firstTouchPos = useRef(null);

  useEffect(() => {
    if (!isTouch) return;
    const onFirst = (e) => {
      const t = e.touches[0];
      if (t) firstTouchPos.current = { x: t.clientX, y: t.clientY };
      setTouchReady(true);
    };
    window.addEventListener('touchstart', onFirst, { passive: true, once: true });
    return () => window.removeEventListener('touchstart', onFirst);
  }, []);

  // ── DESKTOP ── comportamento original exato
  useEffect(() => {
    if (isTouch) return;
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
  }, []);

  // ── MOBILE ── só ativa após primeiro toque
  useEffect(() => {
    if (!isTouch || !touchReady) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Posiciona o cursor onde o primeiro toque aconteceu
    if (firstTouchPos.current) {
      const { x, y } = firstTouchPos.current;
      wrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
      wrapper.dispatchEvent(
        new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: false })
      );
    }

    const onTouchStart = (e) => {
      const t = e.touches[0];
      if (!t) return;
      wrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
      wrapper.dispatchEvent(
        new PointerEvent('pointermove', { clientX: t.clientX, clientY: t.clientY, bubbles: false })
      );
    };

    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (!t) return;
      wrapper.dispatchEvent(
        new PointerEvent('pointermove', { clientX: t.clientX, clientY: t.clientY, bubbles: false })
      );
    };

    const onTouchEnd = () => {
      wrapper.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [touchReady]);

  if (!touchReady) return null;

  // Mobile: inércia e trail menores para o efeito seguir o dedo com precisão
  const mobileOverrides = isTouch
    ? { inertia: 0.12, trailLength: 12, fadeDelayMs: 0, fadeDurationMs: 500 }
    : {};

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
    >
      <GhostCursor {...props} {...mobileOverrides} />
    </div>
  );
}
