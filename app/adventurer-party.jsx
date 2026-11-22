'use client';

import { useEffect, useReducer } from 'react';
import { HUNT_COMMANDS } from './hunt-commands';
import RoundOneCapture from './round-one-capture';
import './adventurer-party.css';

const actors = [
  { color: 'green', sheetTop: 848, delay: 0 },
  { color: 'red', sheetTop: 457, delay: 160 },
  { color: 'blue', sheetTop: 63, delay: 320 },
];

// Foot positions in the 1672 × 941 artwork, in green/red/blue order.
const stops = [
  [[523, 666], [471, 673], [422, 679]],
  [[712, 579], [687, 588], [661, 601]],
  [[1048, 451], [1021, 457], [997, 468]],
  [[1333, 560], [1308, 565], [1283, 574]],
];

const legs = [
  { duration: 3900, trail: [
    [[574, 648], [622, 620], [663, 601], [694, 588]],
    [[531, 665], [582, 643], [626, 620], [661, 601]],
    [[486, 674], [540, 660], [594, 638], [634, 619]],
  ] },
  { duration: 4200, trail: [
    [[769, 592], [855, 548], [917, 515], [956, 470]],
    [[744, 598], [830, 560], [897, 527], [937, 482]],
    [[719, 606], [804, 573], [875, 539], [920, 495]],
  ] },
  { duration: 4200, trail: [
    [[1089, 469], [1152, 499], [1222, 527], [1282, 550]],
    [[1066, 471], [1127, 506], [1197, 536], [1257, 555]],
    [[1042, 475], [1103, 512], [1171, 543], [1231, 563]],
  ] },
];

const walkTargets = [HUNT_COMMANDS.round1, HUNT_COMMANDS.round2, HUNT_COMMANDS.round3];

const captureCommands = [HUNT_COMMANDS.capture, HUNT_COMMANDS.capture, HUNT_COMMANDS.captureRound2, HUNT_COMMANDS.captureRound3];
const releaseCommands = [HUNT_COMMANDS.release, HUNT_COMMANDS.release, HUNT_COMMANDS.releaseRound2, HUNT_COMMANDS.releaseRound3];

function transition(location, command) {
  const target = walkTargets.indexOf(command) + 1;
  if (target && !location.inside && target === location.round + 1) {
    return { phase: 'walking', to: { round: target, inside: false } };
  }
  if (command === captureCommands[location.round] && !location.inside) {
    return { phase: 'capturing', to: { ...location, inside: true } };
  }
  if (command === releaseCommands[location.round] && location.inside) {
    return { phase: 'releasing', to: { ...location, inside: false } };
  }
  return null;
}

function advance(location, queue, reducedMotion) {
  for (let index = 0; index < queue.length; index++) {
    const next = transition(location, queue[index]);
    if (!next) continue;
    if (!reducedMotion) return { location, active: next, queue: queue.slice(index + 1) };
    location = next.to;
  }
  return { location, active: null, queue: [] };
}

function partyReducer(state, action) {
  if (action.type === 'finish') {
    return state.active?.phase === action.phase
      ? advance(state.active.to, state.queue, action.reducedMotion)
      : state;
  }
  if (action.type === 'reduce-motion') {
    return advance(state.active?.to ?? state.location, state.queue, true);
  }
  if (!state.active) return advance(state.location, [action.command], action.reducedMotion);

  // Validate queued commands against where the party will be when they run.
  const destination = state.queue.reduce(
    (location, command) => transition(location, command)?.to ?? location,
    state.active.to,
  );
  return transition(destination, action.command)
    ? { ...state, queue: [...state.queue, action.command] }
    : state;
}

function actorStyle(actor, index, round, walking) {
  const leg = walking ? legs[round] : null;
  const [x, y] = stops[round][index];
  const points = leg ? [[x, y], ...leg.trail[index], stops[round + 1][index]] : [[x, y]];
  const pullDelay = Math.round(actor.delay * .9);
  const style = {
    '--sheet-top': actor.sheetTop,
    '--walk-delay': `${actor.delay}ms`,
    '--step-duration': `${(leg?.duration ?? 0) / 10}ms`,
    '--walk-duration': `${leg?.duration ?? 0}ms`,
    '--pull-delay': `${pullDelay}ms`,
    '--release-delay': `${780 - pullDelay}ms`,
  };
  points.forEach(([px, py], step) => {
    style[`--walk-x${step}`] = `${px / 1672 * 100}%`;
    style[`--walk-y${step}`] = `${py / 941 * 100}%`;
  });
  return style;
}

export default function AdventurerParty({ moving }) {
  const [{ location, active }, dispatch] = useReducer(partyReducer, {
    location: { round: 0, inside: false },
    active: null,
    queue: [],
  });
  const phase = active?.phase ?? (location.inside ? 'gone' : 'idle');
  const portal = phase === 'capturing' || phase === 'releasing';

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const command = (event) => dispatch({ type: 'command', command: event.type, reducedMotion: preference.matches });
    const updatePreference = () => {
      if (preference.matches) dispatch({ type: 'reduce-motion' });
    };
    const commands = Object.values(HUNT_COMMANDS);
    commands.forEach((name) => window.addEventListener(name, command));
    preference.addEventListener('change', updatePreference);
    return () => {
      commands.forEach((name) => window.removeEventListener(name, command));
      preference.removeEventListener('change', updatePreference);
    };
  }, []);

  useEffect(() => {
    if (phase === 'gone' && location.round === 3) window.location.assign('/round-three');
  }, [phase, location.round]);

  function finish() {
    dispatch({ type: 'finish', phase, reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches });
  }

  return (
    <>
      <div className={`adventurer-party${moving ? '' : ' adventurers-paused'}`} data-phase={phase} data-round={location.round} aria-hidden="true">
        <link rel="preload" as="image" href="/art/adventurer-raised.webp" fetchPriority="low" />
        {phase !== 'gone' && actors.map((actor, index) => (
          <div
            key={`${location.round}-${actor.color}`}
            className="adventurer"
            style={actorStyle(actor, index, location.round, phase === 'walking')}
            onAnimationEnd={index === actors.length - 1 ? (event) => {
              if (event.target === event.currentTarget && event.animationName === 'adventurer-walk') finish();
            } : undefined}
          >
            <span className="adventurer-shadow" />
            <span className="adventurer-sprite" />
            {portal && <span className={`adventurer-raised-pose adventurer-raised-pose-${actor.color}`} />}
          </div>
        ))}
        {portal && <RoundOneCapture key={phase} onFinish={finish} />}
      </div>
    </>
  );
}
