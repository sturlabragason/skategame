# Skategame — Architecture, Implementation Status & Next Steps

This document provides a comprehensive overview of the current implementation status, physics architecture, trick execution engine, and future expansion milestones for **Skategame: 8-Bit Pro Skater**.

---

## 1. Implementation Status & Phase Matrix

| Phase | Description | Status | Key Deliverables |
| :--- | :--- | :---: | :--- |
| **Phase 1** | Core Loop & Web Migration | ✅ Complete | Node.js 22 runtime, Vite configuration, deterministic 60 FPS physics loop, mount/dismount ladder mechanics. |
| **Phase 2** | Ramps, Quarter-Pipes & Rail Grinding | ✅ Complete | Curved quarter-pipe vert transitions, parabolic upward launch (`vy = -|vx| * 1.22`), apex 180° revert, rail snapping, dynamic balance drift gauge (`grindBalance`), yellow/white pixel grind sparks. |
| **Phase 3** | Tricks, Combos, Bails & Specials | ✅ Complete | Directional flip tricks (Kickflip, Heelflip, Pop Shove-it), directional grabs (Indy, Melon, Nosegrab, Tailgrab), 180°–900° air rotations, 5 skater signature specials (100% SP gauge), 2.5s Caveman combo bridge, bail tumble with dizzy stars. |
| **Phase 4** | 2400px Multi-Zone Level & THPS Goals | ✅ Complete | 2400px level (Deep Vert Bowl, Warehouse Funbox & Catwalk, Street Plaza with 4-stair set and down handrail), 5 classic THPS session objectives (High Score, Pro Score, S-K-A-T-E letters, Plaza Handrail grind, Secret VHS Tape), session summary modal. |
| **Phase 5** | Bart Simpson NES Sprites & Chiptune Audio | ✅ Complete | Authentic 16x24 NES pixel art sprites (*Bart vs. the Space Mutants* style: spiky hair, orange tee, blue shorts, board under arm), Web Audio API chiptune synthesizer (rolling noise, ollie pop, metallic grind hiss, flip whoosh, special fanfare, bail crash, objective chime), 8-bit skate-punk music engine with mute toggle. |

---

## 2. Controls & Trick Execution Guide

### Primary & Secondary Inputs
- **Steer / Walk / Climb**: `A` / `D` or `ArrowLeft` / `ArrowRight` (Walk & Steer); `W` / `S` or `ArrowUp` / `ArrowDown` (Climb ladders).
- **Ollie / Jump**: `Space` (Hold to charge crouch, release to pop; tap for quick ollie; jump on foot; pop out of grinds).
- **Push / Flip Tricks**: `J` or `Z`
  - On ground: Push kick (burst speed).
  - In air: Neutral / Left / Right + `J` → **Kickflip** (100 pts)
  - In air: Up + `J` → **Heelflip** (120 pts)
  - In air: Down + `J` → **Pop Shove-it** (150 pts)
- **Rail Grind / Air Grabs**: `K` or `X`
  - Near rail: Snap to rail into **50-50** (neutral) or **Boardslide** (holding Left/Right). Counter-steer with `A`/`D` to maintain balance within $[-1.0, 1.0]$.
  - In air: Right + `K` → **Indy Grab** (250 pts)
  - In air: Left + `K` → **Melon Grab** (250 pts)
  - In air: Up + `K` → **Nosegrab** (200 pts)
  - In air: Down + `K` → **Tailgrab** (200 pts)
- **Mount / Dismount / Caveman**: `E` or `Shift`
  - On ground: Toggle between skateboarding and walking on foot with board under arm.
  - In air off-board: **Mid-Air Caveman** remounts board under feet with a 20-frame invulnerability window and bridges combos across platforms.
