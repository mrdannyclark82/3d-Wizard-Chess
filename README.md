# Wizard Chess 3D — Sanctum Edition

Interactive 3D Gothic Cathedral Wizard Chess with sculpted stone pieces, cinematic melee captures, stone shatter physics, and single-player AI.

Installable Android app via PWA or native Capacitor APK.

## Features

- Gothic Cathedral Sanctum with rose windows, clerestory lighting, and warm cauldron fires
- Sculpted stone piece models (GLB)
- Cinematic melee captures with stone shatter physics and Android haptic feedback
- Single-player AI (play as White or Black)
- Android-first PWA: home-screen install, offline cathedral, vibration, immersive fullscreen
- Camera views: Player, Overhead, Side, Cathedral (tap to flip)
- Touch controls: tap to move, orbit, pan, pinch zoom

## Quick Start

```bash
bun install   # or npm install
bun run dev
```

Open http://localhost:3000

### Production build

```bash
bun run build
bun run preview
```

## Android App

### Option 1 — Install as PWA (fastest)

On Android Chrome or Samsung Internet:

1. Open the deployed site
2. Menu (⋮) → **Add to Home screen** or **Install app**
3. Launches as a standalone app with icon and offline support

### Option 2 — Native APK with Capacitor

```bash
npm install
npm run build
npx cap add android   # first time only
npm run android       # builds web, syncs, opens Android Studio
```

Or just sync without opening:

```bash
npm run android:build
```

Then build and sign the APK/AAB inside Android Studio (`Build → Generate Signed Bundle / APK`).

App ID: `com.sanctum.wizardchess`

### Option 3 — Bubblewrap (Trusted Web Activity)

```bash
npx @bubblewrap/cli init --manifest=https://your-deployed-url/manifest.webmanifest
npx @bubblewrap/cli build
```

## Controls

| Input | Action |
|-------|--------|
| Tap piece | Select / move |
| 1-finger drag | Orbit |
| 2-finger drag | Pan |
| Pinch | Zoom |
| `H` | Toggle HUD |
| `F` | Fullscreen |
| `Esc` | Close menus |

## Tech

- React 19 + TypeScript
- Three.js (WebGL, OrbitControls, GLTFLoader)
- Vite + vite-plugin-pwa
- Capacitor (Android native wrapper)
- Service Worker offline caching
- Android Vibration API for shatter haptics

## Structure

```
src/
  App.tsx                 # HUD, Android modal, PWA hooks
  wizardChessEngine.js    # Three.js scene, board, AI, physics
  usePWAInstall.ts
  styles.css
public/assets/glb/        # Compressed GLB models (base64)
capacitor.config.ts       # Native Android config
```

## License

MIT
