import { useEffect, useRef } from 'react';

const width = 240;
const height = 112;

function drawGate(context) {
  function rect(color, x, y, w, h) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
  }

  function ellipse(color, x, y, rx, ry) {
    for (let row = -ry; row <= ry; row += 1) {
      const span = Math.floor(rx * Math.sqrt(1 - (row / ry) ** 2));
      rect(color, x - span, y + row, span * 2 + 1, 1);
    }
  }

  let seed = 222;
  function random(max) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return Math.floor(seed / 4294967296 * max);
  }

  const sky = context.createLinearGradient(0, 0, 0, 86);
  sky.addColorStop(0, '#030f24');
  sky.addColorStop(.45, '#09223a');
  sky.addColorStop(1, '#164d62');
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
  for (let index = 0; index < 75; index += 1) {
    const x = random(width);
    const y = 3 + random(71);
    rect(['#18445c', '#326d80', '#63b0b2'][random(3)], x, y, 1 + random(2), 1);
  }

  // Two rows of tree canopies stand behind the gate. Each cluster has a lit rim.
  for (const [y, shadow, light] of [[69, '#082b42', '#133e50'], [80, '#073047', '#144d5d']]) {
    for (let x = -8; x < width + 14; x += 7 + random(8)) {
      const treeHeight = 9 + random(17);
      ellipse(shadow, x, y - 3, 6 + random(7), treeHeight);
      ellipse(light, x - 2, y - treeHeight + 1, 4 + random(3), 2 + random(5));
      rect(shadow, x, y - 4, 3, 13);
    }
  }

  // The entry platform is drawn row by row to keep its diagonal edges on the grid.
  for (let row = 0; row < 33; row += 1) {
    const y = 78 + row;
    const left = 48 - row;
    const right = 191 + row;
    for (let x = left; x < right; x += 1) {
      const grout = y % 6 === 0 || (x + Math.floor(y / 6) * 11) % 23 === 0;
      const glow = Math.abs(x - 120) < 36 + row / 2;
      const color = grout ? '#13293b' : glow ? '#31546a' : '#1d384d';
      rect(color, x, y, 1, 1);
      if (!grout && random(34) === 0) rect(glow ? '#40697a' : '#2b465a', x, y, 2, 1);
    }
  }

  for (let index = 0; index < 3; index += 1) {
    const x = 76 - index * 6;
    const y = 81 + index * 6;
    rect('#0c2134', x - 1, y + 1, 90 + index * 12, 6);
    rect('#3c6d83', x, y, 88 + index * 12, 2);
    rect('#438895', x + 20 + index * 4, y, 48 + index * 4, 1);
    rect('#28495f', x, y + 2, 88 + index * 12, 3);
  }

  const energy = ['#093151', '#09526b', '#0c7389', '#1b99a5', '#44c7bf', '#9dedcf'];
  const stone = ['#20344f', '#304764', '#405d76', '#54718a', '#7390a1'];

  for (let y = 13; y < 82; y += 1) {
    for (let x = 80; x <= 160; x += 1) {
      const dx = x - 120;
      const dy = y - 50;
      const radius = dy < 0 ? Math.hypot(dx, dy) : Math.abs(dx);
      if (radius > 37) continue;

      if (radius < 27) {
        const wave = Math.sin(Math.hypot(dx * 1.1, (y - 60) * .72) / 2.6 + y * .08);
        const reflected = Math.max(0, (y - 42) / 17);
        const index = Math.max(0, Math.min(energy.length - 1, Math.floor(1 + wave + reflected + random(2) * .45)));
        rect(radius >= 25 ? '#7bf9ed' : energy[index], x, y, 1, 1);
        continue;
      }

      const joint = dy < 0 ? Math.atan2(dy, dx) * 17 + 54 : dy / .55;
      const seam = dy < 0 ? joint % 7 < .9 : Math.floor(dy) % 8 < 1;
      const chisel = Math.min(4, (dx < 0 ? 2 : 1) + (radius > 34 ? 1 : 0) + (random(16) < 3 ? 1 : 0));
      rect(seam || radius > 36 ? '#142a44' : stone[chisel], x, y, 1, 1);
      if (radius < 28) rect('#33a8b7', x, y, 1, 1);
    }
  }

  // Gold keystone, lintel and the illuminated threshold.
  rect('#132238', 113, 12, 14, 9);
  rect('#7b552d', 114, 12, 12, 7);
  rect('#e4ad54', 115, 12, 10, 2);
  rect('#fbdc84', 118, 14, 4, 3);

  // Lichen gathers in the joints, with vines dangling off the two shoulders.
  for (const [x, y, direction, length] of [[92, 28, -1, 18], [146, 26, 1, 17], [156, 52, 1, 14]]) {
    for (let row = 0; row < length; row += 1) {
      const px = x + direction * Math.floor(row / 5);
      rect('#173f44', px, y + row, 2, 1);
      if (row % 3 === 0) {
        rect('#3d8266', px - direction * 2, y + row, 3, 2);
        rect('#8cb579', px, y + row - 1, 2, 1);
      }
    }
  }

  rect('#1e4f66', 83, 79, 74, 4);
  rect('#61dce0', 93, 79, 54, 2);
  rect('#c0fff0', 106, 79, 28, 1);

  // Pixel lock. The larger turquoise glow is part of the stone portal.
  rect('#062947', 110, 37, 20, 25);
  rect('#80502a', 112, 37, 16, 4);
  rect('#f7c65b', 114, 35, 12, 3);
  rect('#ffd77a', 111, 38, 5, 12);
  rect('#c18443', 125, 38, 4, 12);
  rect('#ffdb76', 109, 46, 22, 3);
  rect('#d6943c', 109, 49, 22, 12);
  rect('#a86b33', 126, 49, 5, 12);
  rect('#71502d', 109, 60, 22, 3);
  rect('#fff0ac', 110, 47, 16, 2);
  rect('#263548', 118, 51, 4, 4);
  rect('#263548', 119, 55, 2, 3);

  // Small lanterns and ivy frame the gate without covering the stairs.
  for (const x of [70, 166]) {
    rect('#284b63', x - 2, 63, 7, 18);
    rect('#637482', x - 3, 61, 9, 4);
    rect('#72502d', x - 2, 54, 7, 8);
    rect('#e29a45', x - 1, 54, 5, 6);
    rect('#fff1b8', x, 53, 2, 5);
    rect('#f4ac56', x + 1, 51, 1, 1);
  }

  for (const [x, y, spread] of [[23, 89, 46], [41, 102, 36], [191, 86, 28], [213, 104, 37], [88, 76, 13], [152, 77, 15]]) {
    for (let index = 0; index < spread * 2; index += 1) {
      const px = x - (spread >> 1) + random(spread);
      const py = y - random(15);
      const leaf = ['#083444', '#12534e', '#1b6b59', '#398477', '#68a895'][random(5)];
      rect(leaf, px, py, 1 + random(4), 1 + random(3));
      if (random(12) === 0) rect(random(2) ? '#9779ac' : '#7bcbed', px, py - 1, 2, 1);
    }
  }

  for (const [x, y] of [[57, 25], [68, 42], [155, 18], [170, 38], [185, 65], [48, 70], [107, 25], [132, 67]]) {
    rect('#52bad0', x - 1, y, 3, 1);
    rect('#9ef4f0', x, y - 1, 1, 3);
  }
}

export default function TokenGate() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    if (context) drawGate(context);
  }, []);

  return (
    <div className="hunt-login-art" aria-hidden="true">
      <canvas ref={canvasRef} width={width} height={height} />
      <span className="hunt-login-embers" />
    </div>
  );
}
