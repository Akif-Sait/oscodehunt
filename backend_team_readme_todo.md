# Gameverse Tech Treasure Hunt backend TODO

The Next.js frontend has the token prompt and campus animations at `/`, and the five-minute typing sprint at `/round-three`. The backend team owns verification, team sessions, official scoring, and progression. The finale still needs implementation. Production acceptance requires a test against the live backend.

## 1. Deploy and connect the frontend

- [ ] Use Node.js 22.x. Run `npm ci` and `npm run dev` from the repo root for local development. Use `npm run build` followed by `npm start` for the production build.
- [ ] Serve the frontend over HTTPS. Route `/api/hunt/verify-token`, `/api/hunt/round3/*`, and `/api/scores` to the backend on the same origin. Configure equivalent routing in development so the browser can use these relative URLs.
- [ ] Configure the database, secrets, and migrations outside the repo. Test API routing and cookie behavior against the actual deployment origin.
- [ ] Use the registered team record as the source of team identity. The event announced teams of four. The public registration form is separate from the in-game token prompt.

## 2. Verify the secret token

- [ ] Implement `POST /api/hunt/verify-token`. The browser sends `Content-Type: application/json`, `Accept: application/json`, and `{"token":"<secret token>"}`.
- [ ] Verify that the token maps to an eligible registered team. Establish a server-backed session using a Secure, HttpOnly, SameSite cookie and return `200 {"verified":true}`. Expire sessions and keep tokens and session secrets out of logs.
- [ ] Protect cookie-authenticated mutations against cross-site requests. Validate the expected origin and content type and require a CSRF token where applicable. Apply request size limits and validate all accepted fields on the server.
- [ ] Enforce rate limits and return JSON errors without revealing token validity details beyond the accepted/rejected result.

| Response | Existing browser behavior |
| --- | --- |
| 2xx with `{"verified":true}` | Close the dialog and queue `move to round1`, then `round1jumanji`. |
| 2xx with `{"verified":false}`, or status `400`, `401`, `403`, or `422` | Keep the dialog open and report that the token was rejected. |
| `429` | Ask the player to wait before trying again. |
| Other statuses, invalid response bodies, or network errors | Keep the dialog open and report that verification is unavailable. |

The current token adapter consumes the `verified` flag. Returning extra progression fields from verification will require corresponding frontend wiring. [Token adapter](app/login/verify-token.js)

## 3. Persist and deliver round progression

- [ ] Store each team's current round, completion state, and elimination or qualification status on the server. Authorize each start, submission, and transition against the team session. Browser events only drive the scene.
- [ ] Choose the progress delivery mechanism with the frontend team. A round submission response or a server event stream can both feed the browser-side `dispatchHuntCommand(command)` helper. The helper exists today. There is no listener for server progress updates yet.
- [ ] Return authoritative progress on refresh or reconnect and wire the client to restore the corresponding state. The campus animation queue currently resets on reload, and successful token entry starts the Round 1 sequence.

| Server-confirmed step | Browser commands, in order |
| --- | --- |
| Enter Round 1 | `move to round1`, `round1jumanji` |
| Advance to Round 2 | `round1jumanji:reverse`, `move to round2`, `round2jumanji` |
| Advance to Round 3 | `round2jumanji:reverse`, `move to round3`, `round3jumanji` |
| Release the party before the Round 3 page opens | `round3jumanji:reverse` |

Valid commands queue while the scene animates. Send the matching reverse command before asking the party to walk to the next landmark. Round 3 opens `/round-three` after the crown capture, or immediately when reduced motion is enabled. Only send Round 3 commands after the backend grants access. Returning to the homepage resets the local scene, so restore server-confirmed progress when that integration is wired. [Command helper](app/hunt-commands.js) · [Scene state and queue](app/adventurer-party.jsx)

## 4. Implement the round services

| Round | Backend and frontend work remaining |
| --- | --- |
| 1 · The Code Gate | Deliver the timed algorithmic challenge, accept and judge submissions, and mark qualifying teams. Agree on the problem set and time limit with organizers. The laptop animation is implemented. |
| 2 · The Campus Trail | Deliver digital clues, record hidden checkpoints and required items, and verify completion before advancing teams. Agree on the checkpoint validation method with organizers. The magnifier animation is implemented. |
| 3 · The Surprise Event | Connect the existing five-minute typing sprint to official attempt tracking and score storage. Keep the challenge details out of player-facing promotional copy. |
| 4 · The Grand Finale | Admit the final five teams to the rapid-fire tech quiz. Agree on question delivery, timers, ranking, and tie-breaks. The map marker and card exist. The quiz, transition, and winner display still need implementation. |

Confirm qualification thresholds, tie-breaks, and retake rules with organizers before publishing official rankings.

## 5. Gate the standalone Typing Sprint and save official scores

### Admin enablement and team handoff

