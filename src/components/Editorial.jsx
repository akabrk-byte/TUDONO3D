import { useEffect, useRef } from 'react';
import Cubes from './Cubes';

export default function Editorial() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.classList.contains('reveal')) el.classList.add('revealed');
          if (el.classList.contains('divider-line')) el.classList.add('grown');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    section.querySelectorAll('.reveal, .divider-line').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="editorial" className="editorial" ref={sectionRef}>
      <div className="container">
        <div className="editorial-grid">
          <div className="reveal editorial-cubes-frame">
            <Cubes
              borderStyle="2px dotted #fff"
              gridSize={6}
              maxAngle={75}
              faceColor="#0a0a18"
              radius={3}
            />
          </div>
          <div className="editorial-text reveal">
            <span className="highlight">DESIIGN EM 3D</span>
            <h2>A BELEZA DA<br />GEOMETRIA</h2>
            <div className="divider-line" style={{ margin: '32px 0' }} />
            <p>
              A tecnologia de alta precisão da impressão 3D revela vértices nítidos, superfícies contínuas e curvas perfeitas, trazendo para o mundo físico aquilo que nasceu no traço digital. O resultado são peças geométricas de presença forte, acabamento impecável e uma estética contemporânea que transforma qualquer ambiente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
