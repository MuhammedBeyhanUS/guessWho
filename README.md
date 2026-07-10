# Guess Who

A browser-based two-player Guess Who game with peer-to-peer voice, chat, and game sync.

## Development

Run the signaling server and Vite dev server in separate terminals:

```bash
npm run signaling
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), create a game, and join from a second tab or browser using the share link.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_SIGNALING_URL` | `localhost:9000` | PeerServer endpoint for WebRTC signaling |
| `VITE_TURN_URL` | — | Optional TURN server URL for strict NAT |
| `VITE_TURN_USERNAME` | — | TURN username (required with `VITE_TURN_URL`) |
| `VITE_TURN_PASSWORD` | — | TURN password (required with `VITE_TURN_URL`) |
| `SIGNALING_PORT` | `9000` | Port for the local PeerServer process |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run signaling` | Start self-hosted PeerServer |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run lint` | Lint check |
| `npm run format` | Format source files |

## Manual WebRTC test

1. Start `npm run signaling` and `npm run dev`.
2. Tab A: create a game and copy the room link.
3. Tab B: open the link (guest auto-connects).
4. Confirm both tabs show **Connected** on the play page.

### Manual voice test

1. Follow the WebRTC steps above and allow microphone access in both tabs when prompted.
2. Confirm each tab shows **Mic on** and **Voice linked** in the voice control bar.
3. Speak in one tab and confirm audio is heard in the other.
4. Click **Mute** in one tab and confirm the opponent no longer hears you; **Unmute** restores audio.
5. Deny microphone in one tab (or block it in browser settings) and confirm the permission banner appears while text chat and the game still work.

## Gameplay

After setup (mystery selection, ready, coin flip), players take turns asking yes/no questions or making a guess:

- **Your turn:** type a question and click **Ask**, or click **Guess** to pick a character on your board and confirm.
- **Opponent asked:** answer with **Yes** or **No** (validated against your mystery person).
- **Board:** flip tiles manually to eliminate characters — the app never auto-flips.
- **Win/lose:** correct guess wins; wrong guess ends the game immediately. **Play Again** returns home.

## Issues

| Issue | Status |
|---|---|
| 011 — Turn-based gameplay sync | Done |
