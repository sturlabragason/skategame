import { LevelData, PlayerState, SkaterProfile } from '../types';
import { NES_PALETTE } from '../data/palette';
import { drawCharacterSprite, drawCollectible, drawGrindSparks } from '../data/sprites';
import { PLAYER_WIDTH, PLAYER_HEIGHT_STAND } from './physics';

export const CANVAS_WIDTH = 320;
export const CANVAS_HEIGHT = 180;

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cameraX: number;
  cameraY: number;
  tick: number;
}

export function createRenderContext(canvas: HTMLCanvasElement): RenderContext {
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return {
    canvas,
    ctx,
    cameraX: 0,
    cameraY: 0,
    tick: 0,
  };
}

export function renderGame(
  rc: RenderContext,
  player: PlayerState,
  skater: SkaterProfile,
  level: LevelData,
  sessionTimeLeftSeconds: number | null,
  isSessionMode: boolean
): void {
  const { ctx } = rc;
  rc.tick++;

  // -------------------------------------------------------------
  // Camera update: smooth follow player X, clamp to level
  // -------------------------------------------------------------
  const targetCamX = player.x + PLAYER_WIDTH / 2 - CANVAS_WIDTH / 2;
  rc.cameraX += (targetCamX - rc.cameraX) * 0.12;
  rc.cameraX = Math.max(0, Math.min(level.width - CANVAS_WIDTH, rc.cameraX));

  // Camera lift when high on catwalk
  const targetCamY = player.y < 80 ? Math.max(0, player.y - 50) : 0;
  rc.cameraY += (targetCamY - rc.cameraY) * 0.1;
  rc.cameraY = Math.max(0, Math.min(level.height - CANVAS_HEIGHT, rc.cameraY));

  const camX = Math.round(rc.cameraX);
  const camY = Math.round(rc.cameraY);

  ctx.imageSmoothingEnabled = false;

  // -------------------------------------------------------------
  // 1. WAREHOUSE & COPENHAGEN YARD BACKGROUND
  // -------------------------------------------------------------
  ctx.fillStyle = NES_PALETTE.warehouseBg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Parallax brick wall
  const bgX = Math.floor(camX * 0.35);
  ctx.fillStyle = NES_PALETTE.brick;
  ctx.fillRect(0, 20, CANVAS_WIDTH, 136);

  // Brick mortar lines
  ctx.fillStyle = NES_PALETTE.brickDark;
  for (let by = 26; by < 156; by += 8) {
    ctx.fillRect(0, by, CANVAS_WIDTH, 1);
    const rowOffset = ((by / 8) % 2) * 12;
    for (let bx = -(bgX % 24) + rowOffset; bx < CANVAS_WIDTH; bx += 24) {
      ctx.fillRect(bx, by - 7, 1, 8);
    }
  }

  // Authentic 8-Bit Graffiti on brick wall
  // Zone 1: "EL BARTO" graffiti
  const elBartoX = Math.round(280 - bgX);
  if (elBartoX > -100 && elBartoX < CANVAS_WIDTH) {
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = NES_PALETTE.hudGold;
    ctx.fillText('EL BARTO', elBartoX, 60);
    ctx.fillStyle = NES_PALETTE.sparkOrange;
    ctx.fillText('EL BARTO', elBartoX - 1, 59);
  }

  // Zone 2: "SKATE OR DIE"
  const skateTagX = Math.round(920 - bgX);
  if (skateTagX > -120 && skateTagX < CANVAS_WIDTH) {
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = NES_PALETTE.hudActive;
    ctx.fillText('SKATE // 89', skateTagX, 58);
  }

  // Zone 3: "SPRINGFIELD"
  const yardTagX = Math.round(1700 - bgX);
  if (yardTagX > -140 && yardTagX < CANVAS_WIDTH) {
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = NES_PALETTE.badgeGreen;
    ctx.fillText('SPRINGFIELD YARD', yardTagX, 58);
  }

  // Structural Steel I-Beams & Girders
  ctx.fillStyle = NES_PALETTE.warehouseGirder;
  for (let gx = -(camX % 120); gx < CANVAS_WIDTH; gx += 120) {
    ctx.fillRect(gx, 0, 10, CANVAS_HEIGHT - 24);
    // Rivets
    ctx.fillStyle = NES_PALETTE.concreteDark;
    ctx.fillRect(gx + 2, 24, 2, 2);
    ctx.fillRect(gx + 6, 24, 2, 2);
    ctx.fillRect(gx + 2, 64, 2, 2);
    ctx.fillRect(gx + 6, 64, 2, 2);
    ctx.fillStyle = NES_PALETTE.warehouseGirder;
  }

  // High Warehouse Windows
  for (let wx = 40 - (bgX % 160); wx < CANVAS_WIDTH; wx += 160) {
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(wx, 26, 32, 28);
    ctx.fillStyle = '#203858';
    ctx.fillRect(wx + 2, 28, 13, 11);
    ctx.fillRect(wx + 17, 28, 13, 11);
    ctx.fillRect(wx + 2, 41, 13, 11);
    ctx.fillRect(wx + 17, 41, 13, 11);
  }

  // -------------------------------------------------------------
  // 2. LEVEL GEOMETRY (Platforms, Catwalk, Slopes, Ramps)
  // -------------------------------------------------------------

  // A. Quarter-Pipes (Vert Transitions)
  for (const qp of level.quarterPipes) {
    const qx = Math.round(qp.x - camX);
    const qy = Math.round(qp.y - camY);

    if (qx + qp.width < -20 || qx > CANVAS_WIDTH + 20) continue;

    // Draw authentic stepped/curved NES vert transition
    ctx.fillStyle = NES_PALETTE.concreteDark;
    ctx.beginPath();
    ctx.moveTo(qx, level.groundY - camY);

    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const stepT = i / steps;
      const curX = qx + stepT * qp.width;
      let u: number;
      if (qp.facing === 'right') {
        u = stepT;
      } else {
        u = 1 - stepT;
      }
      const curY = qy + (u * u) * qp.height;
      ctx.lineTo(curX, curY);
    }

    ctx.lineTo(qx + qp.width, level.groundY - camY);
    ctx.closePath();
    ctx.fill();

    // Steel Coping Lip
    ctx.strokeStyle = NES_PALETTE.railSteel;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const stepT = i / steps;
      const curX = qx + stepT * qp.width;
      let u = qp.facing === 'right' ? stepT : 1 - stepT;
      const curY = qy + (u * u) * qp.height;
      if (i === 0) ctx.moveTo(curX, curY);
      else ctx.lineTo(curX, curY);
    }
    ctx.stroke();

    // Coping rail at the lip apex
    const copingX = qp.facing === 'right' ? qx : qx + qp.width - 8;
    ctx.fillStyle = NES_PALETTE.railHighlight;
    ctx.fillRect(copingX, qy - 1, 8, 2);
  }

  // B. Slopes / Kickers
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

      // Highlight Lip
      ctx.strokeStyle = NES_PALETTE.concreteLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();
    }
  }

  // C. Platforms (Ground floor, Catwalk, Funbox, Stairs)
  for (const plat of level.platforms) {
    const px = Math.round(plat.x - camX);
    const py = Math.round(plat.y - camY);

    if (px + plat.width < -10 || px > CANVAS_WIDTH + 10) continue;

    if (plat.id === 'ground_main') {
      // Concrete ground floor
      ctx.fillStyle = NES_PALETTE.concreteDark;
      ctx.fillRect(px, py, plat.width, plat.height);
      // Floor highlight line
      ctx.fillStyle = NES_PALETTE.concreteLight;
      ctx.fillRect(px, py, plat.width, 2);
      // Asphalt texture dots
      ctx.fillStyle = NES_PALETTE.black;
      for (let dotX = px + 4; dotX < px + plat.width; dotX += 16) {
        ctx.fillRect(dotX, py + 6, 2, 1);
        ctx.fillRect(dotX + 8, py + 14, 2, 1);
      }
    } else if (plat.id === 'upper_catwalk') {
      // High Industrial Catwalk
      ctx.fillStyle = NES_PALETTE.concreteDark;
      ctx.fillRect(px, py, plat.width, plat.height);
      ctx.fillStyle = NES_PALETTE.hazardStripe1;
      ctx.fillRect(px, py, plat.width, 2);
      // Steel support vertical beams
      ctx.fillStyle = NES_PALETTE.warehouseGirder;
      for (let bx = px + 30; bx < px + plat.width; bx += 80) {
        ctx.fillRect(bx, py + 6, 4, 156 - (py + 6));
      }
    } else {
      // Solid obstacles (Funbox, Ledges, Stairs)
      ctx.fillStyle = NES_PALETTE.concreteDark;
      ctx.fillRect(px, py, plat.width, plat.height);
      ctx.fillStyle = NES_PALETTE.concreteLight;
      ctx.fillRect(px, py, plat.width, 2);
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(px, py + plat.height - 2, plat.width, 2);
    }
  }

  // D. Ladders
  for (const lad of level.ladders) {
    const lx = Math.round(lad.x - camX);
    const ly = Math.round(lad.y - camY);

    if (lx + lad.width < -10 || lx > CANVAS_WIDTH + 10) continue;

    // Side rails
    ctx.fillStyle = NES_PALETTE.ladderRail;
    ctx.fillRect(lx, ly, 3, lad.height);
    ctx.fillRect(lx + lad.width - 3, ly, 3, lad.height);

    // High-vis yellow rungs
    ctx.fillStyle = NES_PALETTE.ladderRung;
    for (let ry = ly + 4; ry < ly + lad.height; ry += 8) {
      ctx.fillRect(lx + 2, ry, lad.width - 4, 2);
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(lx + 2, ry + 2, lad.width - 4, 1);
      ctx.fillStyle = NES_PALETTE.ladderRung;
    }
  }

  // E. Rails (Galvanized Steel Flatbars & Down Handrails)
  for (const rail of level.rails) {
    const rx1 = Math.round(rail.x1 - camX);
    const ry1 = Math.round(rail.y1 - camY);
    const rx2 = Math.round(rail.x2 - camX);
    const ry2 = Math.round(rail.y2 - camY);

    if (Math.max(rx1, rx2) < -10 || Math.min(rx1, rx2) > CANVAS_WIDTH + 10) continue;

    // Rail support vertical posts
    ctx.fillStyle = NES_PALETTE.concreteDark;
    const postCount = 3;
    for (let p = 0; p <= postCount; p++) {
      const pt = p / postCount;
      const postX = Math.round(rx1 + pt * (rx2 - rx1));
      const postY = Math.round(ry1 + pt * (ry2 - ry1));
      ctx.fillRect(postX - 1, postY, 3, level.groundY - camY - postY);
    }

    // Main rail bar
    ctx.strokeStyle = NES_PALETTE.railShadow;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(rx1, ry1 + 1);
    ctx.lineTo(rx2, ry2 + 1);
    ctx.stroke();

    ctx.strokeStyle = NES_PALETTE.railSteel;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rx1, ry1);
    ctx.lineTo(rx2, ry2);
    ctx.stroke();

    ctx.strokeStyle = NES_PALETTE.railHighlight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx1, ry1 - 1);
    ctx.lineTo(rx2, ry2 - 1);
    ctx.stroke();
  }

  // F. Collectibles (S-K-A-T-E letters & Secret VHS Tape)
  for (const item of level.collectibles) {
    if (!item.collected) {
      const ix = Math.round(item.x - camX);
      const iy = Math.round(item.y - camY);
      if (ix >= -15 && ix <= CANVAS_WIDTH + 15) {
        drawCollectible(ctx, item.type, item.letter, ix, iy, rc.tick);
      }
    }
  }

  // -------------------------------------------------------------
  // 3. SKATER & SPRITE RENDERING
  // -------------------------------------------------------------
  const playerScreenX = Math.round(player.x - camX);
  const playerScreenY = Math.round(player.y - camY);

  drawCharacterSprite(ctx, player, skater, playerScreenX, playerScreenY);

  // Grind sparks emitter
  if (player.mode === 'grind') {
    drawGrindSparks(
      ctx,
      playerScreenX + 8,
      playerScreenY + PLAYER_HEIGHT_STAND - 2,
      rc.tick
    );
  }

  // -------------------------------------------------------------
  // 4. FLOATING HUD OVER SKATER (Grind Gauge, Caveman Timer, Trick)
  // -------------------------------------------------------------
  // A. Grind Balance Gauge
  if (player.mode === 'grind') {
    const gaugeW = 28;
    const gaugeH = 4;
    const gx = playerScreenX + 8 - gaugeW / 2;
    const gy = playerScreenY - 10;

    // Gauge frame
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(gx - 1, gy - 1, gaugeW + 2, gaugeH + 2);
    ctx.fillStyle = NES_PALETTE.concreteDark;
    ctx.fillRect(gx, gy, gaugeW, gaugeH);

    // Center safe zone tick
    ctx.fillStyle = NES_PALETTE.badgeGreen;
    ctx.fillRect(gx + gaugeW / 2 - 1, gy, 2, gaugeH);

    // Balance indicator needle
    const needleX = Math.max(
      gx + 1,
      Math.min(gx + gaugeW - 3, Math.round(gx + gaugeW / 2 + player.grindBalance * (gaugeW / 2)))
    );
    const isDangerous = Math.abs(player.grindBalance) > 0.75;
    ctx.fillStyle = isDangerous ? NES_PALETTE.badgeRed : NES_PALETTE.hudGold;
    ctx.fillRect(needleX, gy - 1, 3, gaugeH + 2);
  }

  // B. Caveman Combo Bridge 2.5s Countdown Bar
  if (player.mode === 'walk' && player.cavemanComboTimer > 0) {
    const barW = Math.round((player.cavemanComboTimer / 150) * 32);
    const bx = playerScreenX + 8 - 16;
    const by = playerScreenY - 8;

    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(bx - 1, by - 1, 34, 4);
    ctx.fillStyle = NES_PALETTE.hudActive;
    ctx.fillRect(bx, by, barW, 2);
    ctx.fillStyle = NES_PALETTE.hudWhite;
    ctx.font = '6px monospace';
    ctx.fillText('CAVEMAN!', bx, by - 3);
  }

  // C. Floating active trick banner
  if (player.currentTrick && player.trickTimer > 0) {
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const tx = playerScreenX + 8;
    const ty = playerScreenY - 4;

    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillText(player.currentTrick.name.toUpperCase(), tx + 1, ty + 1);
    ctx.fillText(player.currentTrick.name.toUpperCase(), tx - 1, ty - 1);
    ctx.fillStyle =
      player.currentTrick.category === 'special'
        ? NES_PALETTE.hudGold
        : NES_PALETTE.hudWhite;
    ctx.fillText(player.currentTrick.name.toUpperCase(), tx, ty);
  }

  // -------------------------------------------------------------
  // 5. AUTHENTIC 8-BIT NES SCREEN HUD (Top & Bottom)
  // -------------------------------------------------------------
  renderNESHud(ctx, player, skater, sessionTimeLeftSeconds, isSessionMode, rc.tick);
}

