// Authentic NES 2C02 palette constants
export const NES_PALETTE = {
  // Background & Warehouse environment
  warehouseBg: '#181828',       // Deep slate night / interior shadow
  warehouseGirder: '#2c2c40',   // Dark structural iron
  brick: '#882800',             // Deep NES brick red
  brickDark: '#501800',         // Brick mortar/shadow
  concrete: '#7c7c7c',          // Mid gray concrete
  concreteDark: '#444444',      // Shadow concrete / curb
  concreteLight: '#bcbcbc',     // Worn concrete highlight / rail steel
  woodLedge: '#b87000',         // Plywood / wooden obstacles
  woodLedgeDark: '#884400',

  // Rails, Ladders & Hazards
  railSteel: '#bcbcbc',         // Galvanized steel rail
  railHighlight: '#fcfcfc',     // Sunlight glint on rail
  railShadow: '#404040',        // Under-rail shadow
  ladderRung: '#f8b800',        // High-vis warehouse yellow ladder rungs
  ladderRail: '#885800',        // Ladder side rails
  hazardStripe1: '#f8b800',     // Caution gold
  hazardStripe2: '#000000',     // Caution black

  // UI & HUD
  hudGold: '#f8b800',           // Classic NES score gold
  hudWhite: '#fcfcfc',          // Bright white text
  hudDark: '#0c0c14',           // Panel backdrop
  hudBorder: '#7c7c7c',         // Frame border
  hudActive: '#3cbcfc',         // Sky blue highlight
  badgeGreen: '#00a800',        // On-board status badge
  badgeCyan: '#3cbcfc',         // On-foot status badge
  badgeOrange: '#f87800',       // Climbing status badge

  // Skaters & Accents
  black: '#000000',
  white: '#fcfcfc',
  skinFair: '#fce0a8',
  skinTan: '#e09050',
  hairBlonde: '#f8b800',
  hairBrown: '#684400',
  hairBlack: '#1c1c1c',
  shirtRed: '#e40058',
  shirtCyan: '#3cbcfc',
  shirtGreen: '#008800',
  pantsDenim: '#2038ec',
  pantsKhaki: '#d8b800',
  pantsDarkGrey: '#404040',
  pantsMaroon: '#880000',
  deckGold: '#f8b800',
  deckRed: '#f83800',
  deckBlack: '#181818',
  deckBlue: '#3cbcfc',
  wheelUrethane: '#fcfcfc',
} as const;
