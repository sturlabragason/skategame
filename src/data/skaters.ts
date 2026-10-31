import { SkaterProfile } from '../types';
import { NES_PALETTE } from './palette';

export const SKATERS: SkaterProfile[] = [
  {
    id: 'rune',
    name: 'Rune Glifberg',
    nickname: 'The Danish Destroyer',
    hometown: 'Copenhagen, DK',
    style: 'Vert Powerhouse',
    specialTrickName: 'Christ Air',
    stats: {
      air: 10,
      speed: 7,
      ollie: 7,
      flipSpeed: 5,
      grindBalance: 5,
    },
    palette: {
      shirt: NES_PALETTE.shirtRed,
      pants: NES_PALETTE.pantsDenim,
      deck: NES_PALETTE.deckGold,
      hairSkin: NES_PALETTE.skinFair,
      wheels: NES_PALETTE.wheelUrethane,
      shoes: NES_PALETTE.black,
    },
  },
  {
    id: 'tony',
    name: 'Tony Hawk',
    nickname: 'The Birdman',
    hometown: 'Carlsbad, CA',
    style: 'Vert & Air Legend',
    specialTrickName: 'The 900',
    stats: {
      air: 9,
      speed: 8,
      ollie: 7,
      flipSpeed: 6,
      grindBalance: 7,
    },
    palette: {
      shirt: NES_PALETTE.shirtCyan,
      pants: NES_PALETTE.pantsDarkGrey,
      deck: NES_PALETTE.deckRed,
      hairSkin: NES_PALETTE.skinFair,
      wheels: NES_PALETTE.wheelUrethane,
      shoes: NES_PALETTE.black,
    },
  },
  {
    id: 'rodney',
    name: 'Rodney Mullen',
    nickname: 'The Godfather',
    hometown: 'Gainesville, FL',
    style: 'Tech Street',
    specialTrickName: 'Darkslide',
    stats: {
      air: 5,
      speed: 6,
      ollie: 9,
      flipSpeed: 10,
      grindBalance: 10,
    },
    palette: {
      shirt: NES_PALETTE.shirtGreen,
      pants: NES_PALETTE.pantsKhaki,
      deck: NES_PALETTE.deckBlack,
      hairSkin: NES_PALETTE.skinFair,
      wheels: NES_PALETTE.wheelUrethane,
      shoes: NES_PALETTE.black,
    },
  },
  {
    id: 'cab',
    name: 'Steve Caballero',
    nickname: 'Cab',
    hometown: 'San Jose, CA',
    style: 'Old-School Pool & All-Around',
    specialTrickName: 'Caballerial',
    stats: {
      air: 8,
      speed: 9,
      ollie: 8,
      flipSpeed: 7,
      grindBalance: 8,
    },
    palette: {
      shirt: NES_PALETTE.black,
      pants: NES_PALETTE.pantsMaroon,
      deck: NES_PALETTE.deckBlue,
      hairSkin: NES_PALETTE.skinTan,
      wheels: NES_PALETTE.wheelUrethane,
      shoes: NES_PALETTE.black,
    },
  },
];

export const DEFAULT_SKATER = SKATERS[0];
