import React, { useState, useCallback, useEffect } from 'react';
import { SKATERS, DEFAULT_SKATER } from './data/skaters';
import { WAREHOUSE_LEVEL } from './data/level';
import { GameCanvas } from './engine/GameCanvas';
import { SkaterProfile, PlayerState, SkaterId, GameMode, InputState } from './types';
import { NES_PALETTE } from './data/palette';
import { audio } from './engine/audio';

export const App: React.FC = () => {
  const [selectedSkaterId, setSelectedSkaterId] = useState<SkaterId>(DEFAULT_SKATER.id);
  const [gameMode, setGameMode] = useState<GameMode>('session');
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(120); // 2:00 minutes
  const [isSessionRunning, setIsSessionRunning] = useState<boolean>(true);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);
  const [externalInputs, setExternalInputs] = useState<Partial<InputState>>({});

  const currentSkater: SkaterProfile =
    SKATERS.find((s) => s.id === selectedSkaterId) || DEFAULT_SKATER;

  // Session timer countdown (2 minutes)
  useEffect(() => {
    if (gameMode !== 'session' || !isSessionRunning || showSummary) return;

    const timer = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSessionRunning(false);
          setShowSummary(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, isSessionRunning, showSummary]);

  // Restart session
  const restartSession = useCallback(() => {
    setSessionTimeLeft(120);
    setIsSessionRunning(true);
    setShowSummary(false);
    // Un-collect level items
    WAREHOUSE_LEVEL.collectibles.forEach((c) => (c.collected = false));
    audio.playLand();
  }, []);

  const handleStateChange = useCallback((state: PlayerState) => {
    setPlayerState(state);
    if (state.totalScore > highScore) {
      setHighScore(state.totalScore);
    }
  }, [highScore]);

  const handleSessionComplete = useCallback((finalState: PlayerState) => {
    setIsSessionRunning(false);
    setShowSummary(true);
    if (finalState.totalScore > highScore) {
      setHighScore(finalState.totalScore);
    }
    audio.playSpecialFanfare();
  }, [highScore]);

  const toggleSound = () => {
    const muted = audio.toggleMute();
    setIsAudioMuted(muted);
  };

  // Keyboard shortcut 'M' for audio mute
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        toggleSound();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Objectives checklist status
  const objectives = [
    {
      label: 'High Score (15,000 pts)',
      done: Boolean(playerState && playerState.totalScore >= 15000),
    },
    {
      label: 'Pro Score (50,000 pts)',
      done: Boolean(playerState && playerState.totalScore >= 50000),
    },
    {
      label: 'Collect S-K-A-T-E (5/5)',
      done: Boolean(playerState && playerState.collectedLetters.length >= 5),
      detail: playerState ? `${playerState.collectedLetters.join(' ')}` : '',
    },
    {
      label: 'Grind Plaza Down Handrail',
      done: Boolean(playerState?.plazaHandrailGrinded),
    },
    {
      label: 'Grab Secret VHS Tape',
      done: Boolean(playerState?.hasSecretTape),
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '960px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        color: NES_PALETTE.hudWhite,
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      {/* Authentic NES Header */}
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0c0c14',
          padding: '8px 14px',
          border: '3px solid #7c7c7c',
          boxShadow: '0 0 0 2px #000000, 0 4px 12px rgba(0,0,0,0.8)',
          borderRadius: '2px',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              backgroundColor: '#e40058',
              color: '#ffffff',
              fontWeight: '900',
              fontSize: '12px',
              padding: '2px 6px',
              letterSpacing: '1px',
              border: '2px solid #000',
            }}
          >
            NES
          </div>
          <div>
            <h1
              style={{
                fontSize: '15px',
                letterSpacing: '1.5px',
                color: NES_PALETTE.hudGold,
                textTransform: 'uppercase',
                margin: 0,
                fontWeight: 'bold',
                textShadow: '2px 2px 0 #000',
              }}
            >
              SKATEGAME: 8-BIT PRO SKATER
            </h1>
            <p style={{ fontSize: '10px', color: NES_PALETTE.concreteLight, margin: '2px 0 0 0' }}>
              FEATURING BART SIMPSON & THPS VERT PHYSICS
            </p>
          </div>
        </div>

        {/* Mode Selector & Audio Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mode Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#000000',
              border: '2px solid #444',
              borderRadius: '2px',
              padding: '2px',
            }}
          >
            <button
              onClick={() => {
                setGameMode('session');
                restartSession();
              }}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
                backgroundColor: gameMode === 'session' ? NES_PALETTE.hudGold : 'transparent',
                color: gameMode === 'session' ? '#000' : '#888',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              2:00 SESSION
            </button>
            <button
              onClick={() => {
                setGameMode('freeskate');
                setShowSummary(false);
              }}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
                backgroundColor: gameMode === 'freeskate' ? NES_PALETTE.hudActive : 'transparent',
                color: gameMode === 'freeskate' ? '#000' : '#888',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              FREE SKATE
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              backgroundColor: isAudioMuted ? '#404040' : '#008800',
              color: '#ffffff',
              border: '2px solid #000',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            title="Press M to mute/unmute audio"
          >
            {isAudioMuted ? '🔇 MUTE' : '🔊 SOUND'}
          </button>
        </div>
      </header>

      {/* Skater Selection Cards (NES Character Select) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '6px',
        }}
      >
        {SKATERS.map((skater) => {
          const isSelected = skater.id === currentSkater.id;
          return (
            <button
              key={skater.id}
              onClick={() => {
                setSelectedSkaterId(skater.id);
                audio.playLand();
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                padding: '6px 8px',
                backgroundColor: isSelected ? '#1c1c28' : '#0a0a10',
                border: `2px solid ${isSelected ? NES_PALETTE.hudGold : '#303040'}`,
                boxShadow: isSelected ? '0 0 0 1px #f8b800, inset 0 0 8px rgba(248,184,0,0.2)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: NES_PALETTE.hudWhite,
                fontFamily: 'inherit',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: isSelected ? NES_PALETTE.hudGold : NES_PALETTE.hudWhite,
                  }}
                >
                  {skater.name}
                </span>
                <span style={{ fontSize: '9px', color: NES_PALETTE.hudActive }}>
                  {skater.stats.air}/10 AIR
                </span>
              </div>

              <div style={{ fontSize: '9px', color: NES_PALETTE.concreteLight }}>
                "{skater.nickname}"
              </div>

              <div style={{ fontSize: '8px', color: NES_PALETTE.sparkOrange, marginTop: '1px' }}>
                ★ {skater.specialTrickName}
              </div>

              {/* Stat Ratings */}
              <div style={{ display: 'flex', gap: '6px', fontSize: '8px', color: '#888', marginTop: '2px' }}>
                <span>SPD:{skater.stats.speed}</span>
                <span>OLLIE:{skater.stats.ollie}</span>
                <span>GRIND:{skater.stats.grindBalance}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Game Screen Canvas */}
      <div style={{ position: 'relative' }}>
        <GameCanvas
          skater={currentSkater}
          level={WAREHOUSE_LEVEL}
          sessionTimeLeft={gameMode === 'session' ? sessionTimeLeft : null}
          isSessionMode={gameMode === 'session'}
          onStateChange={handleStateChange}
          onSessionComplete={handleSessionComplete}
          externalInputs={externalInputs}
        />

        {/* Session Complete Modal Screen */}
        {showSummary && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(10, 10, 16, 0.92)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              zIndex: 10,
              border: '4px solid #f8b800',
            }}
          >
            <div
              style={{
                backgroundColor: '#141424',
                border: '3px solid #7c7c7c',
                padding: '16px 24px',
                maxWidth: '460px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  color: NES_PALETTE.hudGold,
                  margin: 0,
                  letterSpacing: '2px',
                }}
              >
                ★ SESSION COMPLETE ★
              </h2>

              <div style={{ fontSize: '13px', color: NES_PALETTE.hudWhite }}>
                FINAL SCORE: <b style={{ color: NES_PALETTE.hudGold }}>{playerState?.totalScore || 0} PTS</b>
              </div>
              <div style={{ fontSize: '10px', color: NES_PALETTE.concreteLight }}>
                RECORD HIGH SCORE: {highScore} PTS
              </div>

              {/* Goals Summary */}
              <div
                style={{
                  textAlign: 'left',
                  backgroundColor: '#0c0c14',
                  padding: '10px',
                  border: '1px solid #333',
                  fontSize: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                <div style={{ color: NES_PALETTE.hudActive, fontWeight: 'bold' }}>THPS OBJECTIVES:</div>
                {objectives.map((obj, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: obj.done ? NES_PALETTE.badgeGreen : NES_PALETTE.concreteLight,
                    }}
                  >
                    <span>{obj.label}</span>
                    <span>{obj.done ? '✓ COMPLETED' : '—'}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={restartSession}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: NES_PALETTE.hudGold,
                  color: '#000000',
                  border: '2px solid #000',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '1px',
                }}
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-Screen Touch / Mouse Controller (NES D-Pad & Action Buttons) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0a0a14',
          border: '2px solid #383838',
          padding: '8px 12px',
          gap: '10px',
        }}
      >
        {/* Virtual D-Pad */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <button
            onMouseDown={() => setExternalInputs((p) => ({ ...p, up: true }))}
            onMouseUp={() => setExternalInputs((p) => ({ ...p, up: false }))}
            onTouchStart={() => setExternalInputs((p) => ({ ...p, up: true }))}
            onTouchEnd={() => setExternalInputs((p) => ({ ...p, up: false }))}
            style={{
              width: '32px',
              height: '24px',
              backgroundColor: '#242436',
              border: '2px solid #444',
              color: '#fff',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            ▲
          </button>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              onMouseDown={() => setExternalInputs((p) => ({ ...p, left: true }))}
              onMouseUp={() => setExternalInputs((p) => ({ ...p, left: false }))}
              onTouchStart={() => setExternalInputs((p) => ({ ...p, left: true }))}
              onTouchEnd={() => setExternalInputs((p) => ({ ...p, left: false }))}
              style={{
                width: '32px',
                height: '24px',
                backgroundColor: '#242436',
                border: '2px solid #444',
                color: '#fff',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              ◀
            </button>
            <button
              onMouseDown={() => setExternalInputs((p) => ({ ...p, down: true }))}
              onMouseUp={() => setExternalInputs((p) => ({ ...p, down: false }))}
              onTouchStart={() => setExternalInputs((p) => ({ ...p, down: true }))}
              onTouchEnd={() => setExternalInputs((p) => ({ ...p, down: false }))}
              style={{
                width: '32px',
                height: '24px',
                backgroundColor: '#242436',
                border: '2px solid #444',
                color: '#fff',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              ▼
            </button>
            <button
              onMouseDown={() => setExternalInputs((p) => ({ ...p, right: true }))}
              onMouseUp={() => setExternalInputs((p) => ({ ...p, right: false }))}
              onTouchStart={() => setExternalInputs((p) => ({ ...p, right: true }))}
              onTouchEnd={() => setExternalInputs((p) => ({ ...p, right: false }))}
              style={{
                width: '32px',
                height: '24px',
                backgroundColor: '#242436',
                border: '2px solid #444',
                color: '#fff',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              ▶
            </button>
          </div>
        </div>

        {/* Virtual Action Buttons (NES Style: A, B, X, Y, SP) */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {/* Button: Ollie / Jump */}
          <button
            onMouseDown={() => setExternalInputs((p) => ({ ...p, jump: true }))}
            onMouseUp={() => setExternalInputs((p) => ({ ...p, jump: false }))}
            onTouchStart={() => setExternalInputs((p) => ({ ...p, jump: true }))}
            onTouchEnd={() => setExternalInputs((p) => ({ ...p, jump: false }))}
            style={{
              padding: '6px 12px',
              backgroundColor: '#e40058',
              color: '#ffffff',
              border: '2px solid #000',
              fontWeight: 'bold',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            [SPACE] OLLIE
          </button>

          {/* Button: Push / Flip */}
          <button
            onMouseDown={() => setExternalInputs((p) => ({ ...p, push: true }))}
            onMouseUp={() => setExternalInputs((p) => ({ ...p, push: false }))}
            onTouchStart={() => setExternalInputs((p) => ({ ...p, push: true }))}
            onTouchEnd={() => setExternalInputs((p) => ({ ...p, push: false }))}
            style={{
              padding: '6px 12px',
              backgroundColor: '#e40058',
              color: '#ffffff',
              border: '2px solid #000',
              fontWeight: 'bold',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            [J / Z] PUSH / FLIP
          </button>

          {/* Button: Grind / Grab */}
          <button
            onMouseDown={() => setExternalInputs((p) => ({ ...p, grab: true }))}
            onMouseUp={() => setExternalInputs((p) => ({ ...p, grab: false }))}
            onTouchStart={() => setExternalInputs((p) => ({ ...p, grab: true }))}
            onTouchEnd={() => setExternalInputs((p) => ({ ...p, grab: false }))}
            style={{
              padding: '6px 12px',
              backgroundColor: '#0058f8',
              color: '#ffffff',
              border: '2px solid #000',
              fontWeight: 'bold',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            [K / X] GRIND / GRAB
          </button>

          {/* Button: Mount / Dismount / Caveman */}
          <button
            onMouseDown={() => setExternalInputs((p) => ({ ...p, action: true }))}
            onMouseUp={() => setExternalInputs((p) => ({ ...p, action: false }))}
            onTouchStart={() => setExternalInputs((p) => ({ ...p, action: true }))}
            onTouchEnd={() => setExternalInputs((p) => ({ ...p, action: false }))}
            style={{
              padding: '6px 10px',
              backgroundColor: '#d8b800',
              color: '#000000',
              border: '2px solid #000',
              fontWeight: 'bold',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            [E / SHIFT] CAVEMAN
          </button>

          {/* Button: Special Modifier */}
          <button
            onMouseDown={() => setExternalInputs((p) => ({ ...p, special: true }))}
            onMouseUp={() => setExternalInputs((p) => ({ ...p, special: false }))}
            onTouchStart={() => setExternalInputs((p) => ({ ...p, special: true }))}
            onTouchEnd={() => setExternalInputs((p) => ({ ...p, special: false }))}
            style={{
              padding: '6px 10px',
              backgroundColor: '#f8b800',
              color: '#000000',
              border: '2px solid #000',
              fontWeight: 'bold',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            [L / C] SPECIAL
          </button>
        </div>
      </div>

      {/* Retro NES Controls Guide & Trick Book */}
      <footer
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          backgroundColor: '#0c0c14',
          padding: '10px 14px',
          border: '2px solid #383838',
          fontSize: '10px',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ color: NES_PALETTE.hudGold, fontWeight: 'bold', marginBottom: '4px' }}>
            NES GAMEPAD CONTROLS:
          </div>
          <div><b>A / D or ◀ / ▶:</b> Steer board / Walk / Grind Balance</div>
          <div><b>W / S or ▲ / ▼:</b> Climb Ladders (Catwalk access)</div>
          <div><b>SPACE:</b> Ollie pop off ground, ramps & out of grinds</div>
          <div><b>E / SHIFT:</b> Dismount / Mount / <b>Mid-Air Caveman (2.5s bridge)</b></div>
        </div>

        <div>
          <div style={{ color: NES_PALETTE.hudActive, fontWeight: 'bold', marginBottom: '4px' }}>
            AIR TRICKS & GRINDS:
          </div>
          <div><b>J / Z in air:</b> Kickflip (Neutral), Heelflip (▲), Pop Shove-it (▼)</div>
          <div><b>K / X in air:</b> Indy (▶), Melon (◀), Nosegrab (▲), Tailgrab (▼)</div>
          <div><b>K / X near rail:</b> 50-50 & Boardslide (Use ◀/▶ to balance!)</div>
          <div><b>L / C with 100 SP:</b> Signature Special ({currentSkater.specialTrickName})</div>
        </div>

        <div>
          <div style={{ color: NES_PALETTE.badgeGreen, fontWeight: 'bold', marginBottom: '4px' }}>
            SESSION OBJECTIVES (2:00):
          </div>
          <div>• High Score (15K) & Pro Score (50K)</div>
          <div>• Collect golden <b>S - K - A - T - E</b> letters across the park</div>
          <div>• Grind down the entire Plaza Down Handrail</div>
          <div>• Snag the <b>Secret VHS Tape</b> atop the High Catwalk!</div>
        </div>
      </footer>
    </div>
  );
};
