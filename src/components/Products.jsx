import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { products } from '../data/products';

const CATEGORIES = ['Todos', 'Capas de Isqueiro', 'Suportes', 'Decoração', 'Personalizado'];

function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Lightbox({ product, initialIndex, displayImages: initialImages, selectedColor: initialColor, onClose, onAddToCart }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [displayImages, setDisplayImages] = useState(initialImages);
  const [selectedColor, setSelectedColor] = useState(initialColor);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(i => (i - 1 + displayImages.length) % displayImages.length);
      if (e.key === 'ArrowRight') setCurrentIndex(i => (i + 1) % displayImages.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [displayImages.length, onClose]);

  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  function selectColor(colorName) {
    if (selectedColor === colorName) {
      setSelectedColor(null);
      setDisplayImages(product.images);
    } else {
      const colorObj = product.colors?.find(c => c.name === colorName);
      setSelectedColor(colorName);
      setDisplayImages(colorObj?.images || product.images);
    }
    setCurrentIndex(0);
  }

  const prev = () => setCurrentIndex(i => (i - 1 + displayImages.length) % displayImages.length);
  const next = () => setCurrentIndex(i => (i + 1) % displayImages.length);

  return createPortal(
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-modal" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Fechar">✕</button>

        <div className="lightbox-image-side">
          <div className="lightbox-main-image">
            <img key={displayImages[currentIndex]} src={displayImages[currentIndex]} alt={product.name} />
            {displayImages.length > 1 && (
              <>
                <button className="lightbox-nav prev" onClick={prev} aria-label="Anterior">&#10094;</button>
                <button className="lightbox-nav next" onClick={next} aria-label="Próxima">&#10095;</button>
              </>
            )}
          </div>
          {displayImages.length > 1 && (
            <div className="lightbox-thumbnails">
              {displayImages.map((img, i) => (
                <button key={i} className={`lightbox-thumb${i === currentIndex ? ' active' : ''}`} onClick={() => setCurrentIndex(i)}>
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lightbox-info-side">
          <div className="lightbox-category">{product.category}</div>
          <h2 className="lightbox-product-name">{product.name}</h2>
          {selectedColor && <span className="lightbox-color-tag">{selectedColor}</span>}
          <p className="lightbox-price">{formatPrice(product.price)}</p>

          {product.colors && (
            <div className="lightbox-colors-section">
              <p className="lightbox-colors-label">CORES DISPONÍVEIS</p>
              <div className="lightbox-swatches">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    className={`color-swatch${selectedColor === color.name ? ' selected' : ''}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    onClick={() => selectColor(color.name)}
                    aria-label={`Cor ${color.name}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="lightbox-counter">{currentIndex + 1} / {displayImages.length}</div>

          <button
            type="button"
            className="lightbox-add-btn"
            onClick={() => { onAddToCart({ ...product, selectedColor, images: displayImages }); onClose(); }}
          >
            ADICIONAR AO CARRINHO
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ProductCard({ product, onAddToCart, onOpenLightbox }) {
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
        <div
          className="product-gallery-container"
          onClick={() => onOpenLightbox({ product, imageIndex, displayImages, selectedColor })}
        >
          <img
            key={displayImages[imageIndex]}
            src={displayImages[imageIndex]}
            alt={product.name}
            className="product-img"
          />
          <div className="img-expand-overlay">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </div>
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

        <div className="color-swatches">
          {product.colors?.map(color => (
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
  const [lightbox, setLightbox] = useState(null);
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
            <div key={product.id} style={{ transitionDelay: `${(index % 4) * 100}ms`, height: '100%' }}>
              <ProductCard product={product} onAddToCart={onAddToCart} onOpenLightbox={setLightbox} />
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <Lightbox
          product={lightbox.product}
          initialIndex={lightbox.imageIndex}
          displayImages={lightbox.displayImages}
          selectedColor={lightbox.selectedColor}
          onClose={() => setLightbox(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </section>
  );
}
