import { useEffect, useRef } from 'react';

const isMobile = typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const CONFIG = isMobile ? {
  blobs:       2,
  orbs:        5,
  particles:   16,
  gridSize:    55,
  gridOpacity: 0.03,
  mouseInfl:   0,
  connectDist: 60,
} : {
  blobs:       4,
  orbs:        14,
  particles:   48,
  gridSize:    55,
  gridOpacity: 0.04,
  mouseInfl:   0.10,
  connectDist: 110,
};

const PALETTE = [
  [255,  74,   0],
  [  0, 168, 176],
  [136,  40, 192],
  [ 48,  96, 216],
  [ 40, 168, 104],
  [255,  96,  64],
  [144, 128, 200],
];

export default function BgCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;
    let mouseX = 0.5, mouseY = 0.5;
    let targetX = 0.5, targetY = 0.5;
    let rafId;
    let active = true;

    /* ── MESH-GRADIENT BLOBS ── */
    const blobs = [];
    function initBlobs() {
      blobs.length = 0;
      const defs = [
        { cx:.25, cy:.28, r:.32, c:[255,74,0],   a:.07 },
        { cx:.78, cy:.55, r:.26, c:[110,20,180], a:.06 },
        { cx:.50, cy:.82, r:.30, c:[0,168,200],  a:.045 },
        { cx:.18, cy:.68, r:.22, c:[255,96,60],  a:.05 },
      ];
      defs.forEach(d => blobs.push({
        x: W * d.cx, y: H * d.cy,
        radius: Math.max(W, H) * d.r,
        vx: (Math.random()-.5)*.12, vy: (Math.random()-.5)*.12,
        color: d.c, alpha: d.a,
      }));
    }
    function drawBlobs() {
      blobs.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < -b.radius*.3 || b.x > W+b.radius*.3) b.vx *= -1;
        if (b.y < -b.radius*.3 || b.y > H+b.radius*.3) b.vy *= -1;
        const mx = b.x + (mouseX-.5) * W * CONFIG.mouseInfl;
        const my = b.y + (mouseY-.5) * H * CONFIG.mouseInfl;
        const [r,g,bl] = b.color;
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, b.radius);
        grad.addColorStop(0,    `rgba(${r},${g},${bl},${b.alpha})`);
        grad.addColorStop(0.55, `rgba(${r},${g},${bl},${b.alpha*.3})`);
        grad.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(mx-b.radius, my-b.radius, b.radius*2, b.radius*2);
      });
    }

    /* ── GRID OVERLAY ── */
    function drawGrid() {
      ctx.strokeStyle = `rgba(255,255,255,${CONFIG.gridOpacity})`;
      ctx.lineWidth = 0.5;
      const gs = CONFIG.gridSize;
      const ox = (mouseX-.5) * gs * .5;
      const oy = (mouseY-.5) * gs * .5;
      for (let x = (ox%gs) - gs; x < W+gs; x += gs) {
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
      }
      for (let y = (oy%gs) - gs; y < H+gs; y += gs) {
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }
    }

    /* ── FLOATING ORBS ── */
    const orbs = [];
    function initOrbs() {
      orbs.length = 0;
      for (let i = 0; i < CONFIG.orbs; i++) {
        const c = PALETTE[i % PALETTE.length];
        orbs.push({
          x: Math.random()*W, y: Math.random()*H,
          size: 5 + Math.random()*18,
          vx: (Math.random()-.5)*.26,
          vy: (Math.random()-.5)*.20,
          opacity: .10 + Math.random()*.30,
          color: c,
          hasRing: Math.random() > .50,
          angle: Math.random()*Math.PI*2,
          rotSpeed: (Math.random()-.5)*.004,
          phase: Math.random()*Math.PI*2,
          phaseSpd: .005 + Math.random()*.012,
        });
      }
    }
    function drawOrbs() {
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        o.angle += o.rotSpeed; o.phase += o.phaseSpd;
        if (o.x<-60) o.x=W+60; if (o.x>W+60) o.x=-60;
        if (o.y<-60) o.y=H+60; if (o.y>H+60) o.y=-60;
        const [r,g,b] = o.color;
        const pulse = .8 + .2*Math.sin(o.phase);
        const a = o.opacity * pulse;

        const glow = ctx.createRadialGradient(o.x,o.y,0, o.x,o.y, o.size*3.5);
        glow.addColorStop(0, `rgba(${r},${g},${b},${a*.18})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(o.x,o.y, o.size*3.5, 0, Math.PI*2); ctx.fill();

        const rL=Math.min(255,r+55), gL=Math.min(255,g+55), bL=Math.min(255,b+55);
        const core = ctx.createRadialGradient(
          o.x - o.size*.22, o.y - o.size*.22, o.size*.08,
          o.x, o.y, o.size
        );
        core.addColorStop(0,  `rgba(${rL},${gL},${bL},${a})`);
        core.addColorStop(.6, `rgba(${r},${g},${b},${a*.7})`);
        core.addColorStop(1,  `rgba(${r>>1},${g>>1},${b>>1},0)`);
        ctx.fillStyle = core;
        ctx.beginPath(); ctx.arc(o.x,o.y, o.size, 0, Math.PI*2); ctx.fill();

        if (o.hasRing) {
          ctx.save();
          ctx.translate(o.x, o.y);
          ctx.rotate(o.angle);
          ctx.scale(1, .32);
          ctx.strokeStyle = `rgba(${r},${g},${b},${a*.35})`;
          ctx.lineWidth = .8;
          ctx.beginPath(); ctx.arc(0,0, o.size*1.7, 0, Math.PI*2); ctx.stroke();
          ctx.restore();
        }
      });
    }

    /* ── PARTÍCULAS + CONEXÕES ── */
    const particles = [];
    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < CONFIG.particles; i++) {
        const rv = Math.random();
        const c = rv<.45 ? PALETTE[0] : rv<.65 ? PALETTE[2] : rv<.80 ? PALETTE[1] : PALETTE[4];
        particles.push({
          x: Math.random()*W, y: Math.random()*H,
          size: Math.random()*1.5 + .3,
          vx: (Math.random()-.5)*.32,
          vy: (Math.random()-.5)*.32,
          alpha: Math.random()*.40 + .08,
          color: c,
          phase: Math.random()*Math.PI*2,
          phaseSpd: .005 + Math.random()*.013,
        });
      }
    }
    function drawParticles() {
      const cd = CONFIG.connectDist;
      const cd2 = cd * cd;
      ctx.lineWidth = .4;
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        for (let j = i+1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x, dy = pi.y - pj.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < cd2) {
            const a = (1 - Math.sqrt(d2)/cd) * .07;
            ctx.strokeStyle = `rgba(255,255,255,${a})`;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.phase += p.phaseSpd;
        if (p.x<-5) p.x=W+5; if (p.x>W+5) p.x=-5;
        if (p.y<-5) p.y=H+5; if (p.y>H+5) p.y=-5;
        const [r,g,b] = p.color;
        const a = p.alpha * (.7 + .3*Math.sin(p.phase));
        ctx.beginPath(); ctx.arc(p.x,p.y, p.size, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fill();
      });
    }

    function initAll() { initBlobs(); initOrbs(); initParticles(); }

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initAll();
    }

    function drawFrame() {
      mouseX += (targetX - mouseX) * .04;
      mouseY += (targetY - mouseY) * .04;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);
      drawBlobs();
      drawGrid();
      drawParticles();
      drawOrbs();
    }

    function animate() {
      if (!active) return;
      rafId = requestAnimationFrame(animate);
      drawFrame();
    }

    const onMouseMove = e => { targetX = e.clientX / W; targetY = e.clientY / H; };
    const onTouchMove = e => {
      if (e.touches.length) {
        targetX = e.touches[0].clientX / W;
        targetY = e.touches[0].clientY / H;
      }
    };
    const onScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      targetY = .28 + (window.scrollY / max) * .44;
    };
    const onResize = () => resize();
    const mqHandler = e => {
      if (e.matches) cancelAnimationFrame(rafId);
      else if (active) animate();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    mq.addEventListener('change', mqHandler);

    resize();
    if (mq.matches) { drawFrame(); } else { animate(); }

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      mq.removeEventListener('change', mqHandler);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="bg-canvas"
      aria-hidden="true"
      role="presentation"
    />
  );
}
