import { LevelData } from '../types';

export const WAREHOUSE_LEVEL: LevelData = {
  name: 'Warehouse & Yard',
  width: 1200,
  height: 180,
  groundY: 156,
  platforms: [
    // Main warehouse ground floor across entire level
    {
      id: 'ground_main',
      x: 0,
      y: 156,
      width: 1200,
      height: 24,
      type: 'solid',
    },
    // Left quarter-pipe deck
    {
      id: 'deck_left',
      x: 0,
      y: 90,
      width: 50,
      height: 66,
      type: 'solid',
    },
    // Street manual pad / ledge
    {
      id: 'street_ledge',
      x: 200,
      y: 124,
      width: 150,
      height: 32,
      type: 'solid',
    },
    // Upper industrial catwalk (one-way platform: can be jumped up through or walked on)
    {
      id: 'upper_catwalk',
      x: 360,
      y: 68,
      width: 400,
      height: 6,
      type: 'one-way',
    },
    // Yard dumpster / crate obstacle
    {
      id: 'yard_dumpster',
      x: 880,
      y: 132,
      width: 54,
      height: 24,
      type: 'solid',
    },
    // Right roll-in deck
    {
      id: 'deck_right',
      x: 1150,
      y: 90,
      width: 50,
      height: 66,
      type: 'solid',
    },
  ],
  ladders: [
    {
      id: 'catwalk_ladder',
      x: 420,
      y: 68,
      width: 14,
      height: 88, // runs from catwalk y=68 down to ground y=156
    },
  ],
  rails: [
    {
      id: 'ledge_rail',
      x1: 220,
      y1: 114,
      x2: 330,
      y2: 114,
    },
    {
      id: 'ground_flatbar',
      x1: 620,
      y1: 146,
      x2: 740,
      y2: 146,
    },
  ],
  slopes: [
    {
      id: 'left_ramp',
      x1: 50,
      y1: 90,
      x2: 110,
      y2: 156,
      kind: 'ramp',
    },
    {
      id: 'right_ramp',
      x1: 1090,
      y1: 156,
      x2: 1150,
      y2: 90,
      kind: 'ramp',
    },
  ],
  spawn: {
    x: 130,
    y: 136,
    mode: 'skate',
  },
};
