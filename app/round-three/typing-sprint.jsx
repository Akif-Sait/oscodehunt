'use client';

import { useEffect, useRef, useState } from 'react';
import { roundThreeRequest } from './round-three-api';
import './typing-sprint.css';

const attemptPath = '/api/hunt/round3/attempt';
const wordsPerPage = 16;

function formatTime(seconds) {
  return [Math.floor(seconds / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');
}

function Prompt({ prompt, typed }) {
  let cursor = 0;
  const pages = [];
  const tokens = prompt.match(/\S+\s*/g) ?? [];
  for (let start = 0; start < tokens.length; start += wordsPerPage) {
    const text = tokens.slice(start, start + wordsPerPage).join('');
    pages.push({ start: cursor, end: cursor + text.length, text });
    cursor += text.length;
  }
  const page = pages.find(({ end }) => typed.length < end) ?? pages.at(-1);
  let index = page.start;
  return (
    <div className="sprint-prompt" id="sprint-prompt">
      {page.text.match(/\S+\s*/g).map((token) => {
        const start = index;
        return <span className="sprint-word" key={start}>{Array.from(token, (character) => {
          const position = index++;
          const state = position === typed.length ? 'current' : position < typed.length
            ? (typed[position] === character ? 'correct' : 'incorrect')
            : undefined;
          return <span data-letter={state} key={position}>{character}</span>;
        })}</span>;
      })}
    </div>
  );
}

export default function TypingSprint() {
  const [access, setAccess] = useState({ state: 'loading' });
  const [attempt, setAttempt] = useState(null);
  const [remaining, setRemaining] = useState(300);
  const [typed, setTyped] = useState('');
  const [save, setSave] = useState('idle');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(false);
  const entry = useRef(null);
  const startedSave = useRef(false);

  useEffect(() => {
    const request = new AbortController();
    roundThreeRequest('/api/hunt/round3/access', { signal: request.signal })
      .then(({ enabled, teamId, teamName }) => {
        setAccess(enabled === true && typeof teamId === 'string' && teamId
          ? { state: 'ready', teamName: teamName || teamId }
          : { state: 'locked' });
      })
      .catch((error) => {
        if (!request.signal.aborted) setAccess({ state: [401, 403, 404].includes(error.status) ? 'locked' : 'error' });
      });
    return () => request.abort();
  }, []);

  async function start() {
    if (starting || access.state !== 'ready') return;
    setStarting(true);
    setStartError(false);
    try {
      const data = await roundThreeRequest(attemptPath, { body: {} });
      const deadline = Date.parse(data.deadline);
      if (typeof data.attemptId !== 'string' || !data.attemptId || typeof data.prompt !== 'string'
        || !data.prompt.trim() || data.prompt !== data.prompt.trim() || !Number.isFinite(deadline) || deadline <= Date.now()) throw new Error();
      setRemaining(Math.ceil((deadline - Date.now()) / 1000));
      setAttempt({ id: data.attemptId, prompt: data.prompt, deadline });
    } catch (error) {
      if ([401, 403].includes(error.status)) setAccess({ state: 'locked' });
      else setStartError(true);
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    if (!attempt) return;
    entry.current?.focus();
    const update = () => setRemaining(Math.max(0, Math.ceil((attempt.deadline - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 200);
    return () => window.clearInterval(timer);
  }, [attempt]);

  const finished = Boolean(attempt) && (remaining === 0 || typed.length === attempt.prompt.length);

  async function saveAttempt() {
    setSave('saving');
    try {
      const result = await roundThreeRequest('/api/scores', { body: { attemptId: attempt.id, typedText: typed } });
      if (result?.saved !== true) throw new Error();
      window.location.replace('/?round3=result');
    } catch {
      setSave('error');
    }
  }

  useEffect(() => {
    if (!finished || startedSave.current) return;
    startedSave.current = true;
    void saveAttempt();
  }, [finished]);

  return (
    <main className="sprint-page">
      <header className="sprint-masthead">
        <img src="/art/oscode-cyan.svg" width="36" height="36" alt="" />
        <span>OSCode <span className="sprint-brand-divider">/</span> Gameverse</span>
      </header>
      <section className="sprint-stage" aria-labelledby="sprint-heading">
        <div className="sprint-stage-header">
          <div>
            <p className="sprint-kicker">Round 3 · The Surprise Event</p>
            <h1 id="sprint-heading">Typing Sprint</h1>
          </div>
          {access.state === 'ready' && <output role="timer" aria-label="Time remaining">{formatTime(remaining)}</output>}
        </div>
        {access.state === 'loading' && <p role="status">Checking round access…</p>}
        {access.state === 'locked' && <p role="status">Round 3 is locked. Your team can open it from the campus when the organizers enable it.</p>}
        {access.state === 'error' && <p role="alert">Couldn’t check round access. Reload the page to try again.</p>}
        {access.state === 'ready' && !attempt && (
          <div className="sprint-ready">
            <p>Team <strong>{access.teamName}</strong></p>
            <p>Type the words as shown, including spaces. You have five minutes.</p>
            <button className="sprint-action" type="button" disabled={starting} onClick={start}>{starting ? 'Starting…' : 'Start sprint'}</button>
            {startError && <p role="alert">Couldn’t start the sprint. Try again.</p>}
          </div>
        )}
        {attempt && (
          <>
            <p id="sprint-instructions">Type in the passage below. Use Backspace to correct a letter.</p>
            <div className="sprint-typing-surface">
              <Prompt prompt={attempt.prompt} typed={typed} />
              <textarea ref={entry} className="sprint-entry" aria-label="Type the passage" aria-describedby="sprint-instructions sprint-prompt"
                value={typed} disabled={finished} maxLength={attempt.prompt.length}
                spellCheck={false} autoCorrect="off" autoCapitalize="off" autoComplete="off"
                onPaste={(event) => event.preventDefault()}
                onChange={(event) => {
                  if (Date.now() < attempt.deadline) setTyped(event.target.value.replace(/\n/g, ' '));
                }}
              />
            </div>
            {save === 'saving' && <p role="status">Saving your result…</p>}
            {save === 'error' && <div role="status"><p>Couldn’t save your result.</p><button className="sprint-action" onClick={saveAttempt}>Retry saving</button></div>}
          </>
        )}
        {!attempt && <a className="sprint-back" href="/">Return to campus</a>}
      </section>
    </main>
  );
}
