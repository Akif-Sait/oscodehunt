# Gameverse Tech Treasure Hunt backend TODO

The Next.js frontend lives at `/`. It has the token prompt, campus animations for Rounds 1–3, and the five-minute Monkeytyping sprint. It does not ship a verification API, team database, official score storage, progression transport, or playable finale. The sprint and its retry flow were checked in Chrome against simulated responses. Production acceptance requires testing against the live backend.

## 1. Deploy and connect the frontend

- [ ] Run `npm ci` and `npm run dev` from the repo root for local development. Use `npm run build` followed by `npm start` for the production build.
- [ ] Serve the frontend over HTTPS. Route `/api/hunt/verify-token` and `/api/scores` to the backend on the same origin. Configure equivalent routing in development so the browser can use these relative URLs.
- [ ] Configure the database, secrets, and migrations outside the repo. Test API routing and cookie behavior against the actual deployment origin.
- [ ] Use the registered team record as the source of team identity. The event announced teams of four. The public registration form is separate from the in-game token prompt.

## 2. Verify the secret token

- [ ] Implement `POST /api/hunt/verify-token`. The browser sends `Content-Type: application/json`, `Accept: application/json`, and `{"token":"<secret token>"}`.
- [ ] Verify that the token maps to an eligible registered team. Establish a server-backed session using a Secure, HttpOnly cookie and return `200 {"verified":true}`. Keep tokens and session secrets out of logs.
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
| Return from the Round 3 screen | `round3jumanji:reverse` |

Valid commands queue while the scene animates. Send the matching reverse command before asking the party to walk to the next landmark. Round 3 opens after the crown capture, or immediately when reduced motion is enabled. The Round 3 **Return to campus** action releases the party visually and does not advance competitive progress. [Command helper](app/hunt-commands.js) · [Scene state and queue](app/adventurer-party.jsx)

## 4. Implement the round services

| Round | Backend and frontend work remaining |
| --- | --- |
| 1 · The Code Gate | Deliver the timed algorithmic challenge, accept and judge submissions, and mark qualifying teams. Agree on the problem set and time limit with organizers. The laptop animation is implemented. |
| 2 · The Campus Trail | Deliver digital clues, record hidden checkpoints and required items, and verify completion before advancing teams. Agree on the checkpoint validation method with organizers. The magnifier animation is implemented. |
| 3 · The Surprise Event | Connect the existing five-minute typing sprint to official attempt tracking and score storage. Keep the challenge details out of player-facing promotional copy. |
| 4 · The Grand Finale | Admit the final five teams to the rapid-fire tech quiz. Agree on question delivery, timers, ranking, and tie-breaks. The map marker and card exist. The quiz, transition, and winner display still need implementation. |

Confirm qualification thresholds, tie-breaks, and retake rules with organizers before publishing official rankings.

## 5. Connect Monkeytyping scoring

On timer expiry, the current frontend sends this JSON to `POST /api/scores`.

```json
{
  "submissionId": "7d674754-09c3-461e-8342-fd08d56f59e7",
  "teamName": "Example Team",
  "correctCharacters": 900,
  "totalCharacters": 1000,
  "elapsedSeconds": 300
}
```

- [ ] Require an authenticated team eligible for Round 3. Use the session's team ID to determine ownership. The current `teamName` is browser-entered display data.
- [ ] Validate the payload shape. The client sends a UUID, a trimmed name of at most 80 characters, nonnegative integer character counts with `correctCharacters <= totalCharacters`, and `elapsedSeconds: 300`.
- [ ] Save the result with an idempotency constraint scoped to the authenticated team and submission ID. A retry sends the same payload and ID and should return the original stored result. Separately enforce the official number of attempts per team.
- [ ] Return 2xx JSON with `score`, `wpm`, and `accuracy`. For the example, return `{"score":36,"wpm":40,"accuracy":90}`. Numeric MySQL decimal strings are accepted. The frontend requires finite, nonnegative metrics and accuracy from 0 to 100.
- [ ] Calculate WPM as total characters ÷ 25, accuracy as correct characters ÷ total characters × 100, and weighted score as WPM × the accuracy fraction. Round the displayed metrics to two decimal places and use zero for all three metrics when the run is empty.
- [ ] For ranked play, coordinate an attempt-start and submission contract with the frontend team. The current client picks the words, tracks time, and reports its own counts. Issue a server-owned attempt with a fixed prompt and deadline, then verify the result against the submitted typing before writing the official score.

The frontend times out score saves after 15 seconds and offers a retry on network errors, non-2xx responses, or unusable JSON. It keeps the pending submission in memory while the sprint stays open. Reload recovery and official server-side attempts still need implementation. [Current sprint client](app/round-three/typing-sprint.jsx)

## 6. Acceptance checks

- [ ] A valid token creates a team session and starts Round 1. Invalid tokens, throttled requests, and unavailable APIs show the expected dialog messages.
- [ ] Requests without a session, from another team, or for an ineligible round are denied.
- [ ] A team can finish each implemented round and receive the next command sequence once. Refresh or reconnect restores their server-confirmed progress once that integration is wired.
- [ ] A real five-minute run submits to the deployed score endpoint, persists one result, and shows the returned score. Verify both a normal run and an empty run.
- [ ] Retrying after a timeout or failed response returns the original result without creating a duplicate. Unusable responses keep the retry option available.
- [ ] Exactly five eligible teams can access the finale. Verify ranking and tie-break behavior once the rules and quiz are implemented.

### Preview the campus flow without backend calls

Open the homepage and paste this into the browser console. These commands animate the map and open the Round 3 screen. Running the sprint through the timer still calls the configured score endpoint.

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

Reload to reset the preview, or dispatch `round3jumanji:reverse` to return from the sprint.
