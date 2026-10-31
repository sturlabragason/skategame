import { LevelData, PlayerState, SkaterProfile, InputState, ActiveTrick } from '../types';
import { audio } from './audio';

export const PLAYER_WIDTH = 14;
export const PLAYER_HEIGHT_STAND = 22;
export const PLAYER_HEIGHT_CROUCH = 15;
export const GRAVITY = 0.22;
export const MAX_FALL_SPEED = 5.0;

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
    cavemanComboTimer: 0,
    animationFrame: 0,
    animationTimer: 0,

    currentRailId: null,
    grindType: null,
    grindBalance: 0,
    grindDuration: 0,

    currentTrick: null,
    trickTimer: 0,
    airSpinDegrees: 0,
    airRotHoldTimer: 0,
    specialMeter: 0,
    isSpecialActive: false,

    bailTimer: 0,

    currentComboTricks: [],
    comboBaseScore: 0,
    comboMultiplier: 1,
    lastLandedScore: 0,
    totalScore: 0,

    collectedLetters: [],
    hasSecretTape: false,
    plazaHandrailGrinded: false,
    highScoreAchieved: false,
    proScoreAchieved: false,
  };
}

export interface InputEvents {
  jumpJustPressed: boolean;
  pushJustPressed: boolean;
  grabJustPressed: boolean;
  actionJustPressed: boolean;
  specialJustPressed: boolean;
}

