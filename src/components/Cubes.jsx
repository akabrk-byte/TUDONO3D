import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Cubes.css';

export default function Cubes({
  gridSize = 10,
  cubeSize,
  maxAngle = 45,
  radius = 3,
  easing = 'power3.out',
  duration = { enter: 0.3, leave: 0.6 },
  cellGap,
  borderStyle = '1px solid #fff',
  faceColor = '#060010',
  shadow = false,
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor = '#fff',
  rippleSpeed = 2,
}) {
  const sceneRef = useRef(null);
  const rafRef = useRef(null);
  const idleTimerRef = useRef(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef({ x: 0, y: 0 });
  const simTargetRef = useRef({ x: 0, y: 0 });
  const simRAFRef = useRef(null);

  const colGap =
    typeof cellGap === 'number' ? `${cellGap}px`
    : cellGap?.col !== undefined ? `${cellGap.col}px`
    : '5%';
  const rowGap =
    typeof cellGap === 'number' ? `${cellGap}px`
    : cellGap?.row !== undefined ? `${cellGap.row}px`
    : '5%';

  const enterDur = duration.enter;
  const leaveDur = duration.leave;

  const tiltAt = useCallback(
    (rowCenter, colCenter) => {
      if (!sceneRef.current) return;
      sceneRef.current.querySelectorAll('.cube').forEach(cube => {
        const r = +cube.dataset.row;
        const c = +cube.dataset.col;
        const dist = Math.hypot(r - rowCenter, c - colCenter);
        if (dist <= radius) {
          const pct = 1 - dist / radius;
          const angle = pct * maxAngle;
          gsap.to(cube, { duration: enterDur, ease: easing, overwrite: true, rotateX: -angle, rotateY: angle });
        } else {
          gsap.to(cube, { duration: leaveDur, ease: 'power3.out', overwrite: true, rotateX: 0, rotateY: 0 });
        }
      });
    },
    [radius, maxAngle, enterDur, leaveDur, easing]
  );

  const resetAll = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.querySelectorAll('.cube').forEach(cube =>
      gsap.to(cube, { duration: leaveDur, rotateX: 0, rotateY: 0, ease: 'power3.out' })
    );
  }, [leaveDur]);

  const onPointerMove = useCallback(
    e => {
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      const rect = sceneRef.current.getBoundingClientRect();
      const colCenter = (e.clientX - rect.left) / (rect.width / gridSize);
      const rowCenter = (e.clientY - rect.top) / (rect.height / gridSize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
      idleTimerRef.current = setTimeout(() => { userActiveRef.current = false; }, 3000);
    },
    [gridSize, tiltAt]
  );

  const onTouchMove = useCallback(
    e => {
      e.preventDefault();
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      const rect = sceneRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const colCenter = (touch.clientX - rect.left) / (rect.width / gridSize);
      const rowCenter = (touch.clientY - rect.top) / (rect.height / gridSize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
      idleTimerRef.current = setTimeout(() => { userActiveRef.current = false; }, 3000);
    },
    [gridSize, tiltAt]
  );

  const onTouchStart = useCallback(() => { userActiveRef.current = true; }, []);
  const onTouchEnd   = useCallback(() => resetAll(), [resetAll]);

  const onClick = useCallback(
    e => {
      if (!rippleOnClick || !sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const colHit = Math.floor((e.clientX - rect.left) / (rect.width / gridSize));
      const rowHit = Math.floor((e.clientY - rect.top) / (rect.height / gridSize));
      const spreadDelay  = (0.15 / rippleSpeed);
      const animDuration = (0.3  / rippleSpeed);
      const holdTime     = (0.6  / rippleSpeed);
      const rings = {};
      sceneRef.current.querySelectorAll('.cube').forEach(cube => {
        const ring = Math.round(Math.hypot(+cube.dataset.row - rowHit, +cube.dataset.col - colHit));
        if (!rings[ring]) rings[ring] = [];
        rings[ring].push(cube);
      });
      Object.keys(rings).map(Number).sort((a, b) => a - b).forEach(ring => {
        const delay = ring * spreadDelay;
        const faces = rings[ring].flatMap(cube => Array.from(cube.querySelectorAll('.cube-face')));
        gsap.to(faces, { backgroundColor: rippleColor, duration: animDuration, delay, ease: 'power3.out' });
        gsap.to(faces, { backgroundColor: faceColor,   duration: animDuration, delay: delay + animDuration + holdTime, ease: 'power3.out' });
      });
    },
    [rippleOnClick, gridSize, faceColor, rippleColor, rippleSpeed]
  );

  useEffect(() => {
    if (!autoAnimate || !sceneRef.current) return;
    const m = 1.5;
    const rnd = () => m + Math.random() * (gridSize - 2 * m);
    simPosRef.current    = { x: rnd(), y: rnd() };
    simTargetRef.current = { x: rnd(), y: rnd() };
    const speed = 0.02;
    const loop = () => {
      if (!userActiveRef.current) {
        const pos = simPosRef.current;
        const tgt = simTargetRef.current;
        pos.x += (tgt.x - pos.x) * speed;
        pos.y += (tgt.y - pos.y) * speed;
        tiltAt(pos.y, pos.x);
        if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
          simTargetRef.current = { x: rnd(), y: rnd() };
        }
      }
      simRAFRef.current = requestAnimationFrame(loop);
    };
    simRAFRef.current = requestAnimationFrame(loop);
    return () => { if (simRAFRef.current != null) cancelAnimationFrame(simRAFRef.current); };
  }, [autoAnimate, gridSize, tiltAt]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', resetAll);
    el.addEventListener('click', onClick);
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', resetAll);
      el.removeEventListener('click', onClick);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend',   onTouchEnd);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current)   clearTimeout(idleTimerRef.current);
    };
  }, [onPointerMove, resetAll, onClick, onTouchMove, onTouchStart, onTouchEnd]);

  const cells = Array.from({ length: gridSize });
  const sceneStyle = {
    gridTemplateColumns: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
    gridTemplateRows:    cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
    columnGap: colGap,
    rowGap,
  };
  const wrapperStyle = {
    '--cube-face-border': borderStyle,
    '--cube-face-bg':     faceColor,
    '--cube-face-shadow': shadow === true ? '0 0 6px rgba(0,0,0,.5)' : shadow || 'none',
    ...(cubeSize ? { width: `${gridSize * cubeSize}px`, height: `${gridSize * cubeSize}px` } : {}),
  };

  return (
    <div className="cubes-wrapper" style={wrapperStyle}>
      <div ref={sceneRef} className="cubes-scene" style={sceneStyle}>
        {cells.map((_, r) =>
          cells.map((__, c) => (
            <div key={`${r}-${c}`} className="cube" data-row={r} data-col={c}>
              <div className="cube-face cube-face--top"    />
              <div className="cube-face cube-face--bottom" />
              <div className="cube-face cube-face--left"   />
              <div className="cube-face cube-face--right"  />
              <div className="cube-face cube-face--front"  />
              <div className="cube-face cube-face--back"   />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