function renderNESHud(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  skater: SkaterProfile,
  timeLeft: number | null,
  isSession: boolean,
  tick: number
): void {
  // Top HUD Bar
  ctx.fillStyle = NES_PALETTE.black;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 14);
  ctx.fillStyle = NES_PALETTE.concreteDark;
  ctx.fillRect(0, 14, CANVAS_WIDTH, 1);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 8px monospace';

  // 1. Skater & Score
  ctx.fillStyle = NES_PALETTE.hudGold;
  ctx.fillText(skater.name.split(' ')[0].toUpperCase(), 6, 3);
  ctx.fillStyle = NES_PALETTE.hudWhite;
  ctx.fillText(player.totalScore.toString().padStart(6, '0'), 36, 3);

  // 2. Timer (Session Mode) or Free Skate badge
  if (isSession && timeLeft !== null) {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    ctx.fillStyle = timeLeft <= 15 && tick % 10 < 5 ? NES_PALETTE.badgeRed : NES_PALETTE.hudGold;
    ctx.fillText(`TIME ${timeStr}`, 88, 3);
  } else {
    ctx.fillStyle = NES_PALETTE.badgeCyan;
    ctx.fillText('FREE SKATE', 88, 3);
  }

  // 3. S-K-A-T-E Letters Collection Tracker
  const letters = ['S', 'K', 'A', 'T', 'E'];
  const startX = 160;
  letters.forEach((l, idx) => {
    const isGot = player.collectedLetters.includes(l);
    ctx.fillStyle = isGot ? NES_PALETTE.hudGold : NES_PALETTE.concreteDark;
    ctx.fillText(l, startX + idx * 8, 3);
  });

  // Tape Icon
  ctx.fillStyle = player.hasSecretTape ? NES_PALETTE.hudActive : NES_PALETTE.concreteDark;
  ctx.fillText('📼', 204, 3);

  // 4. SPECIAL METER (Grows to 100%, flashes gold when maxed!)
  const isSpecialFull = player.specialMeter >= 100;
  const specW = 44;
  ctx.fillStyle = NES_PALETTE.concreteDark;
  ctx.fillRect(224, 4, specW, 6);

  if (isSpecialFull) {
    // Flashing gold fanfare
    ctx.fillStyle = tick % 6 < 3 ? NES_PALETTE.hudGold : NES_PALETTE.hudWhite;
    ctx.fillRect(225, 5, specW - 2, 4);
    ctx.fillStyle = NES_PALETTE.black;
    ctx.font = 'bold 6px monospace';
    ctx.fillText('SPECIAL!', 227, 4);
  } else {
    ctx.fillStyle = NES_PALETTE.sparkOrange;
    const fillW = Math.round((player.specialMeter / 100) * (specW - 2));
    ctx.fillRect(225, 5, fillW, 4);
    ctx.fillStyle = NES_PALETTE.hudWhite;
    ctx.font = '6px monospace';
    ctx.fillText('SP', 270, 4);
  }

  // -------------------------------------------------------------
  // Bottom Active Combo String
  // -------------------------------------------------------------
  if (player.comboBaseScore > 0) {
    const comboW = CANVAS_WIDTH - 20;
    const cy = CANVAS_HEIGHT - 16;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(10, cy, comboW, 14);
    ctx.fillStyle = NES_PALETTE.hudGold;
    ctx.fillRect(10, cy, comboW, 1);

    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const trickListStr = player.currentComboTricks.map((t) => t.name).join(' + ');
    const comboText = `${trickListStr}  [${player.comboBaseScore} x ${player.comboMultiplier}]`;

    ctx.fillStyle = NES_PALETTE.hudWhite;
    // Truncate if long
    const displayCombo = comboText.length > 48 ? comboText.slice(0, 45) + '...' : comboText;
    ctx.fillText(displayCombo, CANVAS_WIDTH / 2, cy + 7);
  } else if (player.lastLandedScore > 0) {
    // Flash landed points
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = NES_PALETTE.hudGold;
    ctx.fillText(`LANDED: +${player.lastLandedScore} PTS!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 3);
  }
}
