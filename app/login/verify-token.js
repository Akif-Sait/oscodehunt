const verificationUnavailable = 'Token verification is unavailable right now. Try again in a moment.';
const tokenRejected = 'That token was not accepted. Check it and try again.';

export async function verifyToken(token, signal) {
  const response = await fetch('/api/hunt/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    body: JSON.stringify({ token }),
  });

  if ([400, 401, 403, 422].includes(response.status)) return { error: tokenRejected, invalidToken: true };
  if (response.status === 429) return { error: 'Too many attempts. Wait a moment and try again.' };
  if (!response.ok) return { error: verificationUnavailable };

  const result = await response.json();
  if (result?.verified === true) return { verified: true };
  if (result?.verified === false) return { error: tokenRejected, invalidToken: true };
  return { error: verificationUnavailable };
}

export { verificationUnavailable };
