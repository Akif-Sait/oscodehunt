import PixelIcon from './pixel-icon';

const rounds = [
  { number: 1, name: 'The Code Gate', icon: 'code', description: 'Beat the clock in an algorithmic coding challenge.' },
  { number: 2, name: 'The Campus Trail', icon: 'search', description: 'Follow digital clues to hidden checkpoints and collect the required items.' },
  { number: 3, name: 'The Surprise Event', icon: 'chest', description: 'Test your skills in an unexpected mystery challenge.' },
  { number: 4, name: 'The Grand Finale', icon: 'crown', description: 'The final five teams face a rapid-fire tech quiz.' },
];

export function RoundMarkers() {
  return (
    <div className="map-markers" aria-label="Treasure hunt landmarks">
      {rounds.map(({ number, name }) => {
        const finale = number === rounds.length;
        return (
          <div className={`landmark landmark-${number}${finale ? ' landmark-final' : ''}`} key={number}>
            <div className="landmark-sign">
              <span>
                {finale && <PixelIcon name="laurel" className="portal-laurel" />}
                Round {number}<br />{name}
                {finale && <PixelIcon name="laurel" className="portal-laurel portal-laurel-right" />}
              </span>
            </div>
            {!finale && <span className="landmark-pin" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}

export function RoundSummary() {
  return (
    <section className="round-summary" id="rounds" aria-labelledby="rounds-heading">
      <h2 id="rounds-heading"><span />{rounds.length} elimination rounds<span /></h2>
      <ol className="round-cards">
        {rounds.map(({ number, name, icon, description }) => (
          <li className={`round-card round-card-${number}`} key={number}>
            <div className="round-card-inner">
              <PixelIcon name={icon} />
              <div>
                <h3><span>Round {number}</span>{name}</h3>
                <p>{description}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