export function updatePhysics(
  prev: PlayerState,
  input: InputState,
  events: InputEvents,
  skater: SkaterProfile,
  level: LevelData
): PlayerState {
  const next: PlayerState = { ...prev };

  // -------------------------------------------------------------
  // 0. TIMERS & TICK UPDATES
  // -------------------------------------------------------------
  if (next.cavemanTimer > 0) next.cavemanTimer--;
  if (next.pushTimer > 0) next.pushTimer--;

  // Caveman Combo Bridge countdown on foot
  if (next.mode === 'walk' && next.cavemanComboTimer > 0) {
    next.cavemanComboTimer--;
    if (next.cavemanComboTimer === 0) {
      // Combo expires without remount
      if (next.comboBaseScore > 0) {
        next.totalScore += next.comboBaseScore * next.comboMultiplier;
        next.lastLandedScore = next.comboBaseScore * next.comboMultiplier;
        next.comboBaseScore = 0;
        next.comboMultiplier = 1;
        next.currentComboTricks = [];
      }
    }
  }

  // Animation cycle timer
  next.animationTimer++;
  if (next.animationTimer >= 7) {
    next.animationTimer = 0;
    next.animationFrame = (next.animationFrame + 1) % 4;
  }

  // Trick active animation timer
  if (next.trickTimer > 0) {
    next.trickTimer--;
    if (next.trickTimer === 0) {
      next.currentTrick = null;
    }
  }

  // -------------------------------------------------------------
  // 1. BAILED STATE RECOVERY
  // -------------------------------------------------------------
  if (next.mode === 'bail') {
    next.bailTimer--;
    next.vx *= 0.85;
    if (next.bailTimer <= 0) {
      // Recover to standing on foot
      next.mode = 'walk';
      next.carriedBoard = true;
      next.isGrounded = true;
      next.vx = 0;
      next.vy = 0;
    }
    return next;
  }

  // -------------------------------------------------------------
  // 2. MODE TRANSITIONS (Mount / Dismount / Caveman / Ladders)
  // -------------------------------------------------------------
  if (events.actionJustPressed) {
    if (next.mode === 'skate' || next.mode === 'grind') {
      if (next.isGrounded) {
        // Dismount to walk on foot
        next.mode = 'walk';
        next.carriedBoard = true;
        next.isCrouching = false;
        next.crouchTimer = 0;
        next.pushTimer = 0;
        if (next.comboBaseScore > 0) {
          next.cavemanComboTimer = 150; // 2.5s to bridge combo!
        }
      }
    } else if (next.mode === 'walk') {
      if (!next.isGrounded) {
        // MID-AIR CAVEMAN! Slam board under feet in mid-air
        next.mode = 'skate';
        next.carriedBoard = false;
        next.cavemanTimer = 20;
        audio.playOllie();
      } else {
        // Mount board on ground
        next.mode = 'skate';
        next.carriedBoard = false;
        next.pushTimer = 10;
        audio.playLand();
      }
    } else if (next.mode === 'climb') {
      // Drop off ladder into walk
      next.mode = 'walk';
      next.isClimbing = false;
      next.currentLadderId = null;
    }
  }

  // -------------------------------------------------------------
  // 3. LADDER CLIMBING LOGIC
  // -------------------------------------------------------------
  const pHeight = next.isCrouching ? PLAYER_HEIGHT_CROUCH : PLAYER_HEIGHT_STAND;
  const pCenter = next.x + PLAYER_WIDTH / 2;

  const overlappingLadder = level.ladders.find((lad) => {
    const xOverlap = pCenter >= lad.x - 4 && pCenter <= lad.x + lad.width + 4;
    const yOverlap = next.y + pHeight >= lad.y && next.y <= lad.y + lad.height;
    return xOverlap && yOverlap;
  });

  if (next.mode === 'climb') {
    if (!overlappingLadder) {
      next.mode = 'walk';
      next.isClimbing = false;
      next.currentLadderId = null;
    } else {
      next.vx = 0;
      next.vy = 0;
      next.x = overlappingLadder.x + overlappingLadder.width / 2 - PLAYER_WIDTH / 2;

      if (input.up) {
        next.y -= 1.6;
      } else if (input.down) {
        next.y += 1.6;
      }

      // Jump off ladder
      if (events.jumpJustPressed) {
        next.mode = 'walk';
        next.isClimbing = false;
        next.currentLadderId = null;
        next.vy = -3.4;
        next.vx = next.facing === 'right' ? 1.5 : -1.5;
        audio.playOllie();
      }

      // Reached catwalk top
      if (next.y + pHeight <= overlappingLadder.y + 4) {
        next.y = overlappingLadder.y - pHeight;
        next.mode = 'walk';
        next.isClimbing = false;
        next.currentLadderId = null;
        next.isGrounded = true;
      }

      // Reached bottom
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
  // 4. RAIL GRINDING PHYSICS
  // -------------------------------------------------------------
  if (next.mode === 'grind') {
    const currentRail = level.rails.find((r) => r.id === next.currentRailId);
    if (!currentRail) {
      next.mode = 'skate';
      next.isGrounded = false;
    } else {
      next.grindDuration++;
      // Play grind sound tick
      if (next.grindDuration % 4 === 0) {
        audio.playGrindTick();
      }

      // Track plaza down handrail goal
      if (currentRail.isPlazaRail && next.grindDuration > 40) {
        next.plazaHandrailGrinded = true;
      }

      // Progress along rail
      const railLen = currentRail.x2 - currentRail.x1;
      const t = (next.x - currentRail.x1) / railLen;
      const currentRailY = currentRail.y1 + t * (currentRail.y2 - currentRail.y1);

      // Snap Y to rail top
      next.y = currentRailY - pHeight;
      next.vy = 0;

      // Downhill rail speed boost
      if (currentRail.y2 > currentRail.y1 && next.vx > 0) {
        next.vx += 0.05;
      } else if (currentRail.y1 > currentRail.y2 && next.vx < 0) {
        next.vx -= 0.05;
      }

      // Natural grind friction
      next.vx *= 0.995;

      // Balance drift mechanics
      const statBalance = skater.stats.grindBalance;
      const balanceInstability = (0.016 + next.grindDuration * 0.0003) * (11 - statBalance) / 8;
      next.grindBalance += Math.sin(next.grindDuration * 0.18) * balanceInstability;

      // User steer to counter balance
      if (input.left) {
        next.grindBalance -= 0.038;
      } else if (input.right) {
        next.grindBalance += 0.038;
      }

      // Check Bail
      if (Math.abs(next.grindBalance) >= 1.0) {
        next.mode = 'bail';
        next.bailTimer = 60;
        next.currentComboTricks = [];
        next.comboBaseScore = 0;
        next.comboMultiplier = 1;
        next.specialMeter = 0;
        audio.playBail();
        return next;
      }

      // Add grind points to combo
      if (next.grindDuration % 20 === 0) {
        const grindPts = next.grindType === 'Darkslide' ? 120 : 80;
        next.comboBaseScore += grindPts;
      }

      // Ollie pop out of grind
      if (events.jumpJustPressed) {
        next.mode = 'skate';
        next.currentRailId = null;
        next.grindType = null;
        next.vy = -3.8;
        next.isGrounded = false;
        audio.playOllie();
      }

      // Drop off rail ends
      if (next.x < currentRail.x1 - 4 || next.x > currentRail.x2 + 4) {
        next.mode = 'skate';
        next.currentRailId = null;
        next.grindType = null;
        next.isGrounded = false;
      }

      // Move along rail
      next.x += next.vx;
      return next;
    }
  }

  // -------------------------------------------------------------
  // 5. MOVEMENT: ON FOOT WALKING
  // -------------------------------------------------------------
  if (next.mode === 'walk') {
    const walkSpeed = 1.7;
    if (input.left) {
      next.vx = -walkSpeed;
      next.facing = 'left';
    } else if (input.right) {
      next.vx = walkSpeed;
      next.facing = 'right';
    } else {
      next.vx = 0;
    }

    if (next.isGrounded && events.jumpJustPressed) {
      next.vy = -3.8;
      next.isGrounded = false;
      audio.playOllie();
    }
  }

  // -------------------------------------------------------------
  // 6. MOVEMENT: SKATEBOARDING
  // -------------------------------------------------------------
  else if (next.mode === 'skate') {
    const statSpeed = skater.stats.speed;
    const statOllie = skater.stats.ollie;
    const maxRollSpeed = 2.0 + (statSpeed / 10) * 1.8;
    const pushAccel = 0.32 + (statSpeed / 10) * 0.16;

    if (next.isGrounded) {
      // Crouch and Ollie charge
      if (input.jump) {
        next.isCrouching = true;
        next.crouchTimer = Math.min(next.crouchTimer + 1, 30);
      } else if (next.isCrouching) {
        // Ollie pop upon releasing jump
        const olliePower = 3.8 + (statOllie / 10) * 1.6;
        const crouchBonus = (next.crouchTimer / 30) * 0.8;
        next.vy = -(olliePower + crouchBonus);
        next.isGrounded = false;
        next.isCrouching = false;
        next.crouchTimer = 0;
        audio.playOllie();
      }

      if (events.jumpJustPressed && !next.isCrouching) {
        const olliePower = 3.8 + (statOllie / 10) * 1.6;
        next.vy = -olliePower;
        next.isGrounded = false;
        audio.playOllie();
      }

      // Steering
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

      // Manual push kick (X / J)
      if (events.pushJustPressed) {
        const dir = next.facing === 'right' ? 1 : -1;
        const pushImpulse = 0.9 + (statSpeed / 10) * 0.4;
        if (Math.sign(next.vx) !== dir && Math.abs(next.vx) > 0.5) {
          next.vx *= 0.5;
        } else {
          next.vx += dir * pushImpulse;
          const burstMax = maxRollSpeed * 1.3;
          next.vx = Math.max(-burstMax, Math.min(burstMax, next.vx));
        }
        next.pushTimer = 16;
      }

      // Friction
      if (!input.left && !input.right) {
        next.vx *= 0.988;
        if (Math.abs(next.vx) < 0.04) next.vx = 0;
      } else if (
        (input.left && next.vx > 0.2) ||
        (input.right && next.vx < -0.2)
      ) {
        next.vx *= 0.88;
      }
    } else {
      // ---------------------------------------------------------
      // AIRBORNE SKATE MECHANICS: TRICKS, SPINS & SPECIALS
      // ---------------------------------------------------------
      // Aerial steering
      if (input.right) {
        next.vx += 0.08;
      } else if (input.left) {
        next.vx -= 0.08;
      }
      next.vx *= 0.994;

      // Air Rotations (holding Left or Right)
      if (input.left || input.right) {
        next.airRotHoldTimer++;
        if (next.airRotHoldTimer >= 14) {
          next.airSpinDegrees += 180;
          next.airRotHoldTimer = 0;
          const spinTrick: ActiveTrick = {
            name: `${next.airSpinDegrees}° Spin`,
            points: next.airSpinDegrees * 2,
            category: 'spin',
          };
          next.currentTrick = spinTrick;
          next.trickTimer = 22;
          next.currentComboTricks.push(spinTrick);
          next.comboBaseScore += spinTrick.points;
          next.comboMultiplier += 1;
          audio.playFlip();
        }
      }

      // 1. Signature Specials (Special key L/C + Direction with 100 Special)
      if (input.special && next.specialMeter >= 100 && !next.currentTrick) {
        let specialTrick: ActiveTrick | null = null;
        if (input.right && skater.id === 'rune') {
          specialTrick = { name: '★ Christ Air', points: 2500, category: 'special' };
        } else if (input.left && skater.id === 'tony') {
          specialTrick = { name: '★ The 900', points: 3000, category: 'special' };
        } else if (input.up && skater.id === 'bart') {
          specialTrick = { name: '★ Space Mutant Hop', points: 2500, category: 'special' };
        } else if (input.up && skater.id === 'cab') {
          specialTrick = { name: '★ Caballerial', points: 2200, category: 'special' };
        }

        if (specialTrick) {
          next.currentTrick = specialTrick;
          next.trickTimer = 34;
          next.currentComboTricks.push(specialTrick);
          next.comboBaseScore += specialTrick.points;
          next.comboMultiplier += 2;
          audio.playSpecialFanfare();
        }
      }

      // 2. Flip Tricks (Push/Flip key: J / Z)
      if (events.pushJustPressed && !next.currentTrick) {
        let flipTrick: ActiveTrick;
        if (input.up) {
          flipTrick = { name: 'Heelflip', points: 120, category: 'flip' };
        } else if (input.down) {
          flipTrick = { name: 'Pop Shove-it', points: 150, category: 'flip' };
        } else {
          flipTrick = { name: 'Kickflip', points: 100, category: 'flip' };
        }
        next.currentTrick = flipTrick;
        next.trickTimer = 24;
        next.currentComboTricks.push(flipTrick);
        next.comboBaseScore += flipTrick.points;
        next.comboMultiplier += 1;
        audio.playFlip();
      }

      // 3. Air Grabs (Grab key: K / X)
      if (events.grabJustPressed && !next.currentTrick) {
        let grabTrick: ActiveTrick;
        if (input.right) {
          grabTrick = { name: 'Indy Grab', points: 250, category: 'grab' };
        } else if (input.left) {
          grabTrick = { name: 'Melon Grab', points: 250, category: 'grab' };
        } else if (input.up) {
          grabTrick = { name: 'Nosegrab', points: 200, category: 'grab' };
        } else {
          grabTrick = { name: 'Tailgrab', points: 200, category: 'grab' };
        }
        next.currentTrick = grabTrick;
        next.trickTimer = 26;
        next.currentComboTricks.push(grabTrick);
        next.comboBaseScore += grabTrick.points;
        next.comboMultiplier += 1;
        audio.playGrab();
      }

      // 4. Rail Grind Lock-on Check
      // Check if player is near any rail and presses Grab/Grind (or falls onto it)
      for (const rail of level.rails) {
        const minX = Math.min(rail.x1, rail.x2) - 8;
        const maxX = Math.max(rail.x1, rail.x2) + 8;
        if (next.x + PLAYER_WIDTH >= minX && next.x <= maxX) {
          const t = Math.max(0, Math.min(1, (next.x - rail.x1) / (rail.x2 - rail.x1)));
          const railY = rail.y1 + t * (rail.y2 - rail.y1);
          const footY = next.y + pHeight;

          // Lock on if close to rail vertically and either falling downward or pressing Grab
          if (Math.abs(footY - railY) <= 12 && (next.vy >= 0 || events.grabJustPressed)) {
            next.mode = 'grind';
            next.currentRailId = rail.id;
            next.grindDuration = 0;
            next.grindBalance = 0;
            next.y = railY - pHeight;
            next.vy = 0;

            // Choose grind type
            if (input.special && skater.id === 'rodney' && next.specialMeter >= 100) {
              next.grindType = 'Darkslide';
              const grindTrick: ActiveTrick = { name: '★ Darkslide', points: 2000, category: 'special' };
              next.currentTrick = grindTrick;
              next.currentComboTricks.push(grindTrick);
              next.comboBaseScore += 2000;
              next.comboMultiplier += 2;
              audio.playSpecialFanfare();
            } else if (input.left || input.right) {
              next.grindType = 'Boardslide';
              const grindTrick: ActiveTrick = { name: 'Boardslide', points: 220, category: 'grind' };
              next.currentTrick = grindTrick;
              next.currentComboTricks.push(grindTrick);
              next.comboBaseScore += 220;
              next.comboMultiplier += 1;
              audio.playGrindTick();
            } else {
              next.grindType = '50-50';
              const grindTrick: ActiveTrick = { name: '50-50 Grind', points: 180, category: 'grind' };
              next.currentTrick = grindTrick;
              next.currentComboTricks.push(grindTrick);
              next.comboBaseScore += 180;
              next.comboMultiplier += 1;
              audio.playGrindTick();
            }
            break;
          }
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 7. GRAVITY & QUARTER-PIPE VERT TRANSITIONS
  // -------------------------------------------------------------
  const prevVy = next.vy;

  if (!next.isGrounded) {
    next.vy += GRAVITY;
    if (next.vy > MAX_FALL_SPEED) {
      next.vy = MAX_FALL_SPEED;
    }
  }

  // Revert at Vert Air Apex: If coming out of vert air, at apex flip facing!
  if (!next.isGrounded && prevVy < 0 && next.vy >= 0 && next.y < 95) {
    next.facing = next.facing === 'right' ? 'left' : 'right';
  }

  // Position update
  const prevY = next.y;
  next.x += next.vx;
  next.y += next.vy;

  // -------------------------------------------------------------
  // 8. RAMP & QUARTER-PIPE PHYSICS
  // -------------------------------------------------------------
  let currentFootY = next.y + pHeight;
  let groundTargetY = level.groundY;

  // A. Check Slopes / Launch Kickers
  for (const slope of level.slopes) {
    if (next.x + PLAYER_WIDTH >= slope.x1 && next.x <= slope.x2) {
      const t = (next.x + PLAYER_WIDTH / 2 - slope.x1) / (slope.x2 - slope.x1);
      const clampedT = Math.max(0, Math.min(1, t));
      const slopeY = slope.y1 + clampedT * (slope.y2 - slope.y1);

      if (slopeY < groundTargetY) {
        groundTargetY = slopeY;
      }

      // If skating up the kicker and reaching the lip with speed -> LAUNCH!
      const isUphill = (slope.y1 < slope.y2 && next.vx < -1.0) || (slope.y2 < slope.y1 && next.vx > 1.0);
      if (isUphill && next.isGrounded) {
        // Boost velocity off kicker
        next.vy = -Math.abs(next.vx) * 0.9;
        next.isGrounded = false;
        audio.playOllie();
      }
    }
  }

  // B. Check Quarter-Pipes (Vert Curved Transitions!)
  for (const qp of level.quarterPipes) {
    if (next.x + PLAYER_WIDTH >= qp.x && next.x <= qp.x + qp.width) {
      let u: number; // 0 = at the high lip deck, 1 = at the ground bottom
      if (qp.facing === 'right') {
        // Curves from high deck on left (x = qp.x) down to ground (x = qp.x + qp.width)
        u = (next.x + PLAYER_WIDTH / 2 - qp.x) / qp.width;
      } else {
        // Curves from ground on left down from high deck on right
        u = (qp.x + qp.width - (next.x + PLAYER_WIDTH / 2)) / qp.width;
      }
      u = Math.max(0, Math.min(1, u));

      // Quadratic curve for authentic vert transition
      const qpSurfaceY = qp.y + (u * u) * qp.height;

      if (qpSurfaceY < groundTargetY) {
        groundTargetY = qpSurfaceY;
      }

      // Check if launching up the vert ramp!
      const isRidingUp =
        (qp.facing === 'right' && next.vx < -0.8 && u < 0.25) ||
        (qp.facing === 'left' && next.vx > 0.8 && u < 0.25);

      if (isRidingUp && (next.isGrounded || next.y + pHeight >= qpSurfaceY - 4)) {
        // HUGE VERT AIR LAUNCH!
        const statAir = skater.stats.air;
        const airMultiplier = 1.15 + (statAir / 10) * 0.25;
        next.vy = -Math.abs(next.vx) * airMultiplier;
        next.vx = -next.vx * 0.15; // Slow horizontal drift to keep over bowl
        next.isGrounded = false;
        audio.playOllie();
      }
    }
  }

  // -------------------------------------------------------------
  // 9. PLATFORMS & GROUND COLLISION
  // -------------------------------------------------------------
  let onPlatform = false;

  for (const plat of level.platforms) {
    const pLeft = plat.x;
    const pRight = plat.x + plat.width;
    const pTop = plat.y;
    const pBottom = plat.y + plat.height;

    const xOverlap = next.x + PLAYER_WIDTH > pLeft && next.x < pRight;

    if (xOverlap) {
      if (plat.type === 'one-way') {
        // One-way catwalk: pass through upwards, land on top downwards
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
        const wasAbove = prevY + pHeight <= pTop + 6;
        if (wasAbove && currentFootY >= pTop && next.vy >= 0) {
          next.y = pTop - pHeight;
          next.vy = 0;
          next.isGrounded = true;
          onPlatform = true;
          break;
        }
        // Lateral wall collision with solid platforms
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

  // Ground / Ramp snap
  if (!onPlatform) {
    if (next.y + pHeight >= groundTargetY) {
      next.y = groundTargetY - pHeight;
      next.vy = 0;
      next.isGrounded = true;
    } else {
      next.isGrounded = false;
    }
  }

  // -------------------------------------------------------------
  // 10. CLEAN LANDING OR BAIL CHECK
  // -------------------------------------------------------------
  if (next.isGrounded && !prev.isGrounded) {
    // If landed while trick is still actively rotating -> BAIL!
    if (next.currentTrick && next.trickTimer > 4 && next.currentTrick.category === 'flip') {
      next.mode = 'bail';
      next.bailTimer = 60;
      next.currentComboTricks = [];
      next.comboBaseScore = 0;
      next.comboMultiplier = 1;
      next.specialMeter = 0;
      audio.playBail();
      return next;
    }

    // Clean landing! Bank combo score!
    if (next.comboBaseScore > 0) {
      const landedPoints = next.comboBaseScore * next.comboMultiplier;
      next.totalScore += landedPoints;
      next.lastLandedScore = landedPoints;
      next.specialMeter = Math.min(100, next.specialMeter + 20);
      next.comboBaseScore = 0;
      next.comboMultiplier = 1;
      next.currentComboTricks = [];
      next.airSpinDegrees = 0;
      audio.playLand();
    }
  }

  // -------------------------------------------------------------
  // 11. COLLECTIBLES DETECTION (S-K-A-T-E & Secret Tape)
  // -------------------------------------------------------------
  for (const item of level.collectibles) {
    if (!item.collected) {
      const pRight = next.x + PLAYER_WIDTH;
      const pBottom = next.y + pHeight;
      const itemW = item.type === 'letter' ? 10 : 12;
      const itemH = 10;

      const overlap =
        pRight >= item.x &&
        next.x <= item.x + itemW &&
        pBottom >= item.y &&
        next.y <= item.y + itemH;

      if (overlap) {
        item.collected = true;
        if (item.type === 'letter' && item.letter) {
          if (!next.collectedLetters.includes(item.letter)) {
            next.collectedLetters = [...next.collectedLetters, item.letter];
          }
          next.comboBaseScore += 500;
        } else if (item.type === 'tape') {
          next.hasSecretTape = true;
          next.comboBaseScore += 1000;
        }
        audio.playCollect();
      }
    }
  }

  // High score / Pro score goals
  if (next.totalScore >= 15000) next.highScoreAchieved = true;
  if (next.totalScore >= 50000) next.proScoreAchieved = true;

  // Sound rolling update
  audio.updateRoll(next.isGrounded && next.mode === 'skate', next.vx);

  // Boundary Clamp
  if (next.x < 0) {
    next.x = 0;
    next.vx = 0;
  } else if (next.x > level.width - PLAYER_WIDTH) {
    next.x = level.width - PLAYER_WIDTH;
    next.vx = 0;
  }

  return next;
}
