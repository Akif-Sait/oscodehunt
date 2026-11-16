'use client';

import { useEffect, useReducer } from 'react';
import RoundOneCapture from './round-one-capture';
import './adventurer-party.css';

// Foot positions in the 1672 × 941 campus artwork, from the portal to the laptop.
const routes = [
  { color: 'green', sheetTop: 848, delay: 0, points: [[523, 666], [597, 634], [652, 603], [712, 579]] },
  { color: 'red', sheetTop: 457, delay: 320, points: [[471, 673], [578, 645], [634, 615], [687, 588]] },
  { color: 'blue', sheetTop: 63, delay: 630, points: [[422, 679], [550, 654], [613, 629], [661, 601]] },
];

function routeStyle({ points, sheetTop, delay }) {
  const style = { '--sheet-top': sheetTop, '--walk-delay': `${delay}ms`, '--pull-delay': `${Math.round(delay * .46)}ms` };
  ['start', 'path', 'trail', 'finish'].forEach((step, index) => {
    const [x, y] = points[index];
    style[`--${step}-x`] = `${x / 1672 * 100}%`;
    style[`--${step}-y`] = `${y / 941 * 100}%`;
  });
  return style;
}

function partyReducer(state, action) {
  switch (action.type) {
    case 'walk':
      return state.phase === 'idle' ? { phase: action.reducedMotion ? 'arrived' : 'walking' } : state;
    case 'capture':
      if (state.phase === 'capturing' || state.phase === 'gone') return state;
      if (action.reducedMotion) return { phase: 'gone' };
      if (state.phase === 'walking') return { ...state, captureQueued: true };
      return { phase: 'capturing', origin: state.phase === 'arrived' ? 'round1' : 'portal' };
    case 'walk-finished':
      if (state.phase !== 'walking') return state;
      return state.captureQueued ? { phase: 'capturing', origin: 'round1' } : { phase: 'arrived' };
    case 'capture-finished':
      return state.phase === 'capturing' ? { phase: 'gone' } : state;
    case 'reduce-motion':
      if (state.phase === 'capturing' || state.captureQueued) return { phase: 'gone' };
      return state.phase === 'walking' ? { phase: 'arrived' } : state;
    default:
      return state;
  }
}

export default function AdventurerParty({ moving }) {
  const [{ phase, origin }, dispatch] = useReducer(partyReducer, { phase: 'idle' });

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const startWalking = () => dispatch({ type: 'walk', reducedMotion: preference.matches });
    const startCapture = () => dispatch({ type: 'capture', reducedMotion: preference.matches });
    const updatePreference = () => {
      if (preference.matches) dispatch({ type: 'reduce-motion' });
    };

    window.addEventListener('move to round1', startWalking);
    window.addEventListener('round1jumanji', startCapture);
    preference.addEventListener('change', updatePreference);
    return () => {
      window.removeEventListener('move to round1', startWalking);
      window.removeEventListener('round1jumanji', startCapture);
      preference.removeEventListener('change', updatePreference);
    };
  }, []);

  return (
    <div className={`adventurer-party${moving ? '' : ' adventurers-paused'}`} data-phase={phase} data-capture-origin={origin} aria-hidden="true">
      <link rel="preload" as="image" href="/art/adventurer-raised.webp" fetchPriority="low" />
      {phase !== 'gone' && routes.map((route) => (
        <div
          key={route.color}
          className="adventurer"
          style={routeStyle(route)}
          onAnimationEnd={route.color === 'blue' ? (event) => {
            if (event.target === event.currentTarget && event.animationName === 'adventurer-walk') dispatch({ type: 'walk-finished' });
          } : undefined}
        >
          <span className="adventurer-shadow" />
          <span className="adventurer-sprite" />
          {phase === 'capturing' && <span className={`adventurer-raised-pose adventurer-raised-pose-${route.color}`} />}
        </div>
      ))}
      {phase === 'capturing' && <RoundOneCapture onFinish={() => dispatch({ type: 'capture-finished' })} />}
    </div>
  );
}
