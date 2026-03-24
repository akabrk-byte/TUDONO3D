import { useState, useEffect, useRef } from 'react';
import { products } from '../data/products';

const CATEGORIES = ['Todos', 'Capas de Isqueiro', 'Suportes', 'Decoração', 'Personalizado'];

function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ProductCard({ product, onAddToCart }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [displayImages, setDisplayImages] = useState(product.images);
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);

  function selectColor(colorName) {
    if (selectedColor === colorName) {
      setSelectedColor(null);
      setDisplayImages(product.images);
    } else {
      const colorObj = product.colors?.find(c => c.name === colorName);
      setSelectedColor(colorName);
      setDisplayImages(colorObj?.images || product.images);
    }
    setImageIndex(0);
  }

  const changeImage = (dir, e) => {
    e.stopPropagation();
    setImageIndex(prev => {
      let next = prev + dir;
      if (next < 0) next = displayImages.length - 1;
      if (next >= displayImages.length) next = 0;
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
            key={displayImages[imageIndex]}
            src={displayImages[imageIndex]}
            alt={product.name}
            className="product-img"
          />
          {displayImages.length > 1 && (
            <>
              <div className="gallery-nav">
                <button onClick={(e) => changeImage(-1, e)} aria-label="Imagem anterior">&#10094;</button>
                <button onClick={(e) => changeImage(1, e)} aria-label="Próxima imagem">&#10095;</button>
              </div>
              <div className="gallery-dots">
                {displayImages.map((_, i) => (
                  <div key={i} className={`dot${i === imageIndex ? ' active' : ''}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {product.colors && (
          <div className="color-swatches">
            {product.colors.map(color => (
              <button
                type="button"
                key={color.name}
                className={`color-swatch${selectedColor === color.name ? ' selected' : ''}`}
                style={{ backgroundColor: color.hex, pointerEvents: 'auto' }}
                title={color.name}
                onClick={() => selectColor(color.name)}
                aria-label={`Cor ${color.name}`}
              />
            ))}
          </div>
        )}

        <div className="product-info">
          <div className="product-details">
            <h3>{product.name}</h3>
            {selectedColor && <span className="selected-color-label">{selectedColor}</span>}
            <p>{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            className="add-btn"
            onClick={() => onAddToCart({ ...product, selectedColor, images: displayImages })}
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
