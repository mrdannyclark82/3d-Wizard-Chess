import { useEffect, useRef, useState } from 'react';
import { initWizardChess } from './wizardChessEngine.js';
import { usePWAInstall } from './usePWAInstall';
import { NativePurchases } from '@capgo/native-purchases';

interface UnlockedItems {
  scenes: string[];
  pieces: string[];
  boards: string[];
  equippedScene: string;
  equippedPiece: string;
  equippedBoard: string;
}

export default function App() {
  const initializedRef = useRef(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [androidModalOpen, setAndroidModalOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [tournamentOpen, setTournamentOpen] = useState(false);
  const [registeredTournament, setRegisteredTournament] = useState(false);
  const [shopTab, setShopTab] = useState<'scenes' | 'pieces' | 'boards'>('scenes');

  const { isInstallable, isInstalled, isFullscreen, install, toggleFullscreen } = usePWAInstall();

  const [unlocked, setUnlocked] = useState<UnlockedItems>(() => {
    try {
      const saved = localStorage.getItem('wizard_chess_unlocked_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      scenes: ['cathedral'],
      pieces: ['classic'],
      boards: ['classic'],
      equippedScene: 'cathedral',
      equippedPiece: 'classic',
      equippedBoard: 'classic'
    };
  });

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initWizardChess();
  }, []);

  useEffect(() => {
    localStorage.setItem('wizard_chess_unlocked_items', JSON.stringify(unlocked));
  }, [unlocked]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSheetOpen(false);
        setAndroidModalOpen(false);
        setShopOpen(false);
        setTournamentOpen(false);
      }
      if (e.key === 'f' || e.key === 'F') {
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

  const equipScene = (key: string) => {
    const win = window as unknown as { wizardChess?: { setCustomSceneTheme?: (k: string) => void } };
    if (win.wizardChess?.setCustomSceneTheme) {
      win.wizardChess.setCustomSceneTheme(key);
    }
    setUnlocked((prev) => ({ ...prev, equippedScene: key }));
  };

  const equipPiece = (key: string) => {
    const win = window as unknown as { wizardChess?: { setPieceMaterialTheme?: (k: string) => void } };
    if (win.wizardChess?.setPieceMaterialTheme) {
      win.wizardChess.setPieceMaterialTheme(key);
    }
    setUnlocked((prev) => ({ ...prev, equippedPiece: key }));
  };

  const equipBoard = (key: string) => {
    const win = window as unknown as { wizardChess?: { setBoardMaterialTheme?: (k: string) => void } };
    if (win.wizardChess?.setBoardMaterialTheme) {
      win.wizardChess.setBoardMaterialTheme(key);
    }
    setUnlocked((prev) => ({ ...prev, equippedBoard: key }));
  };

  const handleBuyOrEquip = async (type: 'scenes' | 'pieces' | 'boards', key: string, productId: string) => {
    const isUnlocked = unlocked[type].includes(key);
    if (isUnlocked) {
      if (type === 'scenes') equipScene(key);
      if (type === 'pieces') equipPiece(key);
      if (type === 'boards') equipBoard(key);
      return;
    }

    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
        await NativePurchases.purchase({ productIdentifier: productId });
      }
    } catch (e) {
      console.warn('Sandbox / Test Purchase mode activated:', e);
    }

    // Unlock item
    setUnlocked((prev) => ({
      ...prev,
      [type]: [...prev[type], key]
    }));

    if (type === 'scenes') equipScene(key);
    if (type === 'pieces') equipPiece(key);
    if (type === 'boards') equipBoard(key);
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
            <span className="android-edition-badge" title="Android 3D Edition">Android 3D</span>
          </div>
          <div className="status-pill" id="status-pill">
            <span className="turn-dot" id="turn-dot"></span>
            <span id="turn-text">White to Move</span>
            <span className="mode-badge" id="mode-badge">Playing as White</span>
          </div>

          <button
            type="button"
            className="hud-btn"
            style={{ border: '1px solid rgba(212,175,55,0.6)', background: 'rgba(212,175,55,0.18)', color: '#ffd700' }}
            onClick={() => setShopOpen(true)}
          >
            🛒 Armory &amp; Shop
          </button>

          <button
            type="button"
            className="hud-btn"
            style={{ border: '1px solid rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.18)', color: '#fca5a5' }}
            onClick={() => setTournamentOpen(true)}
          >
            🏆 Tournaments &amp; Rewards
          </button>
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
      </div>

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

          <div className="mobile-sheet-section-label">Cosmetics &amp; Competitions</div>

          <button
            className="hud-btn"
            style={{ border: '1px solid var(--gold)', background: 'rgba(212,175,55,0.22)' }}
            onClick={() => {
              setMobileSheetOpen(false);
              setShopOpen(true);
            }}
          >
            🛒 Armory / Cosmetics Shop
          </button>

          <button
            className="hud-btn"
            style={{ border: '1px solid #ef4444', background: 'rgba(239,68,68,0.22)' }}
            onClick={() => {
              setMobileSheetOpen(false);
              setTournamentOpen(true);
            }}
          >
            🏆 Tournaments &amp; Cosmetic Prizes
          </button>

          <div className="hud-divider" aria-hidden="true"></div>
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

      <div id="hud-bottom">
        <div className="hint-pill" id="controls-hint">
          <strong>Android Touch:</strong> Tap Piece &nbsp;•&nbsp; Drag: Orbit &nbsp;•&nbsp; Pinch: Zoom &nbsp;•&nbsp; Haptic Feedback on Strike &nbsp;|&nbsp; <strong>Desktop:</strong> WASD / Click
        </div>
        <div className="captured-pill" id="captured-tray"></div>
      </div>

      {/* Shop / Armory Modal */}
      {shopOpen && (
        <div className="android-modal-backdrop" onClick={() => setShopOpen(false)}>
          <div className="android-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="android-modal-header">
              <div className="android-modal-icon">🛒</div>
              <div>
                <h2 className="android-modal-title">Sanctum Armory &amp; Cosmetics</h2>
                <div className="android-modal-subtitle">Customize 3D Scenes, Piece Set Materials &amp; Boards</div>
              </div>
              <button type="button" className="android-modal-close" onClick={() => setShopOpen(false)}>✕</button>
            </div>

            <div className="shop-tabs">
              <button
                type="button"
                className={`shop-tab-btn ${shopTab === 'scenes' ? 'active' : ''}`}
                onClick={() => setShopTab('scenes')}
              >
                🏰 3D Scenes
              </button>
              <button
                type="button"
                className={`shop-tab-btn ${shopTab === 'pieces' ? 'active' : ''}`}
                onClick={() => setShopTab('pieces')}
              >
                ♟️ Piece Sets
              </button>
              <button
                type="button"
                className={`shop-tab-btn ${shopTab === 'boards' ? 'active' : ''}`}
                onClick={() => setShopTab('boards')}
              >
                🏁 Boards
              </button>
            </div>

            <div className="android-modal-body">
              {shopTab === 'scenes' && (
                <div className="shop-grid">
                  <div className={`shop-card ${unlocked.equippedScene === 'cathedral' ? 'equipped' : ''}`}>
                    <div className="shop-card-icon">🏛️</div>
                    <div className="shop-card-title">Gothic Cathedral</div>
                    <div className="shop-card-desc">Gothic arches, warm clerestory sunlight, and stone pillars</div>
                    <span className="shop-card-badge free">FREE</span>
                    <button
                      type="button"
                      className="shop-action-btn"
                      onClick={() => equipScene('cathedral')}
                    >
                      {unlocked.equippedScene === 'cathedral' ? 'Equipped ✓' : 'Equip'}
                    </button>
                  </div>

                  <div className={`shop-card ${unlocked.equippedScene === 'volcanic' ? 'equipped' : ''}`}>
                    <div className="shop-card-icon">🌋</div>
                    <div className="shop-card-title">Volcanic Forge</div>
                    <div className="shop-card-desc">Deep crimson lava light, embers, and dark obsidian forge</div>
                    {unlocked.scenes.includes('volcanic') ? (
                      <span className="shop-card-badge free">UNLOCKED</span>
                    ) : (
                      <span className="shop-card-badge free" style={{ background: 'rgba(234,179,8,0.2)', color: '#facc15' }}>$1.99</span>
                    )}
                    <button
                      type="button"
                      className={`shop-action-btn ${!unlocked.scenes.includes('volcanic') ? 'buy' : ''}`}
                      onClick={() => handleBuyOrEquip('scenes', 'volcanic', 'scene_volcanic_forge')}
                    >
                      {unlocked.equippedScene === 'volcanic' ? 'Equipped ✓' : unlocked.scenes.includes('volcanic') ? 'Equip' : 'Buy $1.99'}
                    </button>
                  </div>

                  <div className={`shop-card ${unlocked.equippedScene === 'celestial' ? 'equipped' : ''}`}>
                    <div className="shop-card-icon">🌌</div>
                    <div className="shop-card-title">Celestial Void</div>
                    <div className="shop-card-desc">Ethereal cosmic starlight, indigo fog, and cyan ambient glows</div>
                    {unlocked.scenes.includes('celestial') ? (
                      <span className="shop-card-badge free">UNLOCKED</span>
                    ) : (
                      <span className="shop-card-badge free" style={{ background: 'rgba(234,179,8,0.2)', color: '#facc15' }}>$1.99</span>
                    )}
                    <button
                      type="button"
                      className={`shop-action-btn ${!unlocked.scenes.includes('celestial') ? 'buy' : ''}`}
                      onClick={() => handleBuyOrEquip('scenes', 'celestial', 'scene_celestial_void')}
                    >
                      {unlocked.equippedScene === 'celestial' ? 'Equipped ✓' : unlocked.scenes.includes('celestial') ? 'Equip' : 'Buy $1.99'}
                    </button>
                  </div>
                </div>
              )}

              {shopTab === 'pieces' && (
                <div className="shop-grid">
                  <div className={`shop-card ${unlocked.equippedPiece === 'classic' ? 'equipped' : ''}`}>
                    <div className="shop-card-icon">🪨</div>
                    <div className="shop-card-title">Sculpted Stone</div>
                    <div className="shop-card-desc">Classic Ivory &amp; Dark Ash carved stone pieces</div>
                    <span className="shop-card-badge free">FREE</span>
                    <button
                      type="button"
                      className="shop-action-btn"
                      onClick={() => equipPiece('classic')}
                    >
                      {unlocked.equippedPiece === 'classic' ? 'Equipped ✓' : 'Equip'}
                    </button>
                  </div>

                  <div className={`shop-card ${unlocked.equippedPiece === 'gold_obsidian' ? 'equipped' : ''}`}>
                    <div className="shop-card-icon">👑</div>
                    <div className="shop-card-title">Gold &amp; Obsidian</div>
                    <div className="shop-card-desc">High-sheen 24K Gold White &amp; Glossy Obsidian Black</div>
                    {unlocked.pieces.includes('gold_obsidian') ? (
                      <span className="shop-card-badge free">UNLOCKED</span>
                    ) : (
                      <span className="shop-card-badge free" style={{ background: 'rgba(234,179,8,0.2)', color: '#facc15' }}>$2.99</span>
                    )}
                    <button
                      type="button"
                      className={`shop-action-btn ${!unlocked.pieces.includes('gold_obsidian') ? 'buy' : ''}`}
                      onClick={() => handleBuyOrEquip('pieces', 'gold_obsidian', 'pieces_gold_obsidian')}
                    >
                      {unlocked.equippedPiece === 'gold_obsidian' ? 'Equipped ✓' : unlocked.pieces.includes('gold_obsidian') ? 'Equip' : 'Buy $2.99'}
                    </button>
                  </div>

                  <div className={`shop-card ${unlocked.equippedPiece === 'stained_glass' ? 'equipped' : ''}`}>
                    <div className="shop-card-icon">🔮</div>
                    <div className="shop-card-title">Stained Glass</div>
                    <div className="shop-card-desc">Translucent glowing Stained Glass in Cyan &amp; Crimson</div>
                    {unlocked.pieces.includes('stained_glass') ? (
                      <span className="shop-card-badge free">UNLOCKED</span>
                    ) : (
                      <span className="shop-card-badge free" style={{ background: 'rgba(234,179,8,0.2)', color: '#facc15' }}>$2.99</span>
                    )}
                    <button
                      type="button"
                      className={`shop-action-btn ${!unlocked.pieces.includes('stained_glass') ? 'buy' : ''}`}
                      onClick={() => handleBuyOrEquip('pieces', 'stained_glass', 'pieces_stained_glass')}
                    >
                      {unlocked.equippedPiece === 'stained_glass' ? 'Equipped ✓' : unlocked.pieces.includes('stained_glass') ? 'Equip' : 'Buy $2.99'}
                    </button>
                  </div>
                </div>
              )}

              {shopTab === 'boards' && (
                <div className="shop-grid">
                  <div className={`shop-card ${unlocked.equippedBoard === 'classic' ? 'equipped' : ''}`}>
                    <div className="shop-card-icon">🪵</div>
                    <div className="shop-card-title">Classic Ashlar</div>
                    <div className="shop-card-desc">Traditional carved stone &amp; ashlar grid board</div>
                    <span className="shop-card-badge free">FREE</span>
                    <button
                      type="button"
                      className="shop-action-btn"
                      onClick={() => equipBoard('classic')}
                    >
                      {unlocked.equippedBoard === 'classic' ? 'Equipped ✓' : 'Equip'}
                    </button>
                  </div>

                  <div className={`shop-card ${unlocked.equippedBoard === 'marble' ? 'equipped' : ''}`}>
                    <div className="shop-card-icon">🏛️</div>
                    <div className="shop-card-title">Carrara Marble</div>
                    <div className="shop-card-desc">Polished White Carrara Marble &amp; Dark Onyx tiles</div>
                    {unlocked.boards.includes('marble') ? (
                      <span className="shop-card-badge free">UNLOCKED</span>
                    ) : (
                      <span className="shop-card-badge free" style={{ background: 'rgba(234,179,8,0.2)', color: '#facc15' }}>$1.99</span>
                    )}
                    <button
                      type="button"
                      className={`shop-action-btn ${!unlocked.boards.includes('marble') ? 'buy' : ''}`}
                      onClick={() => handleBuyOrEquip('boards', 'marble', 'board_carrara_marble')}
                    >
                      {unlocked.equippedBoard === 'marble' ? 'Equipped ✓' : unlocked.boards.includes('marble') ? 'Equip' : 'Buy $1.99'}
                    </button>
                  </div>

                  <div className={`shop-card ${unlocked.equippedBoard === 'lava_stone' ? 'equipped' : ''}`}>
                    <div className="shop-card-icon">🔥</div>
                    <div className="shop-card-title">Lava Rune Stone</div>
                    <div className="shop-card-desc">Magma glowing light squares &amp; obsidian dark tiles</div>
                    {unlocked.boards.includes('lava_stone') ? (
                      <span className="shop-card-badge free">UNLOCKED</span>
                    ) : (
                      <span className="shop-card-badge free" style={{ background: 'rgba(234,179,8,0.2)', color: '#facc15' }}>$1.99</span>
                    )}
                    <button
                      type="button"
                      className={`shop-action-btn ${!unlocked.boards.includes('lava_stone') ? 'buy' : ''}`}
                      onClick={() => handleBuyOrEquip('boards', 'lava_stone', 'board_lava_stone')}
                    >
                      {unlocked.equippedBoard === 'lava_stone' ? 'Equipped ✓' : unlocked.boards.includes('lava_stone') ? 'Equip' : 'Buy $1.99'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="android-modal-footer">
              <button type="button" className="hud-btn" onClick={() => setShopOpen(false)}>
                Done Customizing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tournaments & Rewards Modal */}
      {tournamentOpen && (
        <div className="android-modal-backdrop" onClick={() => setTournamentOpen(false)}>
          <div className="android-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="android-modal-header">
              <div className="android-modal-icon">🏆</div>
              <div>
                <h2 className="android-modal-title">Sanctum Tournaments &amp; Cosmetic Rewards</h2>
                <div className="android-modal-subtitle">Compete Live to Unlock Exclusive 3D Piece Sets, Boards &amp; Master Titles</div>
              </div>
              <button type="button" className="android-modal-close" onClick={() => setTournamentOpen(false)}>✕</button>
            </div>

            <div className="android-modal-body">
              <div className="tournament-hero">
                <div className="tournament-badge-row">
                  <span className="tournament-live-badge">🔴 LIVE ARENA</span>
                  <span className="tournament-prize-tag">👑 EXCLUSIVE COSMETIC PRIZES</span>
                </div>
                <div className="tournament-title">Grandmaster Cathedral Clash</div>
                <div className="tournament-desc">
                  5-Round Arena. 1st Place unlocks the legendary <strong>Gold &amp; Obsidian 24K Piece Set</strong> + <strong>Grandmaster Altar Crown Title</strong>. 2nd Place unlocks <strong>Volcanic Forge Scene</strong>. 3rd Place unlocks <strong>Carrara Marble Board</strong>.
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="android-primary-btn"
                    style={{ flex: 1 }}
                    onClick={() => setRegisteredTournament(true)}
                  >
                    {registeredTournament ? '✓ Registered Entry' : '⚡ Register Tournament Entry (Free)'}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold)' }}>
                  Current Arena Standings &amp; Leaderboard
                </div>
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Rating</th>
                      <th>Points</th>
                      <th>Reward Prize</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="rank-gold">🥇 1st</span></td>
                      <td>Magnus_V</td>
                      <td>2840</td>
                      <td>4.5 / 5</td>
                      <td><strong>Gold &amp; Obsidian Set + GM Crown</strong></td>
                    </tr>
                    <tr>
                      <td><span className="rank-silver">🥈 2nd</span></td>
                      <td>SanctumKnight</td>
                      <td>2710</td>
                      <td>4.0 / 5</td>
                      <td><strong>Volcanic Forge Scene</strong></td>
                    </tr>
                    <tr>
                      <td><span className="rank-bronze">🥉 3rd</span></td>
                      <td>DannyRay_3D</td>
                      <td>2650</td>
                      <td>3.5 / 5</td>
                      <td><strong>Carrara Marble Board</strong></td>
                    </tr>
                    {registeredTournament && (
                      <tr className="user-row">
                        <td>🏅 4th</td>
                        <td>You (Registered Contestant)</td>
                        <td>1500</td>
                        <td>0.0 / 0</td>
                        <td>Arena Qualifier Ticket</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="android-modal-footer">
              <button type="button" className="hud-btn" onClick={() => setTournamentOpen(false)}>
                Return to Game
              </button>
            </div>
          </div>
        </div>
      )}

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
