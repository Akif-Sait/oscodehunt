import './round-one-capture.css';

// Pixel fragments curve inward to the screen. Coordinates use adventurer widths.
const fragments = [
  [-3.1, 2.2, 0, 4], [-2.6, 1.8, 190, 3], [-2.5, 2.8, 270, 2],
  [-2.1, 1.05, 110, 2], [-1.8, 2.15, 460, 4], [-1.6, .45, 70, 3],
  [-1.45, -.8, 140, 3], [-1.2, 1.3, 580, 2], [-.8, -1.3, 240, 2],
  [-.55, 2.05, 300, 3], [-.2, .8, 710, 4], [.3, -1.4, 320, 2],
  [.54, 1.32, 640, 3], [.9, .75, 490, 4], [1.1, -.7, 400, 3],
  [1.4, 1.1, 530, 2], [1.45, -.25, 810, 3], [1.6, .4, 600, 2],
];

export default function RoundOneCapture({ onFinish }) {
  return (
    <div className="round-one-capture" onAnimationEnd={(event) => {
      if (event.target === event.currentTarget && event.animationName === 'round-one-capture') onFinish();
    }}>
      <span className="console-spill" />
      <span className="console-screen" />
      <span className="console-siphon" />
      <span className="console-ring console-ring-outer" />
      <span className="console-ring console-ring-middle" />
      <span className="console-ring console-ring-inner" />
      <span className="console-orbit" />
      <span className="console-burst" />
      {fragments.map(([x, y, delay, size]) => (
        <span
          key={`${x}:${y}`}
          className="console-fragment"
          style={{ '--fragment-x': x, '--fragment-y': y, '--fragment-delay': `${delay}ms`, '--fragment-size': size }}
        />
      ))}
    </div>
  );
}
