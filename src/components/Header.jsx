// Header antigo, substituído pelo PillNav em App.tsx
import { useState, useEffect, useRef } from 'react';

export default function Header({ cartCount, onCartToggle }) {
  const [shrunk, setShrunk] = useState(false);
  const [badgePop, setBadgePop] = useState(false);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setBadgePop(true);
      const t = setTimeout(() => setBadgePop(false), 300);
      prevCountRef.current = cartCount;
      return () => clearTimeout(t);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  return (
    <header id="header" className={shrunk ? 'shrunk' : ''}>
      <div className="logo-badge">TUDO NO 3D</div>
      <nav className="nav-links">
        <a href="#produtos">Produtos</a>
        <a href="#editorial">Sobre</a>
        <a href="#footer">Contato</a>
      </nav>
      <button className="cart-btn" onClick={onCartToggle}>
        Carrinho
        <span className={`cart-badge${badgePop ? ' pop' : ''}`}>{cartCount}</span>
      </button>
    </header>
  );
}
