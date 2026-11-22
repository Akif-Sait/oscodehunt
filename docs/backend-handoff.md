# Gameverse backend handoff

Serve the frontend over HTTPS and route the two API paths below to the hunt backend on the same origin. The GitHub repository contains the frontend. The deployment needs both APIs for token entry and score persistence.

## 1. Verify tokens and establish the team session

`POST /api/hunt/verify-token` accepts `{"token":"..."}`. On success, establish the team session with a secure, HttpOnly cookie and return `200 {"verified":true}`. Bind the session to the registered team and keep the token out of logs. Return `400`, `401`, `403`, `422`, or `200 {"verified":false}` for rejected tokens and `429` when rate limited.

The frontend closes the prompt and queues `move to round1` and `round1jumanji` on successful verification.

## 2. Send progress to the browser

Persist each team's current round on the server. Once the server confirms a transition, the browser-side API handler or event listener can pass the following commands in order to `dispatchHuntCommand` from [app/hunt-commands.js](../app/hunt-commands.js).

| Transition | Browser commands |
| --- | --- |
| Code Gate → Campus Trail | `round1jumanji:reverse`, `move to round2`, `round2jumanji` |
| Campus Trail → Surprise Event | `round2jumanji:reverse`, `move to round3`, `round3jumanji` |
| Return from the Round 3 screen | `round3jumanji:reverse` |

The browser queues valid commands and opens the Round 3 challenge after the crown animation. The commands drive presentation. Gate all protected APIs and scoring using the server session and server-side progress. The Round 4 landmark and card are on the homepage, and the finale quiz and transition still need implementation. Advance only the final five teams.

## 3. Save the five-minute sprint result

`POST /api/scores` currently receives the Monkeytyping payload below from the browser when the timer expires.

```json
{
  "submissionId": "7d674754-09c3-461e-8342-fd08d56f59e7",
  "teamName": "Example Team",
  "correctCharacters": 900,
  "totalCharacters": 1000,
  "elapsedSeconds": 300
}
```

On save, return a 2xx JSON body such as `{"score":36,"wpm":40,"accuracy":90}`. Numeric MySQL decimal strings are accepted too. WPM is total characters divided by 25 for a five-minute run. Accuracy is correct characters divided by total characters, expressed as a percentage. Score is WPM multiplied by the accuracy fraction. Return zero for an empty run.

Use the authenticated team ID and the submission ID to make retries idempotent. A retry should return the stored result. The existing client sends its own counts and timer values. For ranked play, issue a server-owned attempt with a fixed prompt and deadline, and extend the client/server contract so the server can verify the result against what the team typed before accepting it. The standalone Monkeytyping score endpoint is a reference for the payload and formula.

Before the event, verify valid and rejected tokens, denied requests without a team session, round eligibility, one completed five-minute run, and a repeated score submission returning the same stored result.
