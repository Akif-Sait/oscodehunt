'use client';

import { extend, useApplication, useTick } from '@pixi/react';
import { Graphics } from 'pixi.js';
import { useCallback, useEffect, useRef } from 'react';

extend({ Graphics });

const leaves = Array.from({ length: 30 }, (_, index) => ({
  x: ((index * 317 + 61) % 1600) / 1600,
  y: ((index * 173 + 11) % 900) / 900,
  speed: 0.018 + (index % 5) * 0.004,
  phase: index * 2.4,
  color: [0xffb6db, 0xf7da79, 0xa9d765, 0xff8bc8][index % 4],
}));

export default function AmbientEffects({ pointer, moving }) {
  const graphics = useRef(null);
  const elapsed = useRef(0);
  const { app, isInitialised } = useApplication();

  // Keep the WebGL renderer alive across visibility and motion preference changes.
  useEffect(() => {
    if (!isInitialised) return;
    if (moving) {
      app.start();
    } else {
      app.stop();
    }
  }, [app, isInitialised, moving]);

  const animate = useCallback((ticker) => {
    const drawing = graphics.current;
    if (!drawing) return;
    elapsed.current += Math.min(ticker.deltaMS, 50) / 1000;
    const time = elapsed.current;
    const { width, height } = app.screen;
    const unit = Math.max(1, Math.min(width / 640, 2.5));
    drawing.clear();

    for (const leaf of leaves) {
      let x = ((leaf.x + time * leaf.speed) % 1.15 - 0.075) * width;
      let y = ((leaf.y + time * leaf.speed * 0.35) % 1.1 - 0.05) * height;
      y += Math.sin(time * 1.3 + leaf.phase) * 12;
      const dx = x - pointer.current.x;
      const dy = y - pointer.current.y;
      const distance = Math.hypot(dx, dy);
      const push = Math.max(0, 1 - distance / 120);
      x += (dx / (distance || 1)) * push * 35;
      y += (dy / (distance || 1)) * push * 35;
      const flutter = Math.sin(time * 3 + leaf.phase);
      drawing.rect(Math.round(x), Math.round(y), unit * (2 + Math.abs(flutter) * 2), unit * 2);
      drawing.rect(Math.round(x + unit), Math.round(y - unit), unit * 2, unit);
      drawing.fill({ color: leaf.color, alpha: 0.65 });
    }

    // Small stepped silhouettes cross the distant sky in a loose flock.
    for (let bird = 0; bird < 5; bird += 1) {
      const x = ((time * 0.025 + bird * 0.033 + 0.51) % 1.2 - 0.1) * width;
      const y = height * (0.07 + bird * 0.018) + Math.sin(time * 0.8 + bird) * 8;
      const wing = Math.sin(time * 5 + bird) > 0 ? -1 : 1;
      drawing.rect(Math.round(x), Math.round(y), unit * 2, unit);
      drawing.rect(Math.round(x - unit * 2), Math.round(y + wing * unit), unit * 2, unit);
      drawing.rect(Math.round(x + unit * 2), Math.round(y + wing * unit), unit * 2, unit);
      drawing.rect(Math.round(x - unit * 3), Math.round(y + wing * unit * 2), unit, unit);
      drawing.rect(Math.round(x + unit * 4), Math.round(y + wing * unit * 2), unit, unit);
      drawing.fill({ color: 0x163b60, alpha: 0.75 });
    }

    for (let mote = 0; mote < 20; mote += 1) {
      const x = ((mote * 0.137 + Math.sin(time * 0.3 + mote) * 0.004) % 1) * width;
      const y = (0.45 + ((mote * 0.071 - time * 0.009) % 0.55 + 0.55) % 0.55) * height;
      const alpha = Math.max(0, Math.sin(time * 1.6 + mote)) * 0.65;
      drawing.rect(Math.round(x), Math.round(y), unit, unit).fill({ color: 0xc0fff4, alpha });
    }
  }, [app, pointer]);

  useTick({ callback: animate, isEnabled: moving });
  return <pixiGraphics ref={graphics} />;
}