- **Signature Specials**: `L` or `C` (when Special meter is 100%):
  - **Bart Simpson**: Hold `L` + `Up` → **★ Space Mutant Hop** (2,500 pts)
  - **Tony Hawk**: Hold `L` + `Left` in deep vert air → **★ The 900** (3,000 pts)
  - **Rune Glifberg**: Hold `L` + `Right` in deep vert air → **★ Christ Air** (2,500 pts)
  - **Rodney Mullen**: Hold `L` + `Down` onto rail → **★ Darkslide** (2,000 pts)
  - **Steve Caballero**: Hold `L` + `Up` off ramp launch → **★ Caballerial** (2,200 pts)
- **Audio Toggle**: `M` key (or on-screen sound button).

---

## 3. Architecture & File Structure

```
├── SPEC.md                    # Core specifications and hard technical constraints
├── AI_STUDIO_PROMPTS.md       # Implementation phase prompts
├── NEXT_STEPS.md              # Roadmap and next steps documentation
├── index.html                 # HTML shell with NES retro font styling and metadata
├── package.json               # NPM scripts, dependencies, build targets
├── src/
│   ├── App.tsx                # NES Cartridge shell, HUD, mode selector, touch gamepad
│   ├── data/
│   │   ├── palette.ts         # Authentic 2C02 NES color palette constants
│   │   ├── skaters.ts         # Skater profiles (Bart Simpson, Tony Hawk, Rune, Rodney, Cab)
│   │   ├── level.ts           # 2400px multi-zone level geometry, quarter-pipes, rails, items
│   │   └── sprites.ts         # 16x24 NES pixel art sprite matrices & particle emitters
│   ├── engine/
│   │   ├── audio.ts           # Web Audio API 8-bit sound effects & punk chiptune music
│   │   ├── physics.ts         # Deterministic physics, vert ramps, grinds, combos, bails
│   │   ├── renderer.ts        # 320x180 pixelated canvas renderer, parallax warehouse, HUD
│   │   └── GameCanvas.tsx     # Canvas lifecycle, 60 FPS fixed loop, keyboard/touch input
│   └── types.ts               # Complete TypeScript types and interfaces
```

---

## 4. Next Steps & Future Milestones

### Milestone 6: Multi-Level Expansion
1. **Level 2: Downtown San Francisco Hill Bomb**:
   - Steep downhill topography with cable car tracks, moving trolley obstacles, and steep street launch ramps.
2. **Level 3: Springfield Elementary School**:
   - Hallway lockers, cafeteria table benches, flagpole vert climb, and Principal Skinner avoidance hazards.
3. **Level 4: Burnside Skatepark (Under Bridge)**:
   - Concrete bowl transitions, wallrides, pillar obstacles, and graffiti tag challenges.

### Milestone 7: Career Mode & Persistent Progress
1. **Local Storage Persistence**:
   - Save high scores, best combo records, and unlocked skater stat points across browser sessions.
2. **Stat Point Upgrades**:
   - Collect hidden stat icons floating in each level to upgrade Speed, Ollie, Air, Flip Speed, and Grind Balance.
3. **Cash / Shop System**:
   - Earn dollar bills by completing objectives to purchase vintage skateboard deck graphics and wheel colors.

### Milestone 8: Create-A-Skater & Park Editor
1. **Custom Skater Pixel Art Editor**:
   - Select shirt color, hat style, deck graphic, and assign custom special trick combinations.
2. **8-Bit Tile-Based Park Editor**:
   - Grid-based placement of quarter pipes, flat rails, ramps, ladders, and collectible letters using NES sprite tiles.
   - Export and import custom level strings via JSON or URL hash.

### Milestone 9: Instant Replay & Ghost Run
1. **Frame-Buffer Replay Engine**:
   - Store circular buffer of player state frames (last 10 seconds of high-scoring combos).
   - Instant slow-motion replay with retro VHS scanlines and rewind controls on high scores or epic bails.
2. **Ghost Skater**:
   - Overlay translucent pixel ghost of the player's best run to race against previous high scores in Session mode.
