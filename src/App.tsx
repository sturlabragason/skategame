import React, { useState, useCallback } from 'react';
import { SKATERS, DEFAULT_SKATER } from './data/skaters';
import { WAREHOUSE_LEVEL } from './data/level';
import { GameCanvas } from './engine/GameCanvas';
import { SkaterProfile, PlayerState, SkaterId } from './types';
import { NES_PALETTE } from './data/palette';

export const App: React.FC = () => {
  const [selectedSkaterId, setSelectedSkaterId] = useState<SkaterId>(DEFAULT_SKATER.id);
  const [playerMode, setPlayerMode] = useState<PlayerState['mode']>('skate');
  const [isAirborne, setIsAirborne] = useState<boolean>(false);

  const currentSkater: SkaterProfile =
    SKATERS.find((s) => s.id === selectedSkaterId) || DEFAULT_SKATER;

  const handleStateChange = useCallback((state: PlayerState) => {
    setPlayerMode(state.mode);
    setIsAirborne(!state.isGrounded);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '960px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        color: NES_PALETTE.hudWhite,
      }}
    >
      {/* Header & Title */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#141420',
          padding: '10px 16px',
          border: `2px solid ${NES_PALETTE.concreteDark}`,
          borderLeft: `6px solid ${NES_PALETTE.hudGold}`,
          borderRadius: '4px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '18px',
              letterSpacing: '2px',
              color: NES_PALETTE.hudGold,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🛹</span> SKATEGAME // 8-BIT PRO SKATER
          </h1>
          <p style={{ fontSize: '11px', color: NES_PALETTE.concreteLight, marginTop: '2px' }}>
            NES Physics • Bart-Style Dismount • High Catwalk • Mid-Air Caveman
          </p>
        </div>

        {/* Live Mode Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: NES_PALETTE.concreteLight }}>STATE:</span>
          <div
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              borderRadius: '2px',
              backgroundColor:
                playerMode === 'skate'
                  ? NES_PALETTE.badgeGreen
                  : playerMode === 'walk'
                  ? NES_PALETTE.badgeCyan
                  : NES_PALETTE.badgeOrange,
              color: NES_PALETTE.black,
              textTransform: 'uppercase',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            {playerMode === 'skate'
              ? isAirborne
                ? '🛹 AIRBORNE'
                : '🛹 ON BOARD'
              : playerMode === 'walk'
              ? isAirborne
                ? '👟 AIR HOP'
                : '👟 ON FOOT'
              : '🧗 CLIMBING'}
          </div>
        </div>
      </header>

      {/* Skater Selection Pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '8px',
        }}
      >
        {SKATERS.map((skater) => {
          const isSelected = skater.id === currentSkater.id;
          return (
            <button
              key={skater.id}
              onClick={() => setSelectedSkaterId(skater.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 10px',
                backgroundColor: isSelected ? '#24243a' : '#141420',
                border: `2px solid ${isSelected ? NES_PALETTE.hudGold : '#28283c'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                color: NES_PALETTE.hudWhite,
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
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

              <div style={{ fontSize: '10px', color: NES_PALETTE.concreteLight }}>
                "{skater.nickname}" • {skater.hometown}
              </div>

              <div
                style={{
                  fontSize: '9px',
                  color: NES_PALETTE.hudGold,
                  marginTop: '2px',
                }}
              >
                Special: ★ {skater.specialTrickName}
              </div>

              {/* Stat bars */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginTop: '4px',
                  fontSize: '8px',
                  color: NES_PALETTE.concreteLight,
                }}
              >
                <span>SPD:{skater.stats.speed}</span>
                <span>OLLIE:{skater.stats.ollie}</span>
                <span>FLIP:{skater.stats.flipSpeed}</span>
                <span>GRIND:{skater.stats.grindBalance}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Game Screen */}
      <GameCanvas
        skater={currentSkater}
        level={WAREHOUSE_LEVEL}
        onStateChange={handleStateChange}
      />

      {/* Controls Legend & Mechanics Bar */}
      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#141420',
          padding: '10px 14px',
          border: `2px solid ${NES_PALETTE.concreteDark}`,
          borderRadius: '4px',
          fontSize: '11px',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <span style={{ color: NES_PALETTE.hudGold, fontWeight: 'bold' }}>
              ← / → or A / D:
            </span>{' '}
            <span style={{ color: NES_PALETTE.concreteLight }}>Steer / Walk</span>
          </div>
          <div>
            <span style={{ color: NES_PALETTE.hudGold, fontWeight: 'bold' }}>
              SPACE / Z:
            </span>{' '}
            <span style={{ color: NES_PALETTE.concreteLight }}>
              {playerMode === 'skate' ? 'Ollie Pop' : 'Platform Jump'}
            </span>
          </div>
          <div>
            <span style={{ color: NES_PALETTE.hudGold, fontWeight: 'bold' }}>X:</span>{' '}
            <span style={{ color: NES_PALETTE.concreteLight }}>Push Kick</span>
          </div>
          <div>
            <span style={{ color: NES_PALETTE.hudGold, fontWeight: 'bold' }}>
              ↑ / ↓ or W / S:
            </span>{' '}
            <span style={{ color: NES_PALETTE.concreteLight }}>Climb Ladder</span>
          </div>
          <div>
            <span style={{ color: NES_PALETTE.hudActive, fontWeight: 'bold' }}>
              E or SHIFT:
            </span>{' '}
            <span style={{ color: NES_PALETTE.hudWhite }}>
              Dismount / Mount / <b>Mid-Air Caveman</b>
            </span>
          </div>
        </div>

        <div style={{ fontSize: '10px', color: NES_PALETTE.concreteLight }}>
          [Warehouse 1200px • Catwalk @ Y:68]
        </div>
      </footer>
    </div>
  );
};
