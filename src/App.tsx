import { useEffect, useRef, useState } from 'react';
import { initWizardChess } from './wizardChessEngine.js';
import { usePWAInstall } from './usePWAInstall';

export default function App() {
  const initializedRef = useRef(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [androidModalOpen, setAndroidModalOpen] = useState(false);
  const { isInstallable, isInstalled, isAndroid, isFullscreen, install, toggleFullscreen } = usePWAInstall();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initWizardChess();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSheetOpen(false);
        setAndroidModalOpen(false);
      }
      if (e.key === 'f' || e.key === 'F') {
        // Toggle fullscreen shortcut
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          toggleFullscreen();
        }
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [toggleFullscreen]);

  const handleRestoreUI = () => {
    const win = window as unknown as { wizardChess?: { toggleUI?: (force?: boolean) => void } };
    if (win.wizardChess?.toggleUI) {
      win.wizardChess.toggleUI(false);
    } else {
      document.body.classList.remove('cinematic-ui-hidden');
      const btnHide = document.getElementById('btn-hide-ui');
      if (btnHide) btnHide.textContent = 'Hide UI [H]';
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setMobileSheetOpen(false);
      }
    } else {
      setAndroidModalOpen(true);
    }
  };

  return (
    <>
      <div id="loading-overlay">
        <div className="loader-title">Wizard Chess</div>
        <div className="loader-bar-wrap">
          <div className="loader-bar" id="loader-bar"></div>
        </div>
        <div id="loader-text">Summoning Sanctum Architecture &amp; Sculpted Pieces...</div>
      </div>

      <div id="canvas-container"></div>

      <button
        type="button"
        className="hud-btn mobile-only-restore-ui"
        id="btn-mobile-show-ui"
        onClick={handleRestoreUI}
        title="Show HUD Controls"
      >
        Show UI
      </button>

      <div id="hud-top">
        <div className="hud-group" id="hud-left">
          <div className="brand-pill">
            <span className="brand-title">Wizard Chess</span>
            <span className="android-edition-badge" title="Android PWA Ready">Android 3D</span>
          </div>
          <div className="status-pill" id="status-pill">
            <span className="turn-dot" id="turn-dot"></span>
            <span id="turn-text">White to Move</span>
            <span className="mode-badge" id="mode-badge">Playing as White</span>
          </div>
        </div>

        <button
          type="button"
          className={`hud-btn mobile-controls-trigger ${mobileSheetOpen ? 'active' : ''}`}
          id="btn-mobile-controls"
          aria-expanded={mobileSheetOpen}
          aria-controls="hud-right"
          onClick={() => setMobileSheetOpen((prev) => !prev)}
        >
          {mobileSheetOpen ? 'Close' : 'Controls'}
        </button>

        <div
          className={`mobile-sheet-backdrop ${mobileSheetOpen ? 'open' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setMobileSheetOpen(false);
          }}
          aria-hidden="true"
        ></div>

        <div
          className={`hud-group ${mobileSheetOpen ? 'mobile-sheet-open' : ''}`}
          id="hud-right"
        >
          <div
            className="mobile-sheet-handle-wrap"
            onClick={(e) => {
              e.stopPropagation();
              setMobileSheetOpen(false);
            }}
            aria-hidden="true"
          >
            <div className="mobile-sheet-handle"></div>
          </div>

          <div className="mobile-sheet-header">
            <span className="mobile-sheet-title">Android Sanctum Controls</span>
            <button
              type="button"
              className="mobile-sheet-close"
              id="btn-mobile-sheet-close"
              onClick={(e) => {
                e.stopPropagation();
                setMobileSheetOpen(false);
              }}
              aria-label="Close Controls"
            >
              Close ✕
            </button>
          </div>

          <div className="mobile-sheet-section-label">Game Actions</div>

          <button
            className="hud-btn"
            id="btn-side-toggle"
            title="Switch between Playing as White and Playing as Black"
            onClick={() => setMobileSheetOpen(false)}
          >
            Play as Black
          </button>
          <button
            className="hud-btn"
            id="btn-ai-move"
            title="Let the AI make the next move immediately"
            onClick={() => setMobileSheetOpen(false)}
          >
            AI Move
          </button>
          <button
            className="hud-btn"
            id="btn-reset"
            title="Start a fresh game on the altar"
            onClick={() => setMobileSheetOpen(false)}
          >
            New Game
          </button>

          <div className="hud-divider" aria-hidden="true"></div>
          <div className="mobile-sheet-section-label">
            <span>Camera Views</span>
            <span className="mobile-sheet-section-sub">Tap active view to flip</span>
          </div>

          <button
            className="hud-btn active"
            id="btn-cam-player"
            title="Player Camera (Click again to flip White / Black view)"
          >
            Player Cam
          </button>
          <button
            className="hud-btn"
            id="btn-cam-top"
            title="Overhead Board View (Click again to flip White / Black orientation)"
          >
            Overhead
          </button>
          <button
            className="hud-btn"
            id="btn-cam-side"
            title="Side Profile View (Click again to switch East / West side)"
          >
            Side
          </button>
          <button
            className="hud-btn"
            id="btn-cam-wide"
            title="Wide Cathedral View (Click again to switch North Rose / South Narthex)"
          >
            Cathedral
          </button>

          <div className="hud-divider" aria-hidden="true"></div>
          <div className="mobile-sheet-section-label">Android &amp; Display</div>

          <button
            className="hud-btn android-action-btn"
            id="btn-android-install-trigger"
            onClick={handleInstallClick}
            title={isInstalled ? 'Installed as App' : 'Install to Android Home Screen'}
          >
            {isInstalled ? '✓ Android App Installed' : isInstallable ? '📥 Install Android App' : '🤖 Android & APK Guide'}
          </button>

          <button
            className="hud-btn"
            id="btn-fullscreen-trigger"
            onClick={toggleFullscreen}
            title="Toggle Android Immersive Fullscreen"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen ⛶'}
          </button>

          <button
            className="hud-btn"
            id="btn-hide-ui"
            title="Toggle HUD visibility (Shortcut: H)"
            onClick={() => setMobileSheetOpen(false)}
          >
            Hide UI [H]
          </button>

          <div className="mobile-sheet-hint">
            <strong>Touch &amp; Haptics:</strong> Tap Piece to Move &nbsp;•&nbsp; 1-Finger: Orbit &nbsp;•&nbsp; 2-Finger: Pan &nbsp;•&nbsp; Pinch: Zoom &nbsp;•&nbsp; Tactile Stone Shatter Vibration
          </div>
        </div>
      </div>

      <div id="hud-bottom">
        <div className="hint-pill" id="controls-hint">
          <strong>Android Touch:</strong> Tap Piece &nbsp;•&nbsp; Drag: Orbit &nbsp;•&nbsp; Pinch: Zoom &nbsp;•&nbsp; Haptic Feedback on Strike &nbsp;|&nbsp; <strong>Desktop:</strong> WASD / Click
        </div>
        <div className="captured-pill" id="captured-tray"></div>
      </div>

      {/* Android & APK Guide Modal */}
      {androidModalOpen && (
        <div
          className="android-modal-backdrop"
          onClick={() => setAndroidModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="android-modal-title"
        >
          <div
            className="android-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="android-modal-header">
              <div className="android-modal-icon">🤖</div>
              <div>
                <h2 className="android-modal-title" id="android-modal-title">Android Wizard Chess</h2>
                <div className="android-modal-subtitle">Native Touch, Offline PWA &amp; APK Distribution</div>
              </div>
              <button
                type="button"
                className="android-modal-close"
                onClick={() => setAndroidModalOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="android-modal-body">
              <div className="android-feature-grid">
                <div className="android-feature-card">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-title">1-Tap Install (WebAPK)</div>
                  <div className="feature-desc">
                    In Chrome or Samsung Internet, tap the browser menu (⋮) and select <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install App&quot;</strong>. It installs as a full standalone Android app with icon and splash screen.
                  </div>
                </div>

                <div className="android-feature-card">
                  <div className="feature-icon">📳</div>
                  <div className="feature-title">Vibration Haptics</div>
                  <div className="feature-desc">
                    Tuned Android haptic pulses trigger when stone pieces stalk, duel, shatter into fragments, and when the defeated King crashes onto the obsidian altar.
                  </div>
                </div>

                <div className="android-feature-card">
                  <div className="feature-icon">💾</div>
                  <div className="feature-title">Offline Cathedral Storage</div>
                  <div className="feature-desc">
                    Precached via Service Worker. The entire Gothic Cathedral, 6 sculpted stone pieces, and single-player AI work offline without network connection.
                  </div>
                </div>

                <div className="android-feature-card">
                  <div className="feature-icon">📦</div>
                  <div className="feature-title">Google Play Store APK</div>
                  <div className="feature-desc">
                    Wrap directly into an Android APK / AAB using standard tools:
                    <pre className="code-snippet">
                      # Using Google Bubblewrap (TWA):{'\n'}
                      npx @bubblewrap/cli init --manifest=https://&lt;your-url&gt;/manifest.webmanifest{'\n'}
                      npx @bubblewrap/cli build{'\n'}{'\n'}
                      # Or with Capacitor:{'\n'}
                      npm i @capacitor/core @capacitor/cli @capacitor/android{'\n'}
                      npx cap init &quot;Wizard Chess&quot; &quot;com.sanctum.wizardchess&quot;{'\n'}
                      npx cap add android &amp;&amp; npx cap open android
                    </pre>
                  </div>
                </div>
              </div>

              {isInstallable && (
                <div className="android-install-cta-wrap">
                  <button
                    type="button"
                    className="android-primary-btn"
                    onClick={async () => {
                      await install();
                      setAndroidModalOpen(false);
                    }}
                  >
                    Install to Android Home Screen Now
                  </button>
                </div>
              )}
            </div>

            <div className="android-modal-footer">
              <button
                type="button"
                className="hud-btn"
                onClick={() => setAndroidModalOpen(false)}
              >
                Return to Game
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="checkmate-overlay" role="status" aria-live="polite">
        <div className="checkmate-banner">
          <div className="checkmate-ornament">✦ &nbsp; Sanctum Judgment &nbsp; ✦</div>
          <div className="checkmate-crown" id="checkmate-crown">♔</div>
          <div className="checkmate-title" id="checkmate-title">Checkmate</div>
          <div className="checkmate-rule"></div>
          <div className="checkmate-subtitle" id="checkmate-subtitle">
            White Triumphs • The Black King Has Fallen
          </div>
          <div className="checkmate-actions">
            <button className="checkmate-btn" id="btn-checkmate-replay">
              Replay King Fall
            </button>
            <button className="checkmate-btn" id="btn-checkmate-newgame">
              New Game
            </button>
            <button className="checkmate-btn secondary" id="btn-checkmate-dismiss">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
