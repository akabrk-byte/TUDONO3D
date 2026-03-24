import { useState, useEffect, useRef } from 'react';
import { products } from '../data/products';

const CATEGORIES = ['Todos', 'Capas', 'Suportes', 'Decoração', 'Personalizado'];

function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ProductCard({ product, onAddToCart }) {
  const [imageIndex, setImageIndex] = useState(0);
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);
  const hasMultiple = product.images.length > 1;

  const changeImage = (dir, e) => {
    e.stopPropagation();
    setImageIndex(prev => {
      let next = prev + dir;
      if (next < 0) next = product.images.length - 1;
      if (next >= product.images.length) next = 0;
      return next;
    });
  };

  const handleMouseMove = (e) => {
    const wrapper = wrapperRef.current;
    const card = cardRef.current;
    if (!wrapper || !card) return;
    const rect = wrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 20}deg) rotateX(${-y * 20}deg) scale3d(1.02,1.02,1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="card-wrapper reveal"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={cardRef} className="product-card">
        <div className="product-gallery-container">
          <img
            src={product.images[imageIndex]}
            alt={product.name}
            className="product-img"
          />
          {hasMultiple && (
            <>
              <div className="gallery-nav">
                <button onClick={(e) => changeImage(-1, e)} aria-label="Imagem anterior">&#10094;</button>
                <button onClick={(e) => changeImage(1, e)} aria-label="Próxima imagem">&#10095;</button>
              </div>
              <div className="gallery-dots">
                {product.images.map((_, i) => (
                  <div key={i} className={`dot${i === imageIndex ? ' active' : ''}`} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="product-info">
          <div className="product-details">
            <h3>{product.name}</h3>
            <p>{formatPrice(product.price)}</p>
          </div>
          <button
            className="add-btn"
            onClick={() => onAddToCart(product)}
            aria-label={`Adicionar ${product.name}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products({ onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const sectionRef = useRef(null);

  const filtered = activeCategory === 'Todos'
    ? products
    : products.filter(p => p.category === activeCategory);

  // Re-run observer whenever the displayed products change so new cards animate in
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

    section
      .querySelectorAll('.reveal:not(.revealed), .divider-line:not(.grown)')
      .forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [filtered]);

  return (
    <section id="produtos" className="products-section" ref={sectionRef}>
      <div className="container">
        <div className="section-header reveal">
          <h2>CATÁLOGO</h2>
          <div className="divider-line" style={{ margin: '24px auto' }} />
        </div>

        <div className="filters reveal">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-pill${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid">
          {filtered.map((product, index) => (
            <div key={product.id} style={{ transitionDelay: `${(index % 4) * 100}ms` }}>
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
