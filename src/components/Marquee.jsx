export default function Marquee() {
  const buildContent = (prefix) => {
    const items = [];
    for (let i = 0; i < 9; i++) {
      items.push(
        <span key={`${prefix}-${i}`} className="cursor-target">
          <span className="marquee-word">TUDO NO </span>
          <span className="marquee-accent">3D</span>
        </span>
      );
      items.push(<span key={`${prefix}-sep-${i}`} className="marquee-sep">◆</span>);
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
