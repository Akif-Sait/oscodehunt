'use client';

import { useEffect, useRef, useState } from 'react';
import '@fontsource/press-start-2p/latin-400.css';
import PixelIcon from '../pixel-icon';
import TokenGate from './token-gate';
import { verifyToken, verificationUnavailable } from './verify-token';
import './hunt-login.css';

export default function HuntLogin({ dialogRef, onVerified }) {
  const formRef = useRef(null);
  const tokenRef = useRef(null);
  const requestRef = useRef(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => () => requestRef.current?.abort(), []);

  function reset() {
    requestRef.current?.abort();
    requestRef.current = null;
    formRef.current.reset();
    setError(null);
    setPending(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (requestRef.current) return;

    const token = tokenRef.current.value;
    if (!token.trim()) {
      setError({ error: 'Enter your secret token.', invalidToken: true });
      tokenRef.current.focus();
      return;
    }

    const request = new AbortController();
    requestRef.current = request;
    setPending(true);
    setError(null);

    let result;
    try {
      result = await verifyToken(token, request.signal);
    } catch {
      result = { error: verificationUnavailable };
    }

    if (requestRef.current !== request || !dialogRef.current?.open) return;
    requestRef.current = null;
    setPending(false);
    if (!result.verified) {
      setError(result);
      tokenRef.current.focus();
      return;
    }

    dialogRef.current.close();
    onVerified();
  }

  return (
    <dialog
      id="hunt-login"
      ref={dialogRef}
      className="hunt-login"
      aria-labelledby="hunt-login-title"
      aria-describedby="hunt-login-description"
      onClose={reset}
      onCancel={reset}
    >
      <div className="hunt-login-frame">
        <div className="hunt-login-panel">
          <button type="button" className="hunt-login-close" aria-label="Close token entry" onClick={() => { reset(); dialogRef.current.close(); }}>
            <PixelIcon name="close" />
          </button>
          <TokenGate />
          <h2 id="hunt-login-title">Enter the Hunt</h2>
          <p id="hunt-login-description">Enter the secret token to continue.</p>

          <form ref={formRef} className="hunt-login-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="hunt-secret-token">Secret token</label>
            <input
              ref={tokenRef}
              id="hunt-secret-token"
              name="token"
              type="password"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              required
              readOnly={pending}
              aria-invalid={error?.invalidToken || undefined}
              aria-describedby={error ? 'hunt-login-error' : undefined}
              onChange={() => { if (error) setError(null); }}
            />
            {error && <p id="hunt-login-error" className="hunt-login-error" role="alert">{error.error}</p>}
            <button className="hunt-login-submit" type="submit" disabled={pending}>
              <span>{pending ? 'Verifying…' : 'Continue'}</span>
              {pending ? <span className="hunt-login-spinner" aria-hidden="true" /> : <PixelIcon name="arrow" />}
            </button>
            <span className="hunt-login-status" role="status">{pending ? 'Verifying token.' : ''}</span>
          </form>
        </div>
      </div>
    </dialog>
  );
}
