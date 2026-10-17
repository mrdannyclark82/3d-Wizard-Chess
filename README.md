# Wizard Chess 3D — Sanctum Edition

Interactive 3D Gothic Cathedral Wizard Chess with sculpted stone pieces, cinematic melee captures, stone shatter physics, and single-player AI.

A progressive web app (PWA) that installs natively on Android and can be wrapped as a full Android APK.

## Features

- **Gothic Cathedral Sanctum** — Full 3D environment with rose windows, clerestory lighting, and warm cauldron fires
- **Sculpted Stone Pieces** — High-detail GLB models for every piece type
- **Cinematic Melee Captures** — Pieces stalk, duel, and shatter into fragments on capture
- **Stone Shatter Physics** — Debris particles with haptic feedback on Android
- **Single-Player AI** — Play as White or Black against an on-device engine
- **Android-First PWA** — Install to home screen, offline cathedral storage, vibration haptics, immersive fullscreen
- **Camera Controls** — Player, Overhead, Side, and Cathedral wide views (tap to flip orientations)
- **Touch Optimized** — Tap to move, one-finger orbit, two-finger pan, pinch zoom

## Quick Start

```bash
bun install   # or npm install
bun run dev   # or npm run dev
```

Open http://localhost:3000

### Build for production

```bash
bun run build
bun run preview
```

## Android App

This project is already a fully functional PWA. On Android Chrome or Samsung Internet:

1. Open the deployed URL
2. Tap the browser menu (⋮) → **Add to Home screen** or **Install app**
3. It installs as a standalone Android app with icon, splash, and offline support

### Build a native APK (Capacitor)

```bash
# After building the web app
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Wizard Chess" "com.sanctum.wizardchess"
npx cap add android
npx cap sync
npx cap open android
```

Then build and sign the APK/AAB in Android Studio.

### Alternative: Bubblewrap (Trusted Web Activity)

```bash
npx @bubblewrap/cli init --manifest=https://your-deployed-url/manifest.webmanifest
npx @bubblewrap/cli build
```

## Controls

| Input | Action |
|-------|--------|
| Tap piece | Select / Move |
| 1-finger drag | Orbit camera |
| 2-finger drag | Pan |
| Pinch | Zoom |
| `H` | Toggle HUD |
| `F` | Toggle fullscreen |
| `Esc` | Close menus |

## Tech

- React 19 + TypeScript
- Three.js (WebGL renderer, OrbitControls, GLTFLoader)
- Vite + vite-plugin-pwa
- Service Worker offline caching (cathedral + pieces + AI)
- Android vibration API for stone shatter haptics

## Project Structure

```
src/
  App.tsx              # React shell, HUD, Android modal, PWA hooks
  wizardChessEngine.js # Full Three.js scene, board, AI, physics, camera
  usePWAInstall.ts     # Install prompt + fullscreen helpers
  styles.css           # Gothic HUD styling
public/
  assets/glb/          # Base64-encoded compressed GLB models
  pwa-*.png            # App icons
```

## License

MIT
