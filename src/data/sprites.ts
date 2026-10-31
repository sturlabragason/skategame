import { SkaterProfile, PlayerState } from '../types';
import { NES_PALETTE } from './palette';

// Helper to draw a pixel block in canvas coordinates
export function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

// -------------------------------------------------------------
// AUTHENTIC NES "BART VS THE SPACE MUTANTS" SPRITE SYSTEM
// Character dimensions: 16 wide x 24 high (NES standard sprite tile)
// -------------------------------------------------------------

export function drawCharacterSprite(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  skater: SkaterProfile,
  screenX: number,
  screenY: number
): void {
  const isFacingRight = player.facing === 'right';
  const pal = skater.palette;
  const isBart = skater.id === 'bart';

  ctx.save();

  // Flip horizontally if facing left
  if (!isFacingRight) {
    ctx.translate(Math.round(screenX + 16), Math.round(screenY));
    ctx.scale(-1, 1);
  } else {
    ctx.translate(Math.round(screenX), Math.round(screenY));
  }

  // -----------------------------------------------------------
  // 1. BAILED / CRASHED STATE (Dizzy stars, lying down)
  // -----------------------------------------------------------
  if (player.mode === 'bail') {
    // Skater knocked onto back
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(0, 16, 22, 6);

    // Body lying horizontal
    ctx.fillStyle = pal.shirt;
    ctx.fillRect(8, 17, 8, 4);

    // Head on ground
    ctx.fillStyle = pal.hairSkin;
    ctx.fillRect(16, 15, 6, 6);
    if (isBart) {
      // Spikes to the right
      ctx.fillRect(20, 14, 2, 2);
      ctx.fillRect(21, 16, 2, 2);
    }
    // X for eye
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(18, 17, 2, 2);

    // Pants & legs
    ctx.fillStyle = pal.pants;
    ctx.fillRect(2, 17, 6, 4);
    // Shoes
    ctx.fillStyle = pal.shoes || NES_PALETTE.pantsBlue;
    ctx.fillRect(0, 16, 3, 3);

    // Skateboard upside down nearby
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(-6, 20, 16, 2);
    ctx.fillStyle = pal.wheels || NES_PALETTE.wheelRed;
    ctx.fillRect(-5, 18, 3, 2);
    ctx.fillRect(5, 18, 3, 2);

    // Dizzy stars animation circling head
    const starCycle = Math.floor(player.bailTimer / 4) % 4;
    ctx.fillStyle = NES_PALETTE.hudGold;
    if (starCycle === 0) {
      ctx.fillRect(17, 9, 2, 2);
      ctx.fillRect(14, 12, 2, 2);
    } else if (starCycle === 1) {
      ctx.fillRect(21, 10, 2, 2);
      ctx.fillRect(18, 7, 2, 2);
    } else if (starCycle === 2) {
      ctx.fillRect(23, 12, 2, 2);
      ctx.fillRect(20, 10, 2, 2);
    } else {
      ctx.fillRect(15, 8, 2, 2);
      ctx.fillRect(22, 11, 2, 2);
    }

    ctx.restore();
    return;
  }

  // -----------------------------------------------------------
  // 2. LADDER CLIMBING STATE
  // -----------------------------------------------------------
  if (player.mode === 'climb') {
    const step = Math.floor(player.y / 6) % 2;

    // Head from behind
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(4, 1, 8, 7);
    ctx.fillStyle = isBart ? NES_PALETTE.skinBart : (pal.hairColor || NES_PALETTE.hairBrown);
    ctx.fillRect(5, 2, 6, 5);
    if (isBart) {
      // 5 top spikes from behind
      ctx.fillRect(5, 0, 1, 2);
      ctx.fillRect(7, 0, 1, 2);
      ctx.fillRect(9, 0, 1, 2);
    }

    // Shirt & Torso
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(3, 7, 10, 8);
    ctx.fillStyle = pal.shirt;
    ctx.fillRect(4, 8, 8, 6);

    // Skateboard strapped onto back vertically
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(6, 6, 4, 13);
    ctx.fillStyle = pal.deck;
    ctx.fillRect(7, 7, 2, 11);
    ctx.fillStyle = pal.wheels || NES_PALETTE.wheelRed;
    ctx.fillRect(5, 8, 2, 2);
    ctx.fillRect(9, 8, 2, 2);
    ctx.fillRect(5, 15, 2, 2);
    ctx.fillRect(9, 15, 2, 2);

    // Arms gripping ladder rungs
    ctx.fillStyle = pal.hairSkin;
    if (step === 0) {
      ctx.fillRect(2, 5, 2, 4);  // Left arm high
      ctx.fillRect(12, 9, 2, 4); // Right arm low
    } else {
      ctx.fillRect(2, 9, 2, 4);  // Left arm low
      ctx.fillRect(12, 5, 2, 4); // Right arm high
    }

    // Shorts
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(4, 14, 8, 4);
    ctx.fillStyle = pal.pants;
    ctx.fillRect(5, 14, 6, 3);

    // Legs & Shoes
    ctx.fillStyle = pal.hairSkin;
    ctx.fillRect(4, 17, 3, 3);
    ctx.fillRect(9, 17, 3, 3);
    ctx.fillStyle = pal.shoes || NES_PALETTE.pantsBlue;
    ctx.fillRect(3, 20, 4, 3);
    ctx.fillRect(9, 20, 4, 3);

    ctx.restore();
    return;
  }

  // -----------------------------------------------------------
  // 3. ON FOOT WALKING WITH BOARD UNDER ARM
  // Exactly like Bart in NES Bart vs the Space Mutants!
  // -----------------------------------------------------------
  if (player.mode === 'walk') {
    const isMoving = Math.abs(player.vx) > 0.1;
    const walkFrame = isMoving ? player.animationFrame : 0;

    // Head outline
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(4, 1, 9, 8);

    // Face / skin
    ctx.fillStyle = pal.hairSkin;
    ctx.fillRect(5, 2, 7, 6);

    if (isBart) {
      // Bart's iconic 9-spike flat top hair
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(4, 0, 8, 2);
      ctx.fillStyle = NES_PALETTE.skinBart;
      ctx.fillRect(4, 0, 1, 2);
      ctx.fillRect(6, 0, 1, 2);
      ctx.fillRect(8, 0, 1, 2);
      ctx.fillRect(10, 0, 1, 2);
      ctx.fillRect(11, 0, 1, 2);

      // Eye & characteristic pupil
      ctx.fillStyle = NES_PALETTE.white;
      ctx.fillRect(9, 3, 3, 3);
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(10, 4, 1, 2);

      // Overbite mouth
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(9, 7, 3, 1);
    } else {
      // Human skater hair & cap
      ctx.fillStyle = pal.hairColor || NES_PALETTE.hairBrown;
      ctx.fillRect(4, 1, 8, 3);
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(9, 4, 1, 1);
    }

    // Torso / Shirt outline
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(3, 8, 9, 7);
    ctx.fillStyle = pal.shirt;
    ctx.fillRect(4, 9, 7, 5);

    // SKATEBOARD TUCKED UNDER ARM!
    if (player.carriedBoard) {
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(1, 9, 3, 12);
      ctx.fillStyle = pal.deck;
      ctx.fillRect(2, 10, 1, 10);
      // Wheels
      ctx.fillStyle = pal.wheels || NES_PALETTE.wheelRed;
      ctx.fillRect(0, 10, 2, 2);
      ctx.fillRect(0, 17, 2, 2);
    }

    // Arm holding board / swinging
    ctx.fillStyle = pal.hairSkin;
    if (walkFrame === 1) {
      ctx.fillRect(6, 10, 3, 3);
    } else {
      ctx.fillRect(5, 10, 3, 3);
    }

    // Shorts outline
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(4, 14, 8, 4);
    ctx.fillStyle = pal.pants;
    ctx.fillRect(5, 14, 6, 3);

    // Legs animation
    ctx.fillStyle = pal.hairSkin;
    ctx.fillStyle = NES_PALETTE.black;
    if (walkFrame === 1) {
      // Stride forward
      ctx.fillRect(2, 17, 4, 5);
      ctx.fillRect(9, 17, 4, 4);
      ctx.fillStyle = pal.shoes || NES_PALETTE.pantsBlue;
      ctx.fillRect(1, 20, 4, 3);
      ctx.fillRect(9, 19, 4, 3);
    } else if (walkFrame === 3) {
      // Stride back
      ctx.fillRect(4, 17, 4, 4);
      ctx.fillRect(10, 17, 4, 5);
      ctx.fillStyle = pal.shoes || NES_PALETTE.pantsBlue;
      ctx.fillRect(4, 19, 4, 3);
      ctx.fillRect(10, 20, 4, 3);
    } else {
      // Standing
      ctx.fillRect(4, 17, 3, 4);
      ctx.fillRect(8, 17, 3, 4);
      ctx.fillStyle = pal.shoes || NES_PALETTE.pantsBlue;
      ctx.fillRect(3, 20, 4, 3);
      ctx.fillRect(8, 20, 4, 3);
    }

    ctx.restore();
    return;
  }

  // -----------------------------------------------------------
  // 4. SKATEBOARDING STATES (Riding, Crouching, Grinding, Tricks)
  // -----------------------------------------------------------
  const isCrouch = player.isCrouching;
  const isAir = !player.isGrounded && player.mode !== 'grind';
  const isGrind = player.mode === 'grind';
  const isPushing = player.pushTimer > 0;
  const currentTrick = player.currentTrick;
  const trickName = currentTrick?.name;

  // Vertical offset for crouch
  const yShift = isCrouch ? 4 : 0;

  // Head outline
  ctx.fillStyle = NES_PALETTE.black;
  ctx.fillRect(4, 1 + yShift, 9, 8);

  // Face / skin
  ctx.fillStyle = pal.hairSkin;
  ctx.fillRect(5, 2 + yShift, 7, 6);

  if (isBart) {
    // Spikes
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(4, 0 + yShift, 8, 2);
    ctx.fillStyle = NES_PALETTE.skinBart;
    ctx.fillRect(4, 0 + yShift, 1, 2);
    ctx.fillRect(6, 0 + yShift, 1, 2);
    ctx.fillRect(8, 0 + yShift, 1, 2);
    ctx.fillRect(10, 0 + yShift, 1, 2);
    ctx.fillRect(11, 0 + yShift, 1, 2);

    // Eye & pupil
    ctx.fillStyle = NES_PALETTE.white;
    ctx.fillRect(9, 3 + yShift, 3, 3);
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(10, 4 + yShift, 1, 2);
    // Mouth
    ctx.fillRect(9, 7 + yShift, 3, 1);
  } else {
    // Human skater
    ctx.fillStyle = pal.hairColor || NES_PALETTE.hairBrown;
    ctx.fillRect(4, 1 + yShift, 8, 3);
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(9, 4 + yShift, 1, 1);
  }

  // Torso / Shirt
  ctx.fillStyle = NES_PALETTE.black;
  ctx.fillRect(3, 8 + yShift, 10, isCrouch ? 5 : 7);
  ctx.fillStyle = pal.shirt;
  ctx.fillRect(4, 9 + yShift, 8, isCrouch ? 4 : 5);

  // Arms according to trick / stance
  ctx.fillStyle = pal.hairSkin;
  if (trickName === 'Christ Air') {
    // Both arms wide in full cross pose!
    ctx.fillRect(-3, 8 + yShift, 7, 3);
    ctx.fillRect(12, 8 + yShift, 7, 3);
  } else if (trickName === 'Indy' || trickName === 'Melon') {
    // Hand reaching down grabbing board
    ctx.fillRect(6, 11 + yShift, 3, 7);
  } else if (trickName === 'Nosegrab') {
    // Hand reaching forward to nose
    ctx.fillRect(10, 10 + yShift, 6, 3);
    ctx.fillRect(14, 12 + yShift, 2, 6);
  } else if (trickName === 'Tailgrab') {
    // Hand reaching back to tail
    ctx.fillRect(0, 10 + yShift, 5, 3);
    ctx.fillRect(0, 12 + yShift, 2, 6);
  } else if (isAir) {
    // Balance arms raised
    ctx.fillRect(0, 6 + yShift, 4, 3);
    ctx.fillRect(12, 5 + yShift, 4, 3);
  } else if (isCrouch) {
    // Hands down ready to pop
    ctx.fillRect(2, 10 + yShift, 3, 4);
    ctx.fillRect(11, 10 + yShift, 3, 4);
  } else if (isPushing) {
    // Pushing arm back
    ctx.fillRect(0, 9 + yShift, 4, 3);
    ctx.fillRect(10, 8 + yShift, 3, 3);
  } else {
    // Relaxed street skating arms
    ctx.fillRect(1, 9 + yShift, 3, 4);
    ctx.fillRect(11, 9 + yShift, 3, 4);
  }

  // Shorts outline
  ctx.fillStyle = NES_PALETTE.black;
  ctx.fillRect(3, 14 + (isCrouch ? 1 : 0), 10, 4);
  ctx.fillStyle = pal.pants;
  ctx.fillRect(4, 14 + (isCrouch ? 1 : 0), 8, 3);

  // Legs & Shoes
  ctx.fillStyle = pal.shoes || NES_PALETTE.pantsBlue;
  if (isCrouch) {
    // Knees tucked deep
    ctx.fillRect(2, 16, 5, 3);
    ctx.fillRect(9, 16, 5, 3);
  } else if (isPushing) {
    // Front foot on board, back kicking back
    ctx.fillRect(6, 17, 4, 3);
    ctx.fillRect(-2, 19, 4, 3); // Kick back
  } else if (isGrind && player.grindType === 'Boardslide') {
    // Feet spread wide across deck
    ctx.fillRect(1, 17, 5, 3);
    ctx.fillRect(10, 17, 5, 3);
  } else {
    // Regular stance feet
    ctx.fillRect(2, 17, 4, 3);
    ctx.fillRect(9, 17, 4, 3);
  }

  // -----------------------------------------------------------
  // THE SKATEBOARD
  // -----------------------------------------------------------
  let boardY = 20;
  let boardTilt = 0;

  if (isAir) {
    // Dynamic tilt based on vertical speed
    boardTilt = Math.max(-3, Math.min(3, Math.round(player.vy * 0.7)));
  }

  // Flip trick animation rotation
  const isFlipping = currentTrick?.category === 'flip';
  const flipFrame = isFlipping ? Math.floor(player.trickTimer / 3) % 4 : 0;

  if (isFlipping) {
    // Board rotates in air!
    if (flipFrame === 1) {
      // Board vertical edge-on
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(6, 19 + boardTilt, 4, 3);
      ctx.fillStyle = pal.deck;
      ctx.fillRect(7, 19 + boardTilt, 2, 2);
    } else if (flipFrame === 2) {
      // Board upside down (grip tape down, graphic up)
      ctx.fillStyle = pal.deck;
      ctx.fillRect(-1, 20 + boardTilt, 18, 2);
      ctx.fillStyle = pal.wheels || NES_PALETTE.wheelRed;
      ctx.fillRect(1, 18 + boardTilt, 3, 2);
      ctx.fillRect(12, 18 + boardTilt, 3, 2);
    } else {
      // Flat board
      ctx.fillStyle = NES_PALETTE.black;
      ctx.fillRect(-2, 20 + boardTilt, 20, 2);
      ctx.fillStyle = pal.deck;
      ctx.fillRect(-1, 21 + boardTilt, 18, 1);
      ctx.fillStyle = pal.wheels || NES_PALETTE.wheelRed;
      ctx.fillRect(0, 22 + boardTilt, 3, 2);
      ctx.fillRect(13, 22 + boardTilt, 3, 2);
    }
  } else if (player.grindType === 'Darkslide') {
    // Upside-down board sliding on grip tape!
    ctx.fillStyle = pal.deck;
    ctx.fillRect(-2, 20, 20, 2);
    ctx.fillStyle = NES_PALETTE.black; // Grip tape down
    ctx.fillRect(-2, 21, 20, 1);
    ctx.fillStyle = pal.wheels || NES_PALETTE.wheelRed;
    ctx.fillRect(0, 18, 3, 2);
    ctx.fillRect(13, 18, 3, 2);
  } else {
    // Standard board
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(-2, boardY + boardTilt, 20, 2);

    // Deck graphic color
    ctx.fillStyle = pal.deck;
    ctx.fillRect(-1, boardY + 1 + boardTilt, 18, 1);

    // Grip tape on top
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(-1, boardY - 1 + boardTilt, 18, 1);

    // Trucks (metallic steel)
    ctx.fillStyle = NES_PALETTE.railSteel;
    ctx.fillRect(1, boardY + 2 + boardTilt, 3, 1);
    ctx.fillRect(12, boardY + 2 + boardTilt, 3, 1);

    // Urethane wheels
    ctx.fillStyle = pal.wheels || NES_PALETTE.wheelRed;
    ctx.fillRect(0, boardY + 2 + boardTilt, 3, 2);
    ctx.fillRect(13, boardY + 2 + boardTilt, 3, 2);
  }

  ctx.restore();
}

