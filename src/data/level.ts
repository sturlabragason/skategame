import { LevelData } from '../types';

export const WAREHOUSE_LEVEL: LevelData = {
  name: 'Warehouse & Copenhagen Yard',
  width: 2400,
  height: 180,
  groundY: 156,
  platforms: [
    // Main ground floor spanning entire 2400px level
    {
      id: 'ground_main',
      x: 0,
      y: 156,
      width: 2400,
      height: 24,
      type: 'solid',
    },

    // Zone 1: Deep Vert Bowl Decks (x: 0 to 600)
    {
      id: 'vert_left_deck',
      x: 0,
      y: 70,
      width: 60,
      height: 86,
      type: 'solid',
    },
    {
      id: 'vert_spine_deck',
      x: 520,
      y: 70,
      width: 60,
      height: 86,
      type: 'solid',
    },

    // Zone 2: Warehouse Floor Obstacles (x: 600 to 1500)
    // Launch Funbox (Flat table top at y: 124)
    {
      id: 'funbox_table',
      x: 980,
      y: 124,
      width: 120,
      height: 32,
      type: 'solid',
    },

    // Upper Industrial Catwalk (Overhead beam for Caveman stunts, y: 52)
    {
      id: 'upper_catwalk',
      x: 1050,
      y: 52,
      width: 480,
      height: 6,
      type: 'one-way',
    },

    // Zone 3: Street Plaza (x: 1500 to 2400)
    // 4-Stair Set / Plaza Ledge
    {
      id: 'plaza_ledge_high',
      x: 1650,
      y: 120,
      width: 140,
      height: 36,
      type: 'solid',
    },
    {
      id: 'plaza_stair_step1',
      x: 1790,
      y: 130,
      width: 30,
      height: 26,
      type: 'solid',
    },
    {
      id: 'plaza_stair_step2',
      x: 1820,
      y: 140,
      width: 30,
      height: 16,
      type: 'solid',
    },
    {
      id: 'plaza_stair_step3',
      x: 1850,
      y: 148,
      width: 30,
      height: 8,
      type: 'solid',
    },

    // Street Planter Box
    {
      id: 'planter_box',
      x: 2020,
      y: 136,
      width: 80,
      height: 20,
      type: 'solid',
    },

    // Right Yard Roll-in Return Deck
    {
      id: 'right_return_deck',
      x: 2320,
      y: 70,
      width: 80,
      height: 86,
      type: 'solid',
    },
  ],

  ladders: [
    // Catwalk Access Ladder: runs from ground y:156 up to catwalk y:52
    {
      id: 'catwalk_ladder',
      x: 1100,
      y: 52,
      width: 14,
      height: 104,
    },
  ],

  rails: [
    // Vert Bowl Coping Rails
    {
      id: 'vert_coping_left',
      x1: 10,
      y1: 68,
      x2: 60,
      y2: 68,
    },
    {
      id: 'vert_coping_spine',
      x1: 520,
      y1: 68,
      x2: 580,
      y2: 68,
    },

    // Center Warehouse Flat Rail
    {
      id: 'warehouse_flat_rail',
      x1: 720,
      y1: 144,
      x2: 860,
      y2: 144,
    },

    // Funbox Kicker Rail
    {
      id: 'funbox_rail',
      x1: 990,
      y1: 120,
      x2: 1090,
      y2: 120,
    },

    // Street Plaza Down Handrail (Classic THPS Objective: Grind the Plaza Handrail!)
    {
      id: 'plaza_down_rail',
      x1: 1660,
      y1: 112,
      x2: 1870,
      y2: 146,
      isPlazaRail: true,
    },

    // Planter Edge Rail
    {
      id: 'planter_curb_rail',
      x1: 2020,
      y1: 134,
      x2: 2100,
      y2: 134,
    },
  ],

  slopes: [
    // Funbox Left Up-Slope
    {
      id: 'funbox_slope_up',
      x1: 910,
      y1: 156,
      x2: 980,
      y2: 124,
      kind: 'ramp',
    },
    // Funbox Right Down-Slope
    {
      id: 'funbox_slope_down',
      x1: 1100,
      y1: 124,
      x2: 1170,
      y2: 156,
      kind: 'ramp',
    },
    // Center Warehouse Kicker
    {
      id: 'center_kicker',
      x1: 1380,
      y1: 156,
      x2: 1450,
      y2: 132,
      kind: 'ramp',
    },
  ],

  quarterPipes: [
    // Vert Bowl Left Transition (faces right)
    {
      id: 'vert_qp_left',
      x: 60,
      y: 70,
      width: 100,
      height: 86,
      facing: 'right',
      radius: 86,
    },
    // Vert Bowl Right Transition (faces left)
    {
      id: 'vert_qp_right',
      x: 420,
      y: 70,
      width: 100,
      height: 86,
      facing: 'left',
      radius: 86,
    },
    // Far Right Wallride Return Transition (faces left)
    {
      id: 'right_wallride_qp',
      x: 2220,
      y: 70,
      width: 100,
      height: 86,
      facing: 'left',
      radius: 86,
    },
  ],

  collectibles: [
    // 5 Classic S-K-A-T-E Letters
    {
      id: 'letter_s',
      type: 'letter',
      letter: 'S',
      x: 100,
      y: 50, // High above vert left transition
      collected: false,
    },
    {
      id: 'letter_k',
      type: 'letter',
      letter: 'K',
      x: 1040,
      y: 95, // Above funbox launch
      collected: false,
    },
    {
      id: 'letter_a',
      type: 'letter',
      letter: 'A',
      x: 1760,
      y: 95, // Above street stairs handrail
      collected: false,
    },
    {
      id: 'letter_t',
      type: 'letter',
      letter: 'T',
      x: 1220,
      y: 35, // On the high industrial catwalk
      collected: false,
    },
    {
      id: 'letter_e',
      type: 'letter',
      letter: 'E',
      x: 2260,
      y: 50, // High above far right quarter pipe
      collected: false,
    },

    // Secret VHS Tape
    {
      id: 'secret_tape',
      type: 'tape',
      x: 1380,
      y: 32, // At the very end of the high catwalk
      collected: false,
    },
  ],

  spawn: {
    x: 640,
    y: 136,
    mode: 'skate',
  },
};
