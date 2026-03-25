import { useState } from 'react';
import BgCanvas from './components/BgCanvas';
import PillNav from './components/PillNav';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Products from './components/Products';
import Editorial from './components/Editorial';
import HowItWorks from './components/HowItWorks';
import Impact from './components/Impact';
import Footer from './components/Footer';
import Cart from './components/Cart';
import GhostCursorWrapper from './GhostCursorWrapper';
import TargetCursor from './components/TargetCursor';

export default function App() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const handleAddToCart = (product: any) => {
    setCartItems(prev => [...prev, product]);
    setCartOpen(true);
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    const lines = cartItems.map(item => `- ${item.name}: R$${item.price.toFixed(2)}`).join('\n');
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const msg = encodeURIComponent(
      `Olá! Quero fazer um pedido:\n\n${lines}\n\nTotal: R$${total.toFixed(2)}`
    );
    window.open(`https://wa.me/5511999999999?text=${msg}`, '_blank');
  };

  return (
    <>
      <BgCanvas />
      <TargetCursor
        targetSelector=".cursor-target"
        containerSelector=".marquee-wrapper"
        rotationDuration={2}
        hoverDuration={0.2}
        hideDefaultCursor={true}
        parallaxEnabled={true}
      />
      <GhostCursorWrapper
        color="#FF4A00"
        brightness={1.2}
        edgeIntensity={0.3}
        trailLength={40}
        inertia={0.6}
        grainIntensity={0.04}
        bloomStrength={0.15}
        bloomRadius={0.8}
        bloomThreshold={0.02}
        fadeDelayMs={800}
        fadeDurationMs={1200}
      />
      <PillNav
        logo="/logo.svg"
        logoAlt="Tudo no 3D"
        items={[
          { label: 'Produtos', href: '#produtos' },
          { label: 'Sobre', href: '#editorial' },
          { label: 'Contato', href: '#footer' },
        ]}
        activeHref={window.location.pathname}
        baseColor="#ffffff"
        pillColor="#FF4A00"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#ffffff"
        initialLoadAnimation
      />
      <main>
        <Hero />
        <Marquee />
        <Products onAddToCart={handleAddToCart} />
        <Editorial />
        <HowItWorks />
        <Impact />
      </main>
      <Footer />
      <Cart
        isOpen={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </>
  );
}
