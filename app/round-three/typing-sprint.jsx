'use client';

import { useEffect, useRef, useState } from 'react';
import PixelIcon from '../pixel-icon';
import './typing-sprint.css';

const duration = 300;
const words = 'focus steady bright quick skill create wonder brave little energy future moment simple strong dream build learn move swift clear shape power calm fresh practice follow reach challenge victory mind spark level'.split(' ');

function nextWords() {
  return Array.from({ length: 100 }, () => words[Math.floor(Math.random() * words.length)]).join(' ') + ' ';
}

export default function TypingSprint({ onReturn }) {
  const dialog = useRef(null);
  const input = useRef(null);
  const [teamName, setTeamName] = useState('');
  const [run, setRun] = useState(null);
  const [remaining, setRemaining] = useState(duration);
  const [save, setSave] = useState(null);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  const endsAt = run?.endsAt;

  useEffect(() => {
    if (!endsAt) return;
    input.current.focus();
    const update = () => setRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    const timer = window.setInterval(update, 200);
    update();
    return () => window.clearInterval(timer);
  }, [endsAt]);

  const finished = run !== null && remaining === 0;

  async function saveScore(score) {
    setSave({ status: 'saving', score });
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify(score),
      });
      if (!response.ok) throw new Error('Score save failed');
      const result = await response.json();
      const metrics = ['score', 'wpm', 'accuracy'];
      if (!metrics.every((name) => {
        const value = result?.[name];
        return (typeof value === 'number' || (typeof value === 'string' && value.trim() !== ''))
          && Number.isFinite(Number(value)) && Number(value) >= 0;
      }) || Number(result.accuracy) > 100) throw new Error('Invalid score response');
      setSave({
        status: 'saved',
        result: Object.fromEntries(metrics.map((name) => [name, Number(result[name])])),
      });
    } catch {
      setSave({ status: 'error', score });
    }
  }

  useEffect(() => {
    if (!finished) return;
    let correctCharacters = 0;
    for (let index = 0; index < run.typed.length; index++) {
      if (run.typed[index] === run.target[index]) correctCharacters++;
    }
    void saveScore({
      submissionId: run.id,
      teamName: run.teamName,
      correctCharacters,
      totalCharacters: run.typed.length,
      elapsedSeconds: duration,
    });
  }, [finished, run]);

  function start(event) {
    event.preventDefault();
    if (!teamName.trim()) return;
    setRun({
      id: crypto.randomUUID(),
      teamName: teamName.trim(),
      endsAt: Date.now() + duration * 1000,
      target: nextWords(),
      typed: '',
    });
  }

  function type(event) {
    if (Date.now() >= run.endsAt) return;
    const typed = event.target.value.replace(/\n/g, ' ');
    let target = run.target;
    while (target.length - typed.length < 100) target += nextWords();
    setRun({ ...run, typed, target });
  }

  const clock = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  const firstCharacter = run ? Math.max(0, run.typed.length - 80) : 0;

  return (
    <dialog
      ref={dialog}
      className="typing-sprint"
      aria-labelledby="typing-sprint-heading"
      onCancel={(event) => {
        event.preventDefault();
        if (!run || save?.status === 'saved') onReturn();
      }}
    >
      <header className="typing-sprint-header">
        <PixelIcon name="crown" aria-hidden="true" />
        <div>
          <p>Round 3 · The Surprise Event</p>
          <h2 id="typing-sprint-heading">Typing Sprint</h2>
        </div>
        {run && <output role="timer" aria-label="Time remaining">{clock}</output>}
      </header>

      {!run ? (
        <form onSubmit={start}>
          <p>Type as many words as you can in five minutes. Your accuracy determines how much of your speed counts.</p>
          <label htmlFor="sprint-team">Team name</label>
          <input id="sprint-team" autoComplete="organization" maxLength={80} required value={teamName} onChange={(event) => setTeamName(event.target.value)} />
          <button className="sprint-primary" type="submit" disabled={!teamName.trim()}>Start five-minute sprint</button>
        </form>
      ) : (
        <section className="typing-sprint-play" aria-label="Typing challenge">
          <p id="sprint-instructions">Type the words as shown, including spaces.</p>
          <div className="sprint-target" id="sprint-target">
            {Array.from(run.target.slice(firstCharacter, run.typed.length + 130), (character, offset) => {
              const index = firstCharacter + offset;
              const current = index === run.typed.length;
              const style = index < run.typed.length
                ? (run.typed[index] === character ? 'is-correct' : 'is-incorrect')
                : (current ? 'is-current' : undefined);
              return <span key={index} className={style}>{character}</span>;
            })}
          </div>
          <label htmlFor="sprint-input">Your typing</label>
          <textarea
            ref={input}
            id="sprint-input"
            rows={2}
            aria-describedby="sprint-instructions sprint-target"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            disabled={finished}
            value={run.typed}
            onChange={type}
          />
          {finished && (
            <div role="status">
              {save?.status === 'saving' && <p>Time’s up. Saving your score…</p>}
              {save?.status === 'saved' && <p>{run.teamName} earned <strong>{save.result.score} points</strong> · {save.result.wpm} WPM · {save.result.accuracy}% accuracy</p>}
              {save?.status === 'error' && <p>Your score couldn’t be saved. Retry to submit the same result.</p>}
            </div>
          )}
          {save?.status === 'error' && <button className="sprint-primary" onClick={() => saveScore(save.score)}>Retry saving score</button>}
        </section>
      )}

      {(!run || save?.status === 'saved') && <button className="sprint-return" onClick={onReturn}>Return to campus</button>}
    </dialog>
  );
}
