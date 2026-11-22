# Gameverse · Tech Treasure Hunt

An interactive pixel-art campus map for Gameverse, the gaming week presented by the OSCode REVA University Chapter.

| Event details | |
| --- | --- |
| Date | 25 November |
| Venue | Rangasthala, REVA University, Bengaluru |
| Team size | 4 members |
| Entry fee | ₹59 per person |
| Registration | [Tech Treasure Hunt registration form](https://forms.gle/Wj2UKVH4vcDYMVmHA) |

![Pixel-art REVA campus with a glowing path and portals](docs/screenshots/desktop.webp)

<details>
<summary>Mobile view</summary>

![Mobile homepage with a compact header, campus map, and stacked round cards](docs/screenshots/mobile.webp)

</details>

## Run locally

Requirements are Node.js **20.9 or later** and npm. Use the included lockfile to install dependencies.

```bash
git clone https://github.com/Akif-Sait/oscodehunt.git
cd oscodehunt
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In PowerShell, use `npm.cmd` in place of `npm` if your execution policy blocks the npm script.

To run the production build locally, stop any server using port 3000, then run the following commands.

```bash
npm run build
npm start
```

## Explore the campus

- The map includes the REVA entrance, four round landmarks, waterfalls, and a fountain. The Grand Finale is marked by the portal set into the cliff.
- The scene uses layered pixel art, mist, animated portal lighting, water reflections, birds, and drifting leaves that react to the pointer.
- The desktop composition fits the viewport. Phones get an illustrated, vertically scrolling layout with a compact menu and stacked round cards.
- Motion pauses when the tab is hidden. The page also respects the system’s reduced-motion preference.

| Round | Challenge |
| --- | --- |
| 1 · The Code Gate | Solve an algorithmic coding challenge within the time limit. |
| 2 · The Campus Trail | Follow digital clues, find hidden checkpoints, and collect the required items. |
| 3 · The Surprise Event | Take on a mystery challenge that tests your skills in an unexpected way. |
| 4 · The Grand Finale | The final five teams face a rapid-fire tech quiz to decide the champions. |

### Easter eggs

- **Wandering professor.** Watch the upper path between buildings. Click or tap the professor while he’s visible to change what he says in his speech bubble.
- **Fountain fish.** Watch the central fountain for a jump, or click or tap the basin to make the fish leap.
- **The Round 1 laptop.** The three backpackers wait by the entrance until a page event starts their walk. A second event makes the laptop pull them through cyan pixel rings and off the map.

## Backend team

See the [backend checklist](backend_team_readme_todo.md) for the API contracts, campus commands, and deployment checks.

<details>
<summary>Round 1 laptop effect</summary>

![The adventurers raise their hands as cyan pixel rings spiral around the Round 1 laptop](docs/screenshots/round-one-capture.webp)

</details>

## Project structure

The homepage uses Next.js App Router and React. PixiJS renders the ambient particles, and CSS handles the scene layout, lighting, and sprite sequences.

| Path | What to edit |
| --- | --- |
| [`app/event-config.js`](app/event-config.js) | Event name, date, venue, team size, fee, registration link, and header navigation. |
| [`app/login/`](app/login/) | The token prompt, pixel-art styling, and verification adapter. |
| [`app/pixel-scene.jsx`](app/pixel-scene.jsx) | Campus artwork and the position of each scene layer in the render order. |
| [`app/round-display.jsx`](app/round-display.jsx) | Round names, summaries, and map landmarks. |
| [`app/adventurer-party.jsx`](app/adventurer-party.jsx) | Adventurer routes and the two browser events. |
| [`app/campus-secrets.jsx`](app/campus-secrets.jsx) | The professor’s dialogue and fountain fish. |
| [`app/campus-lighting.css`](app/campus-lighting.css) | Portal glow, reflections, and foliage lighting. |
| [`public/art/`](public/art/) | Campus artwork, logos, title graphics, and sprite sheets. |

The current project implements the landing page at `/`, with the round cards linked from the navigation. The Grand Finale is listed on the map and in the round cards. Its quiz has yet to be implemented.
