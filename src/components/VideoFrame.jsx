import { useEffect, useRef, useState } from 'react';
import './VideoFrame.css';

const VIDEO_SRC_1 = '/video1.mp4';
const VIDEO_SRC_2 = '/video2.mp4';

export default function VideoFrame() {
  const wrapRef    = useRef(null);
  const stageRef   = useRef(null);
  const mlRef      = useRef(null);
  const sparksRef  = useRef(null);
  const cardRef    = useRef(null);
  const iframe1Ref = useRef(null);
  const iframe2Ref = useRef(null);
  const volFillRef = useRef(null);
  const sectionRef = useRef(null);

  const [playing, setPlaying] = useState(true);
  const [timeStr, setTimeStr] = useState('0:00');

  // ── reveal on scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { section.classList.add('vf-visible'); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  // ── 3-D tilt ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const wrap  = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    let tX = 5, tY = 0, gX = 5, gY = 0;
    let raf;

    const tick = () => {
      tX += (gX - tX) * 0.07;
      tY += (gY - tY) * 0.07;
      stage.style.transform = `rotateX(${tX}deg) rotateY(${tY}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = e => {
      const r = wrap.getBoundingClientRect();
      gY =  (e.clientX - r.left - r.width  / 2) / (r.width  / 2) * 8;
      gX = -(e.clientY - r.top  - r.height / 2) / (r.height / 2) * 5;
    };
    const onLeave = () => { gX = 5; gY = 0; };

    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // ── mouse light ───────────────────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    const ml   = mlRef.current;
    if (!wrap || !ml) return;

    const onMove = e => {
      const varea = wrap.querySelector('.vf-video-area');
      if (!varea) return;
      const r = varea.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      ml.style.background = `radial-gradient(circle 320px at ${x}px ${y}px, rgba(204,59,0,.08) 0%, transparent 70%)`;
      ml.style.opacity = '1';
    };
    const onLeave = () => { if (ml) ml.style.opacity = '0'; };

    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => {
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // ── sparks ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const sc = sparksRef.current;
    if (!sc) return;
    const mkSp = () => {
      const s   = document.createElement('div');
      s.className = 'vf-spark';
      const g   = Math.random() > 0.5;
      const sz  = 1 + Math.random() * 2.5;
      const dur = 1.2 + Math.random() * 2;
      s.style.cssText = `
        left:${5 + Math.random() * 90}%;
        bottom:${5 + Math.random() * 50}%;
        width:${sz}px; height:${sz}px;
        --dx:${(Math.random() - .5) * 70}px;
        --dy:-${50 + Math.random() * 90}px;
        animation-duration:${dur}s;
        animation-delay:${Math.random() * 1.5}s;
        background:${g ? '#ffaa40' : '#CC3B00'};
        box-shadow:0 0 ${sz * 3}px ${g ? '#ffaa40' : '#CC3B00'}`;
      sc.appendChild(s);
      setTimeout(() => s.remove(), (dur + 2) * 1000);
    };
    const id = setInterval(mkSp, 380);
    return () => clearInterval(id);
  }, []);

  // ── ripple on click ───────────────────────────────────────────────────────
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onClick = e => {
      const r = card.getBoundingClientRect();
      const d = document.createElement('div');
      d.className = 'vf-ripple';
      d.style.left = `${e.clientX - r.left}px`;
      d.style.top  = `${e.clientY - r.top}px`;
      card.appendChild(d);
      setTimeout(() => d.remove(), 700);
    };
    card.addEventListener('click', onClick);
    return () => card.removeEventListener('click', onClick);
  }, []);

  // ── animated timer ────────────────────────────────────────────────────────
  useEffect(() => {
    let secs = 0;
    const id = setInterval(() => {
      secs++;
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      setTimeStr(`${m}:${s < 10 ? '0' + s : s}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── volume fake anim ──────────────────────────────────────────────────────
  useEffect(() => {
    let pct = 0;
    let raf;
    const tick = () => {
      pct += (0 - pct) * 0.04;
      if (volFillRef.current) volFillRef.current.style.width = pct + '%';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── play / pause ──────────────────────────────────────────────────────────
  const togglePlay = () => {
    [iframe1Ref.current, iframe2Ref.current].filter(Boolean).forEach(v => {
      playing ? v.pause() : v.play();
    });
    setPlaying(p => !p);
  };

  // ── fullscreen ────────────────────────────────────────────────────────────
  const toggleFs = () => {
    const el = cardRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  return (
    <section className="vf-section" ref={sectionRef}>
      <div className="vf-wrap" ref={wrapRef}>
        <div className="vf-halo" />
        <div className="vf-pov">
          <div className="vf-stage" ref={stageRef}>

            <div className="vf-card" ref={cardRef}>
              <div className="vf-grain" />
              <div className="vf-corner vf-tl" /><div className="vf-corner vf-tr" />
              <div className="vf-corner vf-bl" /><div className="vf-corner vf-br" />
              <div className="vf-edge vf-et" /><div className="vf-edge vf-eb" />
              <div className="vf-edge vf-el" /><div className="vf-edge vf-er" />

              {/* VIDEO AREA */}
              <div className="vf-video-area">
                <div className="vf-badge-title">TUDO NO 3D</div>

                {/* célula 1 — esquerda */}
                <div className="vf-vcell vf-cell-a">
                  <div className="vf-ov-t" /><div className="vf-ov-b" />
                  <div className="vf-ov-l" /><div className="vf-ov-r" />
                  <div className="vf-vnum">01</div>
                  <video ref={iframe1Ref} src={VIDEO_SRC_1} autoPlay muted loop playsInline />
                </div>

                {/* célula 2 — direita */}
                <div className="vf-vcell vf-cell-b">
                  <div className="vf-ov-t" /><div className="vf-ov-b" />
                  <div className="vf-ov-l" /><div className="vf-ov-r" />
                  <div className="vf-vnum">02</div>
                  <video ref={iframe2Ref} src={VIDEO_SRC_2} autoPlay muted loop playsInline />
                </div>

                <div className="vf-mlight" ref={mlRef} />
                <div className="vf-sparks" ref={sparksRef} />
              </div>

              {/* PLAYER BAR */}
              <div className="vf-player-bar">
                <div className="vf-timeline-wrap">
                  <div className="vf-timeline-track">
                    <div className="vf-timeline-buffer" />
                    <div className="vf-timeline-fill" />
                    <div className="vf-tl-chapter" style={{ left: '25%' }} />
                    <div className="vf-tl-chapter" style={{ left: '50%' }} />
                    <div className="vf-tl-chapter" style={{ left: '75%' }} />
                    <div className="vf-timeline-thumb" />
                  </div>
                </div>

                <div className="vf-controls-row">
                  {/* left */}
                  <div className="vf-ctrl-group">
                    <button className="vf-ctrl-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
                    </button>
                    <button className="vf-ctrl-btn vf-play" onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
                      {playing
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>}
                    </button>
                    <button className="vf-ctrl-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2.5-8.18L11.17 12 8.5 14.18V9.82zM16 6h2v12h-2z"/></svg>
                    </button>
                    <div className="vf-badge-loop">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                    </div>
                    <div className="vf-time-display">
                      <span>{timeStr}</span>
                      <span style={{ color: 'rgba(255,255,255,.2)' }}> / </span>
                      <span>∞</span>
                    </div>
                  </div>

                  {/* center */}
                  <div className="vf-ctrl-group">
                    <span className="vf-meta-tag vf-highlight">4K</span>
                    <span className="vf-meta-tag">60fps</span>
                    <span className="vf-meta-tag">H.264</span>
                  </div>

                  {/* right */}
                  <div className="vf-ctrl-right">
                    <div className="vf-ctrl-group vf-vol-wrap">
                      <button className="vf-ctrl-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                      </button>
                      <div className="vf-vol-track">
                        <div className="vf-vol-fill" ref={volFillRef} />
                      </div>
                    </div>
                    <button className="vf-ctrl-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                    </button>
                    <button className="vf-ctrl-btn" onClick={toggleFs} title="Tela cheia">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* STATS */}
              <div className="vf-stats-footer">
                <div className="vf-sfstat"><div className="vf-sfv">0.1<em>mm</em></div><div className="vf-sfl">Precisão</div></div>
                <div className="vf-sfstat"><div className="vf-sfv">2<em>M</em></div><div className="vf-sfl">Views</div></div>
                <div className="vf-sfstat"><div className="vf-sfv">24<em>h</em></div><div className="vf-sfl">Suporte</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* ground line */}
        <div className="vf-ground" />
      </div>
    </section>
  );
}
