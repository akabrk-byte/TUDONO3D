export default function Marquee() {
  const buildContent = (prefix) => {
    const items = [];
    for (let i = 0; i < 9; i++) {
      items.push(<span key={`${prefix}-${i}`} className="cursor-target">TUDO NO 3D</span>);
      items.push(' · ');
    }
    return items;
  };

  return (
    <div className="marquee-wrapper">
      <div className="marquee">
        <span>{buildContent('a')}</span>
        <span>{buildContent('b')}</span>
      </div>
    </div>
  );
}