// -------------------------------------------------------------
// COLLECTIBLES (S-K-A-T-E Letters & Secret VHS Tape)
// -------------------------------------------------------------
export function drawCollectible(
  ctx: CanvasRenderingContext2D,
  type: 'letter' | 'tape',
  letter: string | undefined,
  x: number,
  y: number,
  bobTimer: number
): void {
  const bobY = Math.round(y + Math.sin(bobTimer * 0.1) * 3);

  if (type === 'letter' && letter) {
    // Glowing golden 8x8 NES letter tile
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(x - 1, bobY - 1, 10, 10);
    ctx.fillStyle = NES_PALETTE.hudGold;
    ctx.fillRect(x, bobY, 8, 8);
    ctx.fillStyle = NES_PALETTE.hudWhite;

    ctx.font = 'bold 7px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillText(letter, x + 4, bobY + 4);
  } else {
    // Secret VHS Cassette Tape
    ctx.fillStyle = NES_PALETTE.black;
    ctx.fillRect(x, bobY, 12, 8);
    ctx.fillStyle = NES_PALETTE.shirtCyan;
    ctx.fillRect(x + 1, bobY + 1, 10, 6);
    // Spool holes
    ctx.fillStyle = NES_PALETTE.hudWhite;
    ctx.fillRect(x + 3, bobY + 3, 2, 2);
    ctx.fillRect(x + 7, bobY + 3, 2, 2);
  }
}

// -------------------------------------------------------------
// GRIND SPARKS PARTICLE EMITTER
// -------------------------------------------------------------
export function drawGrindSparks(
  ctx: CanvasRenderingContext2D,
  contactX: number,
  contactY: number,
  tick: number
): void {
  const colors = [NES_PALETTE.sparkYellow, NES_PALETTE.hudWhite, NES_PALETTE.sparkOrange];
  for (let i = 0; i < 6; i++) {
    const angle = ((tick * 17 + i * 43) % 100) / 100;
    const dist = 3 + ((tick + i * 7) % 8);
    const px = Math.round(contactX - dist * Math.cos(angle * Math.PI));
    const py = Math.round(contactY - dist * Math.sin(angle * Math.PI));
    const color = colors[(tick + i) % colors.length];
    ctx.fillStyle = color;
    ctx.fillRect(px, py, 2, 2);
  }
}
