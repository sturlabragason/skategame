import React, { useEffect, useRef } from 'react';
import { SkaterProfile, PlayerState, LevelData, InputState } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, createRenderContext, renderGame, RenderContext } from './renderer';
import { createInitialPlayerState, updatePhysics, InputEvents } from './physics';

interface GameCanvasProps {
  skater: SkaterProfile;
  level: LevelData;
  sessionTimeLeft: number | null;
  isSessionMode: boolean;
  onStateChange?: (state: PlayerState) => void;
  onSessionComplete?: (finalState: PlayerState) => void;
  externalInputs?: Partial<InputState>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  skater,
  level,
  sessionTimeLeft,
  isSessionMode,
  onStateChange,
  onSessionComplete,
  externalInputs,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerStateRef = useRef<PlayerState>(createInitialPlayerState(level));
  const renderCtxRef = useRef<RenderContext | null>(null);
  const skaterRef = useRef<SkaterProfile>(skater);
  const levelRef = useRef<LevelData>(level);
  const sessionCompletedRef = useRef<boolean>(false);

  useEffect(() => {
    skaterRef.current = skater;
  }, [skater]);

  useEffect(() => {
    levelRef.current = level;
    // Reset player position when level or skater changes
    playerStateRef.current = createInitialPlayerState(level);
    sessionCompletedRef.current = false;
  }, [level, skater.id]);

  // Session time expiration check
  useEffect(() => {
    if (isSessionMode && sessionTimeLeft !== null && sessionTimeLeft <= 0 && !sessionCompletedRef.current) {
      sessionCompletedRef.current = true;
      if (onSessionComplete) {
        onSessionComplete(playerStateRef.current);
      }
    }
  }, [sessionTimeLeft, isSessionMode, onSessionComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderCtxRef.current = createRenderContext(canvas);

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
        code === 'KeyK' ||
        code === 'KeyL' ||
        code === 'KeyZ' ||
        code === 'KeyX' ||
        code === 'KeyC' ||
        code === 'KeyE' ||
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
    const FIXED_STEP = 1000 / 60; // 60 FPS fixed simulation

    const gameLoop = (now: number) => {
      const delta = Math.min(now - lastTime, 100);
      lastTime = now;
      accumulator += delta;

      const ext = externalInputs || {};

      // Map raw inputs (keyboard + on-screen buttons)
      const input: InputState = {
        left: Boolean(activeKeys.has('ArrowLeft') || activeKeys.has('KeyA') || ext.left),
        right: Boolean(activeKeys.has('ArrowRight') || activeKeys.has('KeyD') || ext.right),
        up: Boolean(activeKeys.has('ArrowUp') || activeKeys.has('KeyW') || ext.up),
        down: Boolean(activeKeys.has('ArrowDown') || activeKeys.has('KeyS') || ext.down),
        jump: Boolean(activeKeys.has('Space') || ext.jump),
        push: Boolean(activeKeys.has('KeyJ') || activeKeys.has('KeyZ') || ext.push),
        grab: Boolean(activeKeys.has('KeyK') || activeKeys.has('KeyX') || ext.grab),
        action: Boolean(
          activeKeys.has('KeyE') ||
          activeKeys.has('ShiftLeft') ||
          activeKeys.has('ShiftRight') ||
          ext.action
        ),
        special: Boolean(activeKeys.has('KeyL') || activeKeys.has('KeyC') || ext.special),
      };

      const events: InputEvents = {
        jumpJustPressed: justPressedKeys.has('Space') || Boolean(ext.jump),
        pushJustPressed: justPressedKeys.has('KeyJ') || justPressedKeys.has('KeyZ') || Boolean(ext.push),
        grabJustPressed: justPressedKeys.has('KeyK') || justPressedKeys.has('KeyX') || Boolean(ext.grab),
        actionJustPressed:
          justPressedKeys.has('KeyE') ||
          justPressedKeys.has('ShiftLeft') ||
          justPressedKeys.has('ShiftRight') ||
          Boolean(ext.action),
        specialJustPressed: justPressedKeys.has('KeyL') || justPressedKeys.has('KeyC') || Boolean(ext.special),
      };

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
          levelRef.current,
          sessionTimeLeft,
          isSessionMode
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
  }, [onStateChange, sessionTimeLeft, isSessionMode, externalInputs]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '960px',
        backgroundColor: '#000000',
        border: '4px solid #383838',
        boxShadow: '0 0 0 2px #000000, 0 0 0 4px #7c7c7c, 0 12px 32px rgba(0,0,0,0.9)',
        borderRadius: '2px',
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
