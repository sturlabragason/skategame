import React, { useEffect, useRef } from 'react';
import { SkaterProfile, PlayerState, LevelData, InputState } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, createRenderContext, renderGame, RenderContext } from './renderer';
import { createInitialPlayerState, updatePhysics, InputEvents } from './physics';

interface GameCanvasProps {
  skater: SkaterProfile;
  level: LevelData;
  onStateChange?: (state: PlayerState) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ skater, level, onStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerStateRef = useRef<PlayerState>(createInitialPlayerState(level));
  const renderCtxRef = useRef<RenderContext | null>(null);
  const skaterRef = useRef<SkaterProfile>(skater);
  const levelRef = useRef<LevelData>(level);

  // Keep refs updated with current props
  useEffect(() => {
    skaterRef.current = skater;
  }, [skater]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderCtxRef.current = createRenderContext(canvas);

    // Keyboard state management
    const activeKeys = new Set<string>();
    const justPressedKeys = new Set<string>();

    const isGameKey = (code: string) => {
      return (
        code.startsWith('Arrow') ||
        code === 'Space' ||
        code === 'KeyW' ||
        code === 'KeyA' ||
        code === 'KeyS' ||
        code === 'KeyD' ||
        code === 'KeyJ' ||
        code === 'KeyX' ||
        code === 'KeyE' ||
        code === 'KeyZ' ||
        code === 'ShiftLeft' ||
        code === 'ShiftRight'
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameKey(e.code)) {
        e.preventDefault();
      }
      if (!activeKeys.has(e.code)) {
        justPressedKeys.add(e.code);
      }
      activeKeys.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isGameKey(e.code)) {
        e.preventDefault();
      }
      activeKeys.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;
    let lastTime = performance.now();
    let accumulator = 0;
    const FIXED_STEP = 1000 / 60; // 60 FPS fixed physics

    const gameLoop = (now: number) => {
      const delta = Math.min(now - lastTime, 100);
      lastTime = now;
      accumulator += delta;

      // Map raw keys to input state
      const input: InputState = {
        left: activeKeys.has('ArrowLeft') || activeKeys.has('KeyA'),
        right: activeKeys.has('ArrowRight') || activeKeys.has('KeyD'),
        up: activeKeys.has('ArrowUp') || activeKeys.has('KeyW'),
        down: activeKeys.has('ArrowDown') || activeKeys.has('KeyS'),
        jump: activeKeys.has('Space') || activeKeys.has('KeyZ'),
        push: activeKeys.has('KeyX') || activeKeys.has('KeyJ'),
        action:
          activeKeys.has('KeyE') ||
          activeKeys.has('ShiftLeft') ||
          activeKeys.has('ShiftRight'),
      };

      const events: InputEvents = {
        jumpJustPressed: justPressedKeys.has('Space') || justPressedKeys.has('KeyZ'),
        pushJustPressed: justPressedKeys.has('KeyX') || justPressedKeys.has('KeyJ'),
        actionJustPressed:
          justPressedKeys.has('KeyE') ||
          justPressedKeys.has('ShiftLeft') ||
          justPressedKeys.has('ShiftRight'),
      };

      // Clear just pressed events once consumed for this tick
      justPressedKeys.clear();

      while (accumulator >= FIXED_STEP) {
        playerStateRef.current = updatePhysics(
          playerStateRef.current,
          input,
          events,
          skaterRef.current,
          levelRef.current
        );
        accumulator -= FIXED_STEP;
      }

      if (renderCtxRef.current) {
        renderGame(
          renderCtxRef.current,
          playerStateRef.current,
          skaterRef.current,
          levelRef.current
        );
      }

      if (onStateChange) {
        onStateChange(playerStateRef.current);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onStateChange]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '960px',
        backgroundColor: '#000000',
        border: '4px solid #444444',
        boxShadow: '0 8px 24px rgba(0,0,0,0.8), 0 0 0 2px #f8b800',
        borderRadius: '4px',
        overflow: 'hidden',
        lineHeight: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: '16 / 9',
          display: 'block',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};
