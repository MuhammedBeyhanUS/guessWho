# Guess Who

A browser-based two-player Guess Who game with peer-to-peer voice, chat, and game sync.

## Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), create a game, and join from a second tab or browser using the share link. **No separate signaling server is required** — the app uses the [PeerJS cloud broker](https://peerjs.com/) by default.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_SIGNALING_URL` | *(unset = PeerJS cloud)* | Set to `cloud` for public broker, or `localhost:9000` for self-hosted PeerServer |
| `VITE_TURN_URL` | — | Optional TURN server URL (legacy native transport) |
| `VITE_TURN_USERNAME` | — | TURN username |
| `VITE_TURN_PASSWORD` | — | TURN password |
| `SIGNALING_PORT` | `9000` | Port for optional local PeerServer (`signaling/`) |

### Optional self-hosted signaling

If you prefer a private broker instead of PeerJS cloud:

```bash
npm run signaling   # terminal 1
VITE_SIGNALING_URL=localhost:9000 npm run dev   # terminal 2
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run signaling` | Start optional self-hosted PeerServer |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run lint` | Lint check |
| `npm run format` | Format source files |

## Manual P2P test

1. Run `npm run dev`.
2. Tab A: create a game and copy the room link.
3. Tab B: open the link (guest auto-connects).
4. Confirm both tabs show **Connected** on the play page.

### Manual voice test

1. Follow the P2P steps above and allow microphone access in both tabs when prompted.
2. Confirm each tab shows **Mic on** in the voice controls.
3. Speak in one tab and confirm audio is heard in the other.
4. Click **Mute** in one tab and confirm the opponent no longer hears you; **Unmute** restores audio.
5. Deny microphone in one tab and confirm the permission banner appears while text chat and the game still work.

## Gameplay

After setup (mystery selection, ready, coin flip), players take turns asking yes/no questions or making a guess:

- **Your turn:** type a question and click **Ask**, or click **Guess** to pick a character on your board and confirm.
- **Opponent asked:** answer with **Yes** or **No** (trust-based — any yes/no is accepted).
- **Board:** flip tiles manually to eliminate characters — the app never auto-flips.
- **Win/lose:** correct guess wins; wrong guess ends the game immediately. **Play Again** returns home.

## Issues

| Issue | Status |
|---|---|
| 011 — Turn-based gameplay sync | Done |
