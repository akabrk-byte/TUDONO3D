import { forwardRef } from 'react';
import './RainbowButton.css';

/**
 * RainbowButton — implementação fiel ao Magic UI
 * Usa forwardRef para que ctaRef do Hero continue funcionando (parallax 3D).
 * Aceita href para renderizar como <a>.
 */
const RainbowButton = forwardRef(({ href, children, className = '', ...props }, ref) => {
  return (
    <a
      ref={ref}
      href={href}
      className={`rainbow-btn ${className}`.trim()}
      {...props}
    >
      {children}
    </a>
  );
});

RainbowButton.displayName = 'RainbowButton';
export default RainbowButton;
