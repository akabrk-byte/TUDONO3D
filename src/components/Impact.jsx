import { useEffect, useRef } from 'react';

export default function Impact() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    section.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="impact" ref={sectionRef}>
      <div className="impact-inner">
        <div className="impact-eyebrow reveal">Estúdio de Impressão 3D</div>
        <h2 className="reveal">TRANSFORMANDO<br />IDEIAS EM <span>MATÉRIA</span></h2>
        <div className="impact-tagline reveal">Precisão · Design · Inovação</div>
      </div>
    </section>
  );
}
