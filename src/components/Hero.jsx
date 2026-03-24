import { useRef } from 'react';

export default function Hero() {
  const contentRef = useRef(null);
  const spanRef = useRef(null);
  const pRef = useRef(null);
  const ctaRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    if (contentRef.current) {
      contentRef.current.style.transform = `rotateY(${x * 25}deg) rotateX(${-y * 25}deg)`;
    }
    if (spanRef.current) {
      spanRef.current.style.transform = `translateZ(60px) translateX(${x * -20}px) translateY(${y * -20}px)`;
      const sx = -x * 40, sy = -y * 40;
      spanRef.current.style.textShadow = `
        2px 2px 0 #CC3B00,
        4px 4px 0 #CC3B00,
        6px 6px 0 #CC3B00,
        ${sx}px ${sy}px 0 rgba(255, 74, 0, 0.2),
        ${sx * 1.5}px ${sy * 1.5}px 20px rgba(0,0,0,0.3)
      `;
    }
    if (pRef.current) {
      pRef.current.style.transform = `translateZ(40px) translateX(${x * -10}px) translateY(${y * -10}px)`;
    }
    if (ctaRef.current) {
      ctaRef.current.style.transform = `translateZ(80px) translateX(${x * -30}px) translateY(${y * -30}px)`;
    }
  };

  const handleMouseLeave = () => {
    if (contentRef.current) {
      contentRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
    if (spanRef.current) {
      spanRef.current.style.transform = 'translateZ(0px) translateX(0px) translateY(0px)';
      spanRef.current.style.textShadow = '2px 2px 0 #CC3B00, 4px 4px 0 #CC3B00, 6px 6px 0 #CC3B00, 8px 8px 0 rgba(0,0,0,0.1)';
    }
    if (pRef.current) {
      pRef.current.style.transform = 'translateZ(30px) translateX(0px) translateY(0px)';
    }
    if (ctaRef.current) {
      ctaRef.current.style.transform = 'translateZ(0px) translateX(0px) translateY(0px)';
    }
  };

  return (
    <section className="hero" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="hero-content" ref={contentRef} id="hero-content">
        <h1>O FUTURO É<br /><span ref={spanRef}>IMPRESSO</span></h1>
        <p ref={pRef}>
          Design editorial e precisão técnica. Peças únicas criadas sob demanda para o seu espaço.
        </p>
        <a href="#produtos" className="cta-btn" ref={ctaRef}>Explorar Coleção</a>
      </div>
    </section>
  );
}
