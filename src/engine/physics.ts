import { LevelData, PlayerState, SkaterProfile, InputState } from '../types';

export const PLAYER_WIDTH = 12;
export const PLAYER_HEIGHT_STAND = 18;
export const PLAYER_HEIGHT_CROUCH = 13;
export const GRAVITY = 0.22;
export const MAX_FALL_SPEED = 4.5;

export function createInitialPlayerState(level: LevelData): PlayerState {
  return {
    x: level.spawn.x,
    y: level.spawn.y,
    vx: 0,
    vy: 0,
    mode: level.spawn.mode,
    facing: 'right',
    isGrounded: false,
    isCrouching: false,
    crouchTimer: 0,
    pushTimer: 0,
    isClimbing: false,
    carriedBoard: level.spawn.mode === 'walk',
    currentLadderId: null,
    cavemanTimer: 0,
    animationFrame: 0,
    animationTimer: 0,
  };
}

export interface InputEvents {
  jumpJustPressed: boolean;
  pushJustPressed: boolean;
  actionJustPressed: boolean;
}

export function updatePhysics(
  prev: PlayerState,
  input: InputState,
  events: InputEvents,
  skater: SkaterProfile,
  level: LevelData
): PlayerState {
  const next: PlayerState = { ...prev };

  // Update timers
  if (next.cavemanTimer > 0) next.cavemanTimer--;
  if (next.pushTimer > 0) next.pushTimer--;

  // Animation cycle timer
  next.animationTimer++;
  if (next.animationTimer >= 8) {
    next.animationTimer = 0;
    next.animationFrame = (next.animationFrame + 1) % 4;
  }

  // -------------------------------------------------------------
  // 1. MODE TRANSITIONS (Mount / Dismount / Caveman / Ladders)
  // -------------------------------------------------------------
  if (events.actionJustPressed) {
    if (next.mode === 'skate') {
      // Dismount board if grounded
      if (next.isGrounded) {
        next.mode = 'walk';
        next.carriedBoard = true;
        next.isCrouching = false;
        next.crouchTimer = 0;
        next.pushTimer = 0;
      }
    } else if (next.mode === 'walk') {
      if (!next.isGrounded) {
        // MID-AIR CAVEMAN! Slam skateboard under feet mid-air
        next.mode = 'skate';
        next.carriedBoard = false;
        next.cavemanTimer = 18;
      } else {
        // Mount board on ground
        next.mode = 'skate';
        next.carriedBoard = false;
        next.pushTimer = 10;
      }
    } else if (next.mode === 'climb') {
      // Drop off ladder into walk mode
      next.mode = 'walk';
      next.isClimbing = false;
      next.currentLadderId = null;
    }
  }

  // -------------------------------------------------------------
  // 2. LADDER DETECTION & CLIMBING
  // -------------------------------------------------------------
  const pHeight = next.isCrouching ? PLAYER_HEIGHT_CROUCH : PLAYER_HEIGHT_STAND;
  const pCenter = next.x + PLAYER_WIDTH / 2;

  // Find overlapping ladder if any
  const overlappingLadder = level.ladders.find((lad) => {
    const xOverlap = pCenter >= lad.x - 4 && pCenter <= lad.x + lad.width + 4;
    const yOverlap = next.y + pHeight >= lad.y && next.y <= lad.y + lad.height;
    return xOverlap && yOverlap;
  });

  if (next.mode === 'climb') {
    if (!overlappingLadder) {
      // Slipped off ladder
      next.mode = 'walk';
      next.isClimbing = false;
      next.currentLadderId = null;
    } else {
      // Vertical ladder movement
      next.vx = 0;
      next.vy = 0;
      next.x = overlappingLadder.x + overlappingLadder.width / 2 - PLAYER_WIDTH / 2;

      if (input.up) {
        next.y -= 1.4;
      } else if (input.down) {
        next.y += 1.4;
      }

      // Jump off ladder
      if (events.jumpJustPressed) {
        next.mode = 'walk';
        next.isClimbing = false;
        next.currentLadderId = null;
        next.vy = -3.2;
        next.vx = next.facing === 'right' ? 1.4 : -1.4;
      }

      // Reached top of ladder -> step onto catwalk
      if (next.y + pHeight <= overlappingLadder.y + 4) {
        next.y = overlappingLadder.y - pHeight;
        next.mode = 'walk';
        next.isClimbing = false;
        next.currentLadderId = null;
        next.isGrounded = true;
      }

      // Reached ground at ladder bottom
      if (next.y + pHeight >= level.groundY) {
        next.y = level.groundY - pHeight;
        next.mode = 'walk';
        next.isClimbing = false;
        next.currentLadderId = null;
        next.isGrounded = true;
      }

      return next;
    }
  } else if (next.mode === 'walk' && overlappingLadder) {
    // Check if player engages ladder
    if (input.up || (input.down && !next.isGrounded)) {
      next.mode = 'climb';
      next.isClimbing = true;
      next.currentLadderId = overlappingLadder.id;
      next.x = overlappingLadder.x + overlappingLadder.width / 2 - PLAYER_WIDTH / 2;
      next.vx = 0;
      next.vy = 0;
      return next;
    }
  }

  // -------------------------------------------------------------
  // 3. MOVEMENT & ACCELERATION BY MODE
  // -------------------------------------------------------------
  if (next.mode === 'walk') {
    // SNAPPY NES WALKING
    const walkSpeed = 1.6;
    if (input.left) {
      next.vx = -walkSpeed;
      next.facing = 'left';
    } else if (input.right) {
      next.vx = walkSpeed;
      next.facing = 'right';
    } else {
      next.vx = 0;
    }

    // Foot jump
    if (next.isGrounded && events.jumpJustPressed) {
      next.vy = -3.8;
      next.isGrounded = false;
    }
  } else if (next.mode === 'skate') {
    // SKATEBOARD PHYSICS
    const statSpeed = skater.stats.speed;
    const statOllie = skater.stats.ollie;
    const maxRollSpeed = 1.8 + (statSpeed / 10) * 1.8; // 2.0 to 3.6 px/f
    const pushAccel = 0.28 + (statSpeed / 10) * 0.16;

    if (next.isGrounded) {
      // Crouch and Ollie charge
      if (input.jump) {
        next.isCrouching = true;
        next.crouchTimer = Math.min(next.crouchTimer + 1, 30);
      } else if (next.isCrouching) {
        // Ollie pop upon releasing jump
        const olliePower = 3.6 + (statOllie / 10) * 1.6;
        const crouchBonus = (next.crouchTimer / 30) * 0.6;
        next.vy = -(olliePower + crouchBonus);
        next.isGrounded = false;
        next.isCrouching = false;
        next.crouchTimer = 0;
      }

      // Tap Ollie if not holding
      if (events.jumpJustPressed && !next.isCrouching) {
        const olliePower = 3.6 + (statOllie / 10) * 1.6;
        next.vy = -olliePower;
        next.isGrounded = false;
      }

      // Steer / Push
      if (input.right) {
        next.facing = 'right';
        if (next.vx < maxRollSpeed) {
          next.vx += pushAccel;
        }
      } else if (input.left) {
        next.facing = 'left';
        if (next.vx > -maxRollSpeed) {
          next.vx -= pushAccel;
        }
      }

      // Manual push burst key (X)
      if (events.pushJustPressed) {
        const dir = next.facing === 'right' ? 1 : -1;
        const pushImpulse = 0.8 + (statSpeed / 10) * 0.4;
        if (Math.sign(next.vx) !== dir && Math.abs(next.vx) > 0.5) {
          // Brake / turn around
          next.vx *= 0.5;
        } else {
          next.vx += dir * pushImpulse;
          // Clamp to burst top speed
          const burstMax = maxRollSpeed * 1.25;
          next.vx = Math.max(-burstMax, Math.min(burstMax, next.vx));
        }
        next.pushTimer = 14;
      }

      // Rolling friction & Braking
      if (!input.left && !input.right) {
        next.vx *= 0.985; // Low rolling friction on urethane wheels
        if (Math.abs(next.vx) < 0.04) next.vx = 0;
      } else if (
        (input.left && next.vx > 0.2) ||
        (input.right && next.vx < -0.2)
      ) {
        // Powerslide brake when holding reverse
        next.vx *= 0.88;
      }
    } else {
      // Airborne in skate mode
      if (input.right) {
        next.vx += 0.06;
      } else if (input.left) {
        next.vx -= 0.06;
      }
      // Air resistance
      next.vx *= 0.992;
    }
  }

  // -------------------------------------------------------------
  // 4. GRAVITY & VERTICAL MOVEMENT
  // -------------------------------------------------------------
  if (!next.isGrounded) {
    next.vy += GRAVITY;
    if (next.vy > MAX_FALL_SPEED) {
      next.vy = MAX_FALL_SPEED;
    }
  }

  // Update position
  const prevY = next.y;
  next.x += next.vx;
  next.y += next.vy;

  // -------------------------------------------------------------
  // 5. COLLISION DETECTION (Ground, Slopes, Platforms)
  // -------------------------------------------------------------
  let currentFootY = next.y + pHeight;
  let groundTargetY = level.groundY;

  // Check Slopes / Ramps
  for (const slope of level.slopes) {
    if (next.x + PLAYER_WIDTH >= slope.x1 && next.x <= slope.x2) {
      const t = (next.x + PLAYER_WIDTH / 2 - slope.x1) / (slope.x2 - slope.x1);
      const clampedT = Math.max(0, Math.min(1, t));
      const rampSurfaceY = slope.y1 + clampedT * (slope.y2 - slope.y1);
      if (rampSurfaceY < groundTargetY) {
        groundTargetY = rampSurfaceY;
      }
    }
  }

  // Check Platforms
  let onPlatform = false;

  for (const plat of level.platforms) {
    const pLeft = plat.x;
    const pRight = plat.x + plat.width;
    const pTop = plat.y;
    const pBottom = plat.y + plat.height;

    const xOverlap = next.x + PLAYER_WIDTH > pLeft && next.x < pRight;

    if (xOverlap) {
      if (plat.type === 'one-way') {
        // Can land on top if falling downwards and was previously at or above top
        const wasAbove = prevY + pHeight <= pTop + 4;
        const isNowAtOrBelow = currentFootY >= pTop;
        if (wasAbove && isNowAtOrBelow && next.vy >= 0) {
          next.y = pTop - pHeight;
          next.vy = 0;
          next.isGrounded = true;
          onPlatform = true;
          break;
        }
      } else {
        // Solid platform
        // Landing on top
        const wasAbove = prevY + pHeight <= pTop + 6;
        if (wasAbove && currentFootY >= pTop && next.vy >= 0) {
          next.y = pTop - pHeight;
          next.vy = 0;
          next.isGrounded = true;
          onPlatform = true;
          break;
        }
        // Lateral collision with solid platform
        if (currentFootY > pTop + 4 && next.y < pBottom) {
          if (next.vx > 0 && next.x + PLAYER_WIDTH >= pLeft && prev.x + PLAYER_WIDTH <= pLeft + 4) {
            next.x = pLeft - PLAYER_WIDTH;
            next.vx = 0;
          } else if (next.vx < 0 && next.x <= pRight && prev.x >= pRight - 4) {
            next.x = pRight;
            next.vx = 0;
          }
        }
      }
    }
  }

  // Ground check if not landed on an elevated platform
  if (!onPlatform) {
    if (next.y + pHeight >= groundTargetY) {
      next.y = groundTargetY - pHeight;
      next.vy = 0;
      next.isGrounded = true;
    } else {
      next.isGrounded = false;
    }
  }

  // Horizontal world boundary clamp
  if (next.x < 0) {
    next.x = 0;
    next.vx = 0;
  } else if (next.x > level.width - PLAYER_WIDTH) {
    next.x = level.width - PLAYER_WIDTH;
    next.vx = 0;
  }

  return next;
}
