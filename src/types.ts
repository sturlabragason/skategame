export type SkaterId = 'bart' | 'tony' | 'rune' | 'rodney' | 'cab';

export interface SkaterStats {
  air: number;          // 1-10
  speed: number;        // 1-10
  ollie: number;        // 1-10
  flipSpeed: number;    // 1-10
  grindBalance: number; // 1-10
}

export interface SkaterPalette {
  shirt: string;
  pants: string;
  deck: string;
  hairSkin: string;
  hairColor?: string;
  isSpikyHair?: boolean; // For Bart Simpson
  wheels?: string;
  shoes?: string;
}

export interface SkaterProfile {
  id: SkaterId;
  name: string;
  nickname: string;
  hometown: string;
  style: string;
  specialTrickName: string;
  specialDescription: string;
  stats: SkaterStats;
  palette: SkaterPalette;
}

export type PlayerMode = 'skate' | 'walk' | 'climb' | 'grind' | 'bail';

export type FlipTrick =
  | 'Kickflip'
  | 'Heelflip'
  | 'Pop Shove-it'
  | 'Varial Kickflip'
  | '360 Flip';

export type GrabTrick =
  | 'Indy'
  | 'Melon'
  | 'Nosegrab'
  | 'Tailgrab'
  | 'Christ Air'
  | 'The 900'
  | 'Caballerial'
  | 'Space Mutant Hop';

export type GrindType = '50-50' | 'Boardslide' | 'Nosegrind' | 'Darkslide';

export interface ActiveTrick {
  name: string;
  points: number;
  category: 'flip' | 'grab' | 'grind' | 'spin' | 'special';
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mode: PlayerMode;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isCrouching: boolean;
  crouchTimer: number;
  pushTimer: number;
  isClimbing: boolean;
  carriedBoard: boolean;
  currentLadderId: string | null;
  cavemanTimer: number;
  cavemanComboTimer: number; // 150 frames (2.5s) combo countdown on foot
  animationFrame: number;
  animationTimer: number;

  // Grind Mechanics
  currentRailId: string | null;
  grindType: GrindType | null;
  grindBalance: number; // -1.0 to 1.0 (drift balance gauge)
  grindDuration: number;

  // Air Tricks & Rotations
  currentTrick: ActiveTrick | null;
  trickTimer: number;
  airSpinDegrees: number; // 0, 180, 360, 540, 720, 900
  airRotHoldTimer: number;
  specialMeter: number; // 0 to 100
  isSpecialActive: boolean;

  // Bail
  bailTimer: number;

  // Combo & Scores
  currentComboTricks: ActiveTrick[];
  comboBaseScore: number;
  comboMultiplier: number;
  lastLandedScore: number;
  totalScore: number;

  // Objectives
  collectedLetters: string[]; // 'S', 'K', 'A', 'T', 'E'
  hasSecretTape: boolean;
  plazaHandrailGrinded: boolean;
  highScoreAchieved: boolean;
  proScoreAchieved: boolean;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'one-way';
}

export interface Ladder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Rail {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isPlazaRail?: boolean;
}

export interface Slope {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: 'ramp' | 'bank';
}

export interface QuarterPipe {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  radius: number;
}

export interface CollectibleItem {
  id: string;
  type: 'letter' | 'tape';
  letter?: 'S' | 'K' | 'A' | 'T' | 'E';
  x: number;
  y: number;
  collected: boolean;
}

export interface LevelData {
  name: string;
  width: number;
  height: number;
  groundY: number;
  platforms: Platform[];
  ladders: Ladder[];
  rails: Rail[];
  slopes: Slope[];
  quarterPipes: QuarterPipe[];
  collectibles: CollectibleItem[];
  spawn: {
    x: number;
    y: number;
    mode: PlayerMode;
  };
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;      // Space / ArrowUp (on ground/board)
  push: boolean;      // J / Z (Push on ground, Flip trick in air)
  grab: boolean;      // K / X (Grind on rail, Grab trick in air)
  action: boolean;    // E / Shift (mount / dismount / caveman)
  special: boolean;   // L / C (Special modifier when meter full)
}

export type GameMode = 'session' | 'freeskate';
export type GameView = 'select' | 'play' | 'summary';
