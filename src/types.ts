export type SkaterId = 'rune' | 'tony' | 'rodney' | 'cab';

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
  stats: SkaterStats;
  palette: SkaterPalette;
}

export type PlayerMode = 'skate' | 'walk' | 'climb';

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
  animationFrame: number;
  animationTimer: number;
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
}

export interface Slope {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: 'ramp' | 'bank';
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
  push: boolean;      // X
  action: boolean;    // E / Shift (mount / dismount / caveman)
}
