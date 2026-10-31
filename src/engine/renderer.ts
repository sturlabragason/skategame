import { LevelData, PlayerState, SkaterProfile } from '../types';
import { NES_PALETTE } from '../data/palette';
import { PLAYER_WIDTH, PLAYER_HEIGHT_STAND, PLAYER_HEIGHT_CROUCH } from './physics';

export const CANVAS_WIDTH = 320;
export const CANVAS_HEIGHT = 180;

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cameraX: number;
  cameraY: number;
}

export function createRenderContext(canvas: HTMLCanvasElement): RenderContext {
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return {
    canvas,
    ctx,
    cameraX: 0,
    cameraY: 0,
  };
}

export function renderGame(
  rc: RenderContext,
  player: PlayerState,
  skater: SkaterProfile,
  level: LevelData
): void {
  const { ctx } = rc;

  // -------------------------------------------------------------
  // Camera update: smooth follow player X, clamp to level
  // -------------------------------------------------------------
  const targetCamX = player.x + PLAYER_WIDTH / 2 - CANVAS_WIDTH / 2;
  rc.cameraX += (targetCamX - rc.cameraX) * 0.12;
  rc.cameraX = Math.max(0, Math.min(level.width - CANVAS_WIDTH, rc.cameraX));

  // Small camera lift when high up on catwalk
  const targetCamY = player.y < 80 ? Math.max(0, player.y - 60) : 0;
  rc.cameraY += (targetCamY - rc.cameraY) * 0.08;
  rc.cameraY = Math.max(0, Math.min(level.height - CANVAS_HEIGHT, rc.cameraY));

  const camX = Math.round(rc.cameraX);
  const camY = Math.round(rc.cameraY);

  ctx.imageSmoothingEnabled = false;

  // -------------------------------------------------------------
  // 1. CLEAR & WAREHOUSE BACKGROUND
  // -------------------------------------------------------------
  ctx.fillStyle = NES_PALETTE.warehouseBg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Distant parallax brick wall & steel structure
  const bgOffset = Math.floor(camX * 0.3);
  ctx.fillStyle = '#222238';

  // Background girders
  for (let x = - (bgOffset % 80); x < CANVAS_WIDTH; x += 80) {
    ctx.fillRect(x, 10, 8, CANVAS_HEIGHT - 34);
    // Cross brace
    ctx.strokeStyle = '#1d1d30';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x + 80, 100);
    ctx.stroke();
  }

  // Background high warehouse windows
  for (let wx = 30 - (bgOffset % 120); wx < CANVAS_WIDTH; wx += 120) {
    ctx.fillStyle = '#101020';
    ctx.fillRect(wx, 24, 36, 40);
    ctx.fillStyle = '#3c5888';
    ctx.fillRect(wx + 2, 26, 15, 17);
    ctx.fillRect(wx + 19, 26, 15, 17);
    ctx.fillRect(wx + 2, 45, 15, 17);
    ctx.fillRect(wx + 19, 45, 15, 17);
  }

  // Overhead warehouse hanging lamps
  for (let lx = 60 - (camX % 140); lx < CANVAS_WIDTH; lx += 140) {
    ctx.fillStyle = '#404040';
    ctx.fillRect(lx, 0, 2, 16);
    ctx.fillStyle = '#f8b800';
    ctx.fillRect(lx - 4, 16, 10, 4);
    // Subtle glow cone
    ctx.fillStyle = 'rgba(248, 184, 0, 0.06)';
    ctx.beginPath();
    ctx.moveTo(lx + 1, 20);
    ctx.lineTo(lx - 25, 156);
    ctx.lineTo(lx + 27, 156);
    ctx.closePath();
    ctx.fill();
  }

  // -------------------------------------------------------------
  // 2. LEVEL PLATFORMS & GEOMETRY
  // -------------------------------------------------------------
  // Slopes / Ramps
  for (const slope of level.slopes) {
    const sx1 = Math.round(slope.x1 - camX);
    const sy1 = Math.round(slope.y1 - camY);
    const sx2 = Math.round(slope.x2 - camX);
    const sy2 = Math.round(slope.y2 - camY);

    if (sx2 >= -20 && sx1 <= CANVAS_WIDTH + 20) {
      ctx.fillStyle = NES_PALETTE.concreteDark;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.lineTo(sx2, level.groundY - camY);
      ctx.lineTo(sx1, level.groundY - camY);
      ctx.closePath();
      ctx.fill();

      // Ramp surface highlight lip
      ctx.strokeStyle = NES_PALETTE.concreteLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();
    }
  }

  // Platforms (Ground, Catwalk, Ledges, Dumpster)
  for (const plat of level.platforms) {
    const px = Math.round(plat.x - camX);
    const py = Math.round(plat.y - camY);

    if (px + plat.width < 0 || px > CANVAS_WIDTH) continue;

    if (plat.id === 'ground_main') {
      // Main concrete floor
      ctx.fillStyle = NES_PALETTE.concreteDark;
      ctx.fillRect(px, py, plat.width, plat.height);
      // Top curb surface
      ctx.fillStyle = NES_PALETTE.concrete;
      ctx.fillRect(px, py, plat.width, 4);
      // Floor grip lines
      ctx.fillStyle = NES_PALETTE.brickDark;
      ctx.fillRect(px, py + 4, plat.width, 1);
    } else if (plat.id === 'upper_catwalk') {
      // Catwalk steel grating
      ctx.fillStyle = NES_PALETTE.concreteDark;
      ctx.fillRect(px, py, plat.width, plat.height);
      // Hazard yellow line on catwalk lip
      ctx.fillStyle = NES_PALETTE.hazardStripe1;
      ctx.fillRect(px, py, plat.width, 2);
      // Catwalk safety railing
      ctx.fillStyle = NES_PALETTE.railSteel;
      ctx.fillRect(px, py - 10, plat.width, 2);
      for (let rx = px + 10; rx < px + plat.width; rx += 25) {
        ctx.fillRect(rx, py - 10, 2, 10);
      }
    } else if (plat.id === 'street_ledge') {
      // Street manual pad / ledge
      ctx.fillStyle = NES_PALETTE.brick;
      ctx.fillRect(px, py, plat.width, plat.height);
      // Concrete top cap
      ctx.fillStyle = NES_PALETTE.concrete;
      ctx.fillRect(px, py, plat.width, 4);
      // Steel angle iron coping on the edge
      ctx.fillStyle = NES_PALETTE.railSteel;
      ctx.fillRect(px, py, plat.width, 2);
    } else if (plat.id === 'yard_dumpster') {
      // Yard dumpster obstacle
      ctx.fillStyle = '#005820'; // Dumpster dark green
      ctx.fillRect(px, py, plat.width, plat.height);
      ctx.fillStyle = '#008800';
      ctx.fillRect(px, py, plat.width, 3);
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(px + 4, py + 6, plat.width - 8, 2);
      ctx.fillRect(px + 4, py + 12, plat.width - 8, 2);
    } else {
      // Quarter-pipe decks / side walls
      ctx.fillStyle = NES_PALETTE.concreteDark;
      ctx.fillRect(px, py, plat.width, plat.height);
      ctx.fillStyle = NES_PALETTE.concrete;
      ctx.fillRect(px, py, plat.width, 4);
      ctx.fillStyle = NES_PALETTE.railSteel;
      ctx.fillRect(px, py, plat.width, 2);
    }
  }

  // Ladders
  for (const lad of level.ladders) {
    const lx = Math.round(lad.x - camX);
    const ly = Math.round(lad.y - camY);

    if (lx + lad.width < 0 || lx > CANVAS_WIDTH) continue;

    // Side stiles
    ctx.fillStyle = NES_PALETTE.ladderRail;
    ctx.fillRect(lx, ly, 2, lad.height);
    ctx.fillRect(lx + lad.width - 2, ly, 2, lad.height);

    // High-vis yellow rungs
    ctx.fillStyle = NES_PALETTE.ladderRung;
    for (let ry = ly + 4; ry < ly + lad.height; ry += 6) {
      ctx.fillRect(lx + 2, ry, lad.width - 4, 2);
    }
  }

  // Rails
  for (const rail of level.rails) {
    const rx1 = Math.round(rail.x1 - camX);
    const ry1 = Math.round(rail.y1 - camY);
    const rx2 = Math.round(rail.x2 - camX);

    if (rx2 < 0 || rx1 > CANVAS_WIDTH) continue;

    // Upright support legs
    ctx.fillStyle = NES_PALETTE.railShadow;
    const postSpacing = 30;
    for (let px = rx1 + 10; px < rx2; px += postSpacing) {
      ctx.fillRect(px - 1, ry1 + 2, 2, 10);
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(px - 3, ry1 + 10, 6, 2);
      ctx.fillStyle = NES_PALETTE.railShadow;
    }

    // Rail pipe
    ctx.fillStyle = NES_PALETTE.railSteel;
    ctx.fillRect(rx1, ry1, rx2 - rx1, 3);
    // Chrome glint highlight
    ctx.fillStyle = NES_PALETTE.railHighlight;
    ctx.fillRect(rx1, ry1, rx2 - rx1, 1);
  }

  // -------------------------------------------------------------
  // 3. SKATER & SKATEBOARD SPRITE RENDERING
  // -------------------------------------------------------------
  renderPlayer(ctx, player, skater, camX, camY);

  // -------------------------------------------------------------
  // 4. RETRO NES HUD OVERLAY
  // -------------------------------------------------------------
  renderHUD(ctx, player, skater);
}

function renderPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  skater: SkaterProfile,
  camX: number,
  camY: number
): void {
  const sx = Math.round(player.x - camX);
  const sy = Math.round(player.y - camY);
  const isFacingRight = player.facing === 'right';
  const pal = skater.palette;

  ctx.save();

  // Caveman mid-air sparkle effect
  if (player.cavemanTimer > 0) {
    const sparkAlpha = (player.cavemanTimer / 18).toFixed(2);
    ctx.fillStyle = `rgba(248, 184, 0, ${sparkAlpha})`;
    ctx.fillRect(sx - 4, sy - 2, PLAYER_WIDTH + 8, 2);
    ctx.fillRect(sx - 2, sy + PLAYER_HEIGHT_STAND, PLAYER_WIDTH + 4, 3);
    ctx.fillStyle = NES_PALETTE.white;
    ctx.fillRect(sx + (player.cavemanTimer % 8), sy + 4, 2, 2);
  }

  if (player.mode === 'climb') {
    // -----------------------------------------------------------
    // CLIMBING POSE (Facing ladder, alternating arms/legs)
    // -----------------------------------------------------------
    const step = Math.floor(player.y / 6) % 2;
    // Head / hair
    ctx.fillStyle = pal.hairSkin;
    ctx.fillRect(sx + 3, sy, 6, 5);
    ctx.fillStyle = NES_PALETTE.hairBrown;
    ctx.fillRect(sx + 3, sy, 6, 2);

    // Torso / Shirt
    ctx.fillStyle = pal.shirt;
    ctx.fillRect(sx + 2, sy + 5, 8, 6);

    // Arms gripping ladder rungs
    ctx.fillStyle = pal.hairSkin;
    if (step === 0) {
      ctx.fillRect(sx, sy + 3, 2, 4); // Left hand up
      ctx.fillRect(sx + 10, sy + 6, 2, 4); // Right hand mid
    } else {
      ctx.fillRect(sx, sy + 6, 2, 4);
      ctx.fillRect(sx + 10, sy + 3, 2, 4);
    }

    // Skateboard strapped onto back
    ctx.fillStyle = pal.deck;
    ctx.fillRect(sx + 4, sy + 4, 4, 10);
    ctx.fillStyle = pal.wheels || NES_PALETTE.white;
    ctx.fillRect(sx + 3, sy + 5, 2, 2);
    ctx.fillRect(sx + 7, sy + 5, 2, 2);
    ctx.fillRect(sx + 3, sy + 11, 2, 2);
    ctx.fillRect(sx + 7, sy + 11, 2, 2);

    // Pants / Legs
    ctx.fillStyle = pal.pants;
    if (step === 0) {
      ctx.fillRect(sx + 2, sy + 11, 3, 5);
      ctx.fillRect(sx + 7, sy + 11, 3, 3);
    } else {
      ctx.fillRect(sx + 2, sy + 11, 3, 3);
      ctx.fillRect(sx + 7, sy + 11, 3, 5);
    }
    // Shoes
    ctx.fillStyle = pal.shoes || NES_PALETTE.black;
    ctx.fillRect(sx + 2, sy + 16, 3, 2);
    ctx.fillRect(sx + 7, sy + 16, 3, 2);
  } else if (player.mode === 'walk') {
    // -----------------------------------------------------------
    // WALKING ON FOOT (Crisp NES walk + board under arm)
    // -----------------------------------------------------------
    const walkFrame = Math.abs(player.vx) > 0.1 ? player.animationFrame : 0;

    // Head & Face
    ctx.fillStyle = pal.hairSkin;
    ctx.fillRect(sx + 3, sy, 6, 5);
    ctx.fillStyle = NES_PALETTE.hairBrown;
    ctx.fillRect(sx + 3, sy, 6, 2);
    // Eye
    ctx.fillStyle = NES_PALETTE.black;
    const eyeX = isFacingRight ? sx + 7 : sx + 3;
    ctx.fillRect(eyeX, sy + 2, 1, 1);

    // Torso / Shirt
    ctx.fillStyle = pal.shirt;
    ctx.fillRect(sx + 3, sy + 5, 6, 6);

    // Skateboard carried under arm!
    if (player.carriedBoard) {
      ctx.fillStyle = pal.deck;
      const boardX = isFacingRight ? sx + 1 : sx + 7;
      ctx.fillRect(boardX, sy + 6, 3, 10);
      ctx.fillStyle = pal.wheels || NES_PALETTE.white;
      ctx.fillRect(boardX - 1, sy + 7, 2, 2);
      ctx.fillRect(boardX - 1, sy + 13, 2, 2);
    }

    // Walking Legs animation
    ctx.fillStyle = pal.pants;
    if (walkFrame === 1) {
      // Step forward
      ctx.fillRect(sx + 2, sy + 11, 3, 5);
      ctx.fillRect(sx + 7, sy + 11, 3, 4);
    } else if (walkFrame === 3) {
      // Step back
      ctx.fillRect(sx + 3, sy + 11, 3, 4);
      ctx.fillRect(sx + 7, sy + 11, 3, 5);
    } else {
      // Standing
      ctx.fillRect(sx + 3, sy + 11, 3, 5);
      ctx.fillRect(sx + 6, sy + 11, 3, 5);
    }

    // Shoes
    ctx.fillStyle = pal.shoes || NES_PALETTE.black;
    ctx.fillRect(sx + 2, sy + 16, 3, 2);
    ctx.fillRect(sx + 6, sy + 16, 3, 2);
  } else {
    // -----------------------------------------------------------
    // SKATEBOARDING (On-Board)
    // -----------------------------------------------------------
    const isCrouch = player.isCrouching;
    const isAir = !player.isGrounded;
    const isPushing = player.pushTimer > 0;

    const bodyY = isCrouch ? sy + 5 : sy;

    // Head & Cap / Hair
    ctx.fillStyle = pal.hairSkin;
    ctx.fillRect(sx + 3, bodyY, 6, 5);
    ctx.fillStyle = NES_PALETTE.hairBrown;
    ctx.fillRect(sx + 3, bodyY, 6, 2);
    // Eye
    ctx.fillStyle = NES_PALETTE.black;
    const eyeX = isFacingRight ? sx + 7 : sx + 3;
    ctx.fillRect(eyeX, bodyY + 2, 1, 1);

    // Torso / Shirt
    ctx.fillStyle = pal.shirt;
    const torsoHeight = isCrouch ? 4 : 6;
    ctx.fillRect(sx + 2, bodyY + 5, 8, torsoHeight);

    // Arms
    ctx.fillStyle = pal.hairSkin;
    if (isAir) {
      // Arms out for vert / air balance
      ctx.fillRect(sx - 1, bodyY + 5, 3, 2);
      ctx.fillRect(sx + 9, bodyY + 4, 3, 2);
    } else if (isCrouch) {
      // Hands lowered to deck
      ctx.fillRect(sx + 1, bodyY + 7, 2, 4);
      ctx.fillRect(sx + 8, bodyY + 7, 2, 4);
    } else if (isPushing) {
      // Pushing arm back
      const armBackX = isFacingRight ? sx : sx + 10;
      ctx.fillRect(armBackX, bodyY + 6, 2, 4);
    }

    // Pants / Legs
    ctx.fillStyle = pal.pants;
    if (isCrouch) {
      // Deep knee tuck
      ctx.fillRect(sx + 1, bodyY + 9, 4, 4);
      ctx.fillRect(sx + 7, bodyY + 9, 4, 4);
    } else if (isAir) {
      // Knees bent up
      ctx.fillRect(sx + 2, bodyY + 10, 3, 4);
      ctx.fillRect(sx + 7, bodyY + 10, 3, 4);
    } else if (isPushing) {
      // One foot on board, one kicking back
      ctx.fillRect(sx + 4, bodyY + 11, 4, 4);
      const kickX = isFacingRight ? sx - 2 : sx + 9;
      ctx.fillRect(kickX, bodyY + 12, 3, 4);
    } else {
      // Regular skate stance
      ctx.fillRect(sx + 2, bodyY + 11, 3, 4);
      ctx.fillRect(sx + 7, bodyY + 11, 3, 4);
    }

    // Shoes
    ctx.fillStyle = pal.shoes || NES_PALETTE.black;
    ctx.fillRect(sx + 1, isCrouch ? bodyY + 12 : sy + 15, 3, 1);
    ctx.fillRect(sx + 7, isCrouch ? bodyY + 12 : sy + 15, 3, 1);

    // -----------------------------------------------------------
    // THE SKATEBOARD
    // -----------------------------------------------------------
    const boardY = sy + (isCrouch ? PLAYER_HEIGHT_CROUCH : PLAYER_HEIGHT_STAND) - 2;
    const boardW = 16;
    const boardX = sx - 2;

    // Slight board angle during Ollie ascent / descent
    const tilt = isAir ? Math.max(-2, Math.min(2, Math.round(player.vy * 0.6))) : 0;

    // Deck
    ctx.fillStyle = pal.deck;
    ctx.fillRect(boardX, boardY + tilt, boardW, 2);

    // Grip tape top
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(boardX + 1, boardY - 1 + tilt, boardW - 2, 1);

    // Trucks & Wheels
    ctx.fillStyle = NES_PALETTE.railSteel;
    ctx.fillRect(boardX + 2, boardY + 2 + tilt, 2, 1);
    ctx.fillRect(boardX + boardW - 4, boardY + 2 + tilt, 2, 1);

    ctx.fillStyle = pal.wheels || NES_PALETTE.wheelUrethane;
    ctx.fillRect(boardX + 1, boardY + 2 + tilt, 2, 2);
    ctx.fillRect(boardX + boardW - 3, boardY + 2 + tilt, 2, 2);
  }

  ctx.restore();
}

