'use client';

import { Application } from '@pixi/react';
import { TextureSource } from 'pixi.js';
import { useEffect, useRef, useState } from 'react';
import AmbientEffects from './ambient-effects';
import HuntInterface from './hunt-interface';
import { RoundMarkers } from './round-display';
import CampusSecrets from './campus-secrets';
import CampusLighting from './campus-lighting';
import AdventurerParty from './adventurer-party';
import { dispatchHuntCommand, HUNT_COMMANDS } from './hunt-commands';

TextureSource.defaultOptions.scaleMode = 'nearest';
const campusArt = '/art/reva-campus-fog-garden.png';

export default function PixelScene() {
  const sceneRef = useRef(null);
  const mapRef = useRef(null);
  const [moving, setMoving] = useState(false);
  const pointer = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMoving(!preference.matches && !document.hidden);
    update();
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  function startHunt() {
    const map = mapRef.current;
    const bounds = map.getBoundingClientRect();
    if (bounds.top > 0 && bounds.bottom > window.innerHeight) {
      map.scrollIntoView({ block: 'center' });
    }
    dispatchHuntCommand(HUNT_COMMANDS.round1);
    dispatchHuntCommand(HUNT_COMMANDS.capture);
  }

  return (
    <div
      ref={sceneRef}
      className="pixel-scene"
      id="home"
      style={{ '--campus-art': `url(${campusArt})` }}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        pointer.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      }}
      onPointerLeave={() => { pointer.current = { x: -1000, y: -1000 }; }}
    >
      <div className="campus-map" ref={mapRef}>
        <div className="campus-frame">
          <img
            className="campus-art"
            src={campusArt}
            alt="Pixel-art REVA University campus with turquoise treasure portals, cherry blossoms, waterfalls, and a glowing path above misty woodland gardens."
            fetchPriority="high"
          />
          <CampusLighting moving={moving} />
          <AdventurerParty moving={moving} />
          <CampusSecrets moving={moving} />
          <RoundMarkers />
        </div>
      </div>
      <div className="atmosphere" aria-hidden="true">
        <div className={`mist ${moving ? 'mist-moving' : ''}`} />
        <Application resizeTo={sceneRef} antialias={false} backgroundAlpha={0} autoStart={false} roundPixels>
          <AmbientEffects pointer={pointer} moving={moving} />
        </Application>
      </div>
      <HuntInterface onHuntVerified={startHunt} />
    </div>
  );
}
