import { useRef, useEffect } from 'react';
import Magnet from './Magnet';
import RainbowButton from './RainbowButton';

const isMobile =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none) and (pointer: coarse)').matches;

export default function Hero() {
  const contentRef = useRef(null);
  const spanRef    = useRef(null);
  const pRef       = useRef(null);
  const ctaRef     = useRef(null);
  const h1Ref      = useRef(null);
  const sectionRef = useRef(null);

  // ── Desktop: 3-D mouse parallax ─────────────────────────────────────────
  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;

    if (contentRef.current)
      contentRef.current.style.transform = `rotateY(${x * 25}deg) rotateX(${-y * 25}deg)`;

    if (spanRef.current) {
      spanRef.current.style.transform = `translateZ(60px) translateX(${x * -20}px) translateY(${y * -20}px)`;
      const sx = -x * 40, sy = -y * 40;
      spanRef.current.style.textShadow = `
        2px 2px 0 #CC3B00,
        4px 4px 0 #CC3B00,
        6px 6px 0 #CC3B00,
        ${sx}px ${sy}px 0 rgba(255,74,0,0.2),
        ${sx * 1.5}px ${sy * 1.5}px 20px rgba(0,0,0,0.3)
      `;
    }
    if (pRef.current)
      pRef.current.style.transform = `translateZ(40px) translateX(${x * -10}px) translateY(${y * -10}px)`;
    if (ctaRef.current)
      ctaRef.current.style.transform = `translateZ(80px) translateX(${x * -30}px) translateY(${y * -30}px)`;
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    if (contentRef.current)
      contentRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    if (spanRef.current) {
      spanRef.current.style.transform = 'translateZ(0px) translateX(0px) translateY(0px)';
      spanRef.current.style.textShadow = '2px 2px 0 #CC3B00, 4px 4px 0 #CC3B00, 6px 6px 0 #CC3B00, 8px 8px 0 rgba(0,0,0,0.1)';
    }
    if (pRef.current)  pRef.current.style.transform  = 'translateZ(30px) translateX(0px) translateY(0px)';
    if (ctaRef.current) ctaRef.current.style.transform = 'translateZ(0px) translateX(0px) translateY(0px)';
  };

  // ── Mobile: scroll-driven parallax + fade ────────────────────────────────
  useEffect(() => {
    if (!isMobile) return;
    const section = sectionRef.current;
    if (!section) return;

    const h1  = h1Ref.current;
    const p   = pRef.current;
    const cta = ctaRef.current;

    const onScroll = () => {
      const rect     = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / window.innerHeight));

      if (progress > 0) {
        if (h1)  { h1.style.transform  = `translateY(${-progress * 80}px)`;  h1.style.opacity  = `${Math.max(0, 1 - progress * 2.5)}`; }
        if (p)   { p.style.transform   = `translateY(${-progress * 50}px)`;   p.style.opacity   = `${Math.max(0, 1 - progress * 3)}`; }
        if (cta) { cta.style.transform = `translateY(${-progress * 40}px)`; cta.style.opacity = `${Math.max(0, 1 - progress * 3)}`; }
      } else {
        // Scrolled back to top — let CSS animation state take over
        if (h1)  { h1.style.transform  = ''; h1.style.opacity  = ''; }
        if (p)   { p.style.transform   = ''; p.style.opacity   = ''; }
        if (cta) { cta.style.transform = ''; cta.style.opacity = ''; }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      className="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hero-content" ref={contentRef} id="hero-content">
        <h1 ref={h1Ref}>O FUTURO É<br /><span ref={spanRef}>IMPRESSO</span></h1>
        <p ref={pRef}>
          Sua ideia ganha forma com nossas impressões, feitas com precisão, tecnologia e atenção total<br></br>a cada projeto.
        </p>
        <Magnet padding={300} magnetStrength={7} disabled={isMobile}>
          <RainbowButton href="#produtos" ref={ctaRef}>VEJA MAIS</RainbowButton>
        </Magnet>
      </div>
    </section>
  );
}
