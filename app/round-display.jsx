import PixelIcon from './pixel-icon';

const rounds = [
  { number: 1, name: 'Code Unlock', icon: 'code', description: 'Solve coding challenges to open the path.' },
  { number: 2, name: 'Clue Quest', icon: 'search', description: 'Follow clues, explore the campus, and collect items.' },
  { number: 3, name: 'Speed & Mystery', icon: 'crown', description: 'A fast-paced challenge followed by a text quiz.' },
];

export function RoundMarkers() {
  return (
    <div className="map-markers" aria-label="Treasure hunt landmarks">
      {rounds.map(({ number, name }) => (
        <div className={`landmark landmark-${number}`} key={number}>
          <div className="landmark-sign"><span>Round {number}<br />{name}</span></div>
          <span className="landmark-pin" aria-hidden="true" />
        </div>
      ))}
      <div className="landmark landmark-final"><div className="landmark-sign"><span><PixelIcon name="laurel" className="portal-laurel" />The Final Treasure<br />Portal<PixelIcon name="laurel" className="portal-laurel portal-laurel-right" /></span></div></div>
    </div>
  );
}

export function RoundSummary() {
  return (
    <section className="round-summary" aria-labelledby="rounds-heading">
      <h2 id="rounds-heading"><span />The hunt: 3 rounds<span /></h2>
      <div className="round-cards">
        {rounds.map(({ number, name, icon, description }) => (
          <a href="/rounds" className={`round-card round-card-${number}`} key={number}>
            <div className="round-card-inner"><PixelIcon name={icon} /><div><h3>Round {number}: {name}</h3><p>{description}</p></div></div>
          </a>
        ))}
      </div>
    </section>
  );
}
