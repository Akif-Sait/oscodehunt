'use client';

import { useState } from 'react';
import './campus-secrets.css';

const fish = [
  '.......gg.......',
  '......googg.....',
  '.g...gooooogg...',
  '.gg.gooowkoogg..',
  '.gggoooowkooog..',
  '.gg.goooooogg...',
  '.g...gggggg.....',
  '.......gg.......',
];

const palette = { w: '#fff0d2', k: '#202c44', o: '#bc6a39', g: '#ffc65a' };

function Sprite({ pixels, className }) {
  return <span className={`secret-sprite ${className}`} aria-hidden="true" style={{ gridTemplateColumns: `repeat(${pixels[0].length}, 1fr)`, gridTemplateRows: `repeat(${pixels.length}, 1fr)` }}>
    {pixels.flatMap((row, y) => [...row].map((color, x) => color !== '.' && <i key={`${x}-${y}`} style={{ gridColumn: x + 1, gridRow: y + 1, background: palette[color] }} />))}
  </span>;
}

const grumbles = ['Who moved my classroom?', 'Another meeting? Hmph.', 'These clues need a bibliography.', 'I had a perfectly good shortcut…'];

export default function CampusSecrets({ moving }) {
  const [grumble, setGrumble] = useState(0);
  const [fishJump, setFishJump] = useState(0);

  return (
    <div className={`campus-secrets ${moving ? '' : 'secrets-paused'}`}>
      <button className="professor" aria-label="Talk to the wandering professor" onClick={() => setGrumble((value) => value + 1)}>
        <span className="professor-shadow" aria-hidden="true" />
        <span className="professor-sprite" aria-hidden="true" />
        <span key={grumble} className={`professor-grumble ${grumble ? 'grumble-clicked' : ''}`}>{grumbles[grumble % grumbles.length]}</span>
      </button>
      <div className="professor-foreground" aria-hidden="true">
        <span className="professor-foreground-entry" />
        <span className="professor-foreground-tree" />
        <span className="professor-foreground-hedge" />
        <span className="professor-foreground-wing" />
      </div>
      <button className="fish-spot" aria-label="Look for a fish in the fountain" onClick={() => setFishJump((value) => value + 1)}>
        <span key={fishJump} className={`fish-flight ${fishJump ? 'fish-discovered' : ''}`}>
          <Sprite pixels={fish} className="fish-sprite" />
        </span>
        <span key={`splash-${fishJump}`} className="fish-splash" aria-hidden="true" />
      </button>
    </div>
  );
}
