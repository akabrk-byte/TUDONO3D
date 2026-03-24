export default function Marquee() {
  const text = 'IMPRESSÃO 3D · FEITO SOB DEMANDA · PERSONALIZADO · ALTA PRECISÃO · IMPRESSÃO 3D · FEITO SOB DEMANDA · PERSONALIZADO · ALTA PRECISÃO · ';
  return (
    <div className="marquee-wrapper">
      <div className="marquee">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