- [ ] Add an authenticated admin control to enable or disable Round 3. Check the setting on every access, attempt-start, and submission request. Also enforce team eligibility and attempt limits.
- [ ] When a team qualifies and Round 3 is enabled, bind its registered team ID and passcode to the existing server-side team session, or exchange the passcode server-side for a short-lived scoped grant in a Secure, HttpOnly cookie. The frontend reads the team ID from the access response and sends the session cookie on same-origin requests. The raw passcode stays server-side. Keep it out of page URLs, JSON responses, browser storage, and logs.
- [ ] Guard the `/round-three` route at the backend or hosting gateway. Redirect ineligible visitors to `/` or return 404. The route is absent from navigation and opted out of search indexing. The frontend also checks access before showing a prompt or a Start button. Server enforcement protects the challenge and data.
- [ ] Return `Cache-Control: private, no-store` for all team-specific responses. Keep admin controls and team passcodes behind server authorization.

### Frontend API contract

| Endpoint | Request | Successful JSON response |
| --- | --- | --- |
| `GET /api/hunt/round3/access` | Existing session or scoped grant cookie | `{"enabled":true,"teamId":"team-42","teamName":"Example Team"}`. The team ID is a nonempty string. The name is optional. |
| `POST /api/hunt/round3/attempt` | `{}` | `{"attemptId":"attempt-42","prompt":"focus steady bright","deadline":"2026-11-25T11:35:00Z"}`. Supply a server-generated passage without leading or trailing whitespace. The example is shortened. Use a sufficiently long passage of ASCII words separated by single spaces for the full five-minute run. |
| `POST /api/scores` | `{"attemptId":"attempt-42","typedText":"focus steady"}` | `{"saved":true}` after the result is committed. |
| `GET /api/hunt/round3/result` | Existing team session | `{"score":36,"wpm":40,"accuracy":90,"teamName":"Example Team"}` for the team's latest completed attempt. Use JSON numbers for the three metrics. |

Use 401 for a missing or expired session and 403 for a valid session with no round access. The access endpoint can also return `{"enabled":false}` when closed. Reject attempts and scores for other teams. The client shows an availability error for unexpected responses. The existing standalone Monkeytyping application uses a different score payload. The hunt APIs must implement the contract above or adapt it server-side.

- [ ] Create a server-owned attempt with a fixed passage and an absolute deadline five minutes from start. Make attempt creation idempotent for an active team attempt so a lost response can be retried safely.
- [ ] On submission, look up the attempt by ID and authenticated team, compare the typed text against the assigned passage, and calculate metrics server-side. The UI finishes on expiry or when the full passage is typed. Define how early passage completion is scored and allow a bounded delivery grace period after expiry so a valid timed submission can arrive over the network.
- [ ] For the original five-minute formula, WPM is total characters ÷ 25, accuracy is correct characters ÷ total characters × 100, and score is WPM × the accuracy fraction. Use zero for all metrics on an empty attempt. Agree on deadline enforcement, retakes, and ranking with the organizers.
- [ ] Persist the result before acknowledging the save. Make repeats of the same team and attempt return the original success without inserting another score. Return only that team's result from the result endpoint.
- [ ] A failed save leaves the submission on screen for retry. After a confirmed save, the browser replaces the sprint page with `/?round3=result` and opens a result dialog. The query marker opens the UI and carries no team credentials or score data. Resume after reload during a sprint still needs a persistence design.

[Typing page](app/round-three/typing-sprint.jsx) · [Homepage score dialog](app/round-three/sprint-result.jsx)

## 6. Acceptance checks

- [ ] A valid token creates a team session and starts Round 1. Invalid tokens, throttled requests, and unavailable APIs show the expected dialog messages.
- [ ] Requests without a session, from another team, or for an ineligible round are denied.
- [ ] Admin controls require an admin session. Cross-site requests and oversized or malformed submissions are rejected. Verify that every protected endpoint checks session and team ownership independently.
- [ ] A team can finish each implemented round and receive the next command sequence once. Refresh or reconnect restores their server-confirmed progress once that integration is wired.
- [ ] With Round 3 disabled or the team ineligible, a direct visit cannot reveal the typing prompt. When the admin enables it and grants a team access, the crown animation opens the page with the right team. No passcode appears in the browser URL or client data.
- [ ] A real five-minute run submits to the deployed score endpoint and persists one result. The page returns home and the popup reads back the stored score, WPM, and accuracy. Verify both a normal run and an empty run.
- [ ] Retrying after a timeout or failed response returns the original result without creating a duplicate. Unusable responses keep the retry option available.
- [ ] Exactly five eligible teams can access the finale. Verify ranking and tie-break behavior once the rules and quiz are implemented.

### Preview the campus flow without backend calls

Open the homepage and paste this into the browser console. These commands animate the map and open the Round 3 URL. The page still checks access and requires a backend grant before exposing the sprint.

```js
[
  'move to round1',
  'round1jumanji',
  'round1jumanji:reverse',
  'move to round2',
  'round2jumanji',
  'round2jumanji:reverse',
  'move to round3',
  'round3jumanji',
].forEach((command) => window.dispatchEvent(new Event(command)));
```

Reload the homepage to reset the campus preview.
