import { useEffect, useRef } from 'react';

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2000;
  let startTimestamp = null;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(easeOut * target) + '+';
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + '+';
  };
  requestAnimationFrame(step);
}

export default function HowItWorks() {
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
          if (el.id === 'production-counter' && !el.classList.contains('counted')) {
            animateCounter(el);
            el.classList.add('counted');
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    section
      .querySelectorAll('.reveal, .divider-line, #production-counter')
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

        <div className="stats-container reveal">
          <div className="counter" id="production-counter" data-target="1540">0</div>
          <div className="stats-label">peças produzidas com precisão</div>
        </div>
      </div>
    </section>
  );
}
