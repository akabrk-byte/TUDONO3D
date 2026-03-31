import { useEffect, useRef, useState } from 'react';

const CIRC = 2 * Math.PI * 42;

const STATS = [
  {
    id: 'st-custom',
    label: 'PERSONALIZADO',
    sub: 'cada peça é única',
    percent: 100,
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    id: 'st-frete',
    label: 'FRETE GRÁTIS',
    sub: 'em compras acima de R$ 150',
    percent: 60,
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    id: 'st-support',
    label: 'SUPORTE ONLINE',
    sub: 'atendimento humanizado',
    percent: 50,
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="9" y1="10" x2="15" y2="10"/>
        <line x1="9" y1="14" x2="13" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'st-secure',
    label: 'COMPRA SEGURA',
    sub: 'pagamento protegido',
    percent: 100,
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const [ringsActive, setRingsActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.classList.contains('reveal')) el.classList.add('revealed');
          if (el.classList.contains('divider-line')) el.classList.add('grown');
          if (el.classList.contains('stat-grid') && !el.classList.contains('animated')) {
            el.classList.add('animated');
            setRingsActive(true);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    section
      .querySelectorAll('.reveal, .divider-line, .stat-grid')
      .forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="how-it-works" ref={sectionRef}>
      <div className="container">
        <div className="section-header reveal">
          <h2>COMO FUNCIONA</h2>
        </div>

        <div className="steps">
          <div className="step reveal">
            <div className="step-number">01</div>
            <h3>ESCOLHA</h3>
            <p>Navegue pelo nosso catálogo curado de designs exclusivos e funcionais.</p>
          </div>
          <div className="step reveal" style={{ transitionDelay: '100ms' }}>
            <div className="step-number">02</div>
            <h3>PERSONALIZE</h3>
            <p>Defina cores e acabamentos. Cada peça é impressa especialmente para você.</p>
          </div>
          <div className="step reveal" style={{ transitionDelay: '200ms' }}>
            <div className="step-number">03</div>
            <h3>RECEBA</h3>
            <p>Sua peça é fatiada, impressa, finalizada à mão e enviada com segurança.</p>
          </div>
        </div>

        <div className="stat-grid reveal">
          {STATS.map((stat, i) => (
            <div key={stat.id} className="stat-card">
              <div className="stat-ring-wrap">
                <svg viewBox="0 0 100 100" className="stat-svg">
                  <circle cx="50" cy="50" r="42" className="stat-ring-bg" />
                  <circle
                    cx="50" cy="50" r="42"
                    className="stat-ring-fg"
                    style={{
                      strokeDasharray: CIRC,
                      strokeDashoffset: ringsActive
                        ? CIRC * (1 - stat.percent / 100)
                        : CIRC,
                      transition: `stroke-dashoffset 1.7s cubic-bezier(0.22,1,0.36,1) ${i * 130}ms`,
                    }}
                  />
                </svg>
                <div className="stat-ring-inner">
                  {stat.icon}
                </div>
              </div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-sub">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