function renderHUD(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  skater: SkaterProfile
): void {
  // Top HUD Bar background
  ctx.fillStyle = 'rgba(12, 12, 20, 0.82)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 14);
  ctx.fillStyle = NES_PALETTE.hudBorder;
  ctx.fillRect(0, 14, CANVAS_WIDTH, 1);

  // Skater Name & Nickname
  ctx.fillStyle = NES_PALETTE.hudGold;
  ctx.font = '8px monospace';
  ctx.textBaseline = 'top';
  ctx.fillText(skater.name.toUpperCase(), 6, 3);

  // Live Mode Badge
  let badgeText = 'ON BOARD';
  let badgeColor: string = NES_PALETTE.badgeGreen;

  if (player.mode === 'walk') {
    badgeText = 'ON FOOT';
    badgeColor = NES_PALETTE.badgeCyan;
  } else if (player.mode === 'climb') {
    badgeText = 'CLIMBING';
    badgeColor = NES_PALETTE.badgeOrange;
  }

  // Draw Mode Badge
  ctx.fillStyle = badgeColor;
  ctx.fillRect(130, 2, 54, 10);
  ctx.fillStyle = NES_PALETTE.black;
  ctx.font = 'bold 7px monospace';
  ctx.fillText(badgeText, 134, 3);

  // Speed bar or Trick Info
  const absSpeed = Math.abs(player.vx);
  ctx.fillStyle = NES_PALETTE.concreteLight;
  ctx.font = '7px monospace';
  ctx.fillText('SPD', 200, 3);

  // Speedometer ticks
  ctx.fillStyle = NES_PALETTE.concreteDark;
  ctx.fillRect(220, 4, 36, 6);
  ctx.fillStyle = player.isGrounded && absSpeed > 1.8 ? NES_PALETTE.hudGold : NES_PALETTE.hudActive;
  const speedBarW = Math.min(34, Math.round((absSpeed / 3.6) * 34));
  ctx.fillRect(221, 5, speedBarW, 4);

  // Special Trick Pill
  ctx.fillStyle = NES_PALETTE.hudWhite;
  ctx.font = '7px monospace';
  ctx.fillText(`★ ${skater.specialTrickName}`, 262, 3);
}
