'use client';

import { useEffect, useRef, useState } from 'react';
import { roundThreeRequest } from './round-three-api';
import './typing-sprint.css';

export default function SprintResult() {
  const dialog = useRef(null);
  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('round3') !== 'result') return;
    const element = dialog.current;
    const controller = new AbortController();
    element.showModal();
    roundThreeRequest('/api/hunt/round3/result', { signal: controller.signal })
      .then((data) => {
        if (!['score', 'wpm', 'accuracy'].every((key) => typeof data?.[key] === 'number'
          && Number.isFinite(data[key]) && data[key] >= 0) || data.accuracy > 100) throw new Error();
        setResult(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ error: true });
      });
    return () => controller.abort();
  }, [retry]);

  function clearResultMarker() {
    const url = new URL(window.location.href);
    url.searchParams.delete('round3');
    window.history.replaceState(window.history.state, '', url);
  }

  return (
    <dialog ref={dialog} className="sprint-result" aria-labelledby="sprint-result-heading" onClose={clearResultMarker}>
      <h2 id="sprint-result-heading">Typing Sprint result</h2>
      {!result && <p role="status">Loading your team’s score…</p>}
      {result?.error && (
        <p role="alert">
          Couldn’t load your saved score.{' '}
          <button type="button" className="sprint-action" onClick={() => { setResult(null); setRetry(retry + 1); }}>Retry</button>
        </p>
      )}
      {result && !result.error && (
        <>
          {result.teamName && <p>{result.teamName}</p>}
          <dl>
            <div><dt>Score</dt><dd>{result.score}</dd></div>
            <div><dt>WPM</dt><dd>{result.wpm}</dd></div>
            <div><dt>Accuracy</dt><dd>{result.accuracy}%</dd></div>
          </dl>
        </>
      )}
      <button className="sprint-action" type="button" onClick={() => dialog.current.close()}>Back to campus</button>
    </dialog>
  );
}
