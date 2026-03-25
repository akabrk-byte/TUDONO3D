import { useState, useEffect, useRef } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
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

  const handleNewsletter = (e) => {
    e.preventDefault();
    alert('E-mail cadastrado com sucesso!');
    setEmail('');
  };

  return (
    <footer id="footer" ref={sectionRef}>

      {/* ── Brand hero ── */}
      <div className="footer-brand reveal">
        <p className="footer-eyebrow">Studio de impressão 3D · Rio de Janeiro</p>
        <h2 className="footer-brand-name">
          TUDO NO <span>3D</span>
        </h2>
        <p className="footer-brand-tagline">Design editorial. Precisão técnica.</p>
      </div>

      {/* ── Colunas ── */}
      <div className="container">
        <div className="footer-grid reveal">

          <div className="footer-col">
            <h4>Navegação</h4>
            <a href="#produtos">Catálogo de Produtos</a>
            <a href="#editorial">Sobre o Estúdio</a>
            <a href="#">Como Funciona</a>
            <a href="#">Dúvidas Frequentes</a>
          </div>

          <div className="footer-col">
            <h4>Contato</h4>
            <a href="#">WhatsApp: (21) 99999-9999</a>
            <a href="#">Instagram: @tudono3d</a>
            <a href="#">contato@tudono3d.com.br</a>
            <p>Rio de Janeiro, RJ — Brasil</p>
          </div>

          <div className="footer-col">
            <h4>Newsletter</h4>
            <p>Receba novidades, lançamentos exclusivos e ofertas especiais.</p>
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button type="submit">OK</button>
            </form>
          </div>

        </div>

        <div className="footer-bottom reveal">
          <p>© 2026. Todos os direitos reservados.</p>
          <p>Design for alec'akabrk</p>
        </div>
      </div>

    </footer>
  );
}
