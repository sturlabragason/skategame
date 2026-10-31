# Skategame - Architecture & Specification

## 1. Concept

Skategame is a side-view 2D 8-bit skateboarding platformer. It blends the foot-and-board exploration mechanics of NES *The Simpsons: Bart vs. the Space Mutants* with the trick scoring, ramp lines, rail grinds, and timed objective runs of *Tony Hawk's Pro Skater*.

Players skate through multi-tiered environments, dismount to traverse footpaths and ladders, and jump off ledges with mid-air Caveman remounts to drop directly into ramp lines or rail grinds. The game runs in two modes:
- **2:00 Session Mode**: Timed run with 5 classic objectives (High Score, Pro Score, S-K-A-T-E letters, specific rail grind, Secret Tape).
- **Free Skate Mode**: Untimed session with no clock or bail penalties.

---

## 2. Hard Technical Guardrails for Google AI Studio

When modifying this repository in Google AI Studio, follow these non-negotiable rules:

1. **Pure Side-View 2D Coordinate Space**: Use only horizontal (`x`) and vertical (`y`) axes. Never introduce isometric projection, depth layers, or 2.5D Z-coordinates.
2. **Fixed 320x180 Logical Resolution**: Keep the canvas back-buffer resolution strictly at 320x180 pixels. Scale to viewport via CSS with `image-rendering: pixelated` and `ctx.imageSmoothingEnabled = false`.
3. **Zero External Assets (Zero CDN, Image, or Audio URLs)**: Do not fetch remote sprites, audio files, or web fonts. Sandbox environments block external network requests. Draw sprites from palette-indexed matrix arrays (`src/data/sprites.ts`) and synthesize audio channels via the Web Audio API (`src/engine/audio.ts`).
4. **Decoupled Architecture**: Keep simulation state, physics loops, and collision logic isolated inside `src/engine/physics.ts` and `src/types.ts`. Keep `src/App.tsx` and React UI components purely presentation-focused (score displays, mode selects, timers).
5. **Deterministic State-Machine Physics**: Do not install external physics libraries (Matter.js, Box2D, Rapier). Use custom deterministic arcade physics (velocity integration, sweep collision, raycast ground snap, ramp curvature conversions).

---

## 3. Controls & Input Scheme

The input system supports both WASD and Arrow key layouts, with dual action-key bindings for keyboard ergonomics.

| Action | Primary Key | Secondary Key | Context Behavior |
| :--- | :--- | :--- | :--- |
| **Move / Steer / Climb** | `A` / `D` or `Left` / `Right` | `W` / `S` or `Up` / `Down` | Push and steer on board; walk left and right on foot; climb ladders (`W`/`S` or `Up`/`Down`). |
| **Ollie / Jump** | `Space` | - | Ollie off ground or ramp on board; jump on foot. |
| **Push / Flip Trick** | `J` | `Z` | Ground: Push board. Air: Directional flip tricks (`J` + Left/Right/Up/Down). |
| **Grab / Grind** | `K` | `X` | Air: Directional grabs (`K` + direction). Rail/Coping: Lock into grinds and slides. |
| **Mount / Dismount / Caveman** | `E` | `Shift` | Ground: Toggle board on or off. Air off-board: Caveman re-mount down onto board. |
| **Special Modifier** | `L` | `C` | Pressed with direction when Special meter is flashing gold to trigger signature specials. |

---

## 4. Skater Roster & Signature Specials

Each skater features unique base attributes and an exclusive signature special trick executed when the Special meter is maxed.

| Skater | Style | Speed | Air | Hangtime | Flip Speed | Rail Balance | Signature Special | Special Score |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| **Rune Glifberg** | Vert | 8/10 | 9/10 | 9/10 | 6/10 | 7/10 | **Christ Air** | 2,500 pts |
| **Tony Hawk** | Vert-Air | 9/10 | 10/10 | 9/10 | 7/10 | 6/10 | **The 900** | 3,000 pts |
| **Rodney Mullen** | Tech Street | 7/10 | 5/10 | 5/10 | 10/10 | 10/10 | **Darkslide** | 2,000 pts |
| **Steve Caballero** | Pool-All-Around | 8/10 | 8/10 | 8/10 | 8/10 | 8/10 | **Caballerial** | 2,200 pts |

### Special Trick Execution
- **Christ Air (Rune Glifberg)**: Hold `L` (or `C`) + `Right` in deep vert air. Extends board with one hand in full cross pose.
- **The 900 (Tony Hawk)**: Hold `L` (or `C`) + `Left` in deep vert air. Executes 2.5 full mid-air rotations (900 degrees).
- **Darkslide (Rodney Mullen)**: Hold `L` (or `C`) + `Down` when landing on a rail. Inverts board grip-tape down onto rail surface.
- **Caballerial (Steve Caballero)**: Hold `L` (or `C`) + `Up` on ramp takeoff. 360-degree rotation launched from fakie stance.

---

## 5. Core Simulation Mechanics

### Stance and Mode Machine
The player transitions between explicit states:
- `SKATING_GROUND`: Pushing, rolling, crouching, preparing ollie.
- `SKATING_AIR`: Airborne after ollie or ramp launch. Can execute flip tricks, grabs, rotations, and specials.
- `SKATING_GRIND`: Locked to rail geometry. Balance meter dictates deviation left or right; drifting past edges causes bails.
- `ON_FOOT_WALK`: Dismounted with board held under arm. Horizontal velocity capped at walking speed.
- `ON_FOOT_LADDER`: Off board, locked onto ladder X coordinate. Moves vertically with `Up`/`Down`.
- `CAVEMAN_FALL`: Dropping through air on foot; pressing Mount (`E`/`Shift`) snaps board underneath feet to land rolling or grinding.
- `BAILED`: Tumbling state triggered by imperfect landing angle or rail balance failure. Resets active combo score to zero.

### Ramp Physics & Curve Vector Conversion
- Quarter-pipes and half-pipes evaluate horizontal velocity vector on approach and convert forward kinetic energy into vertical lift:
  $$v_y = -|v_x| \cdot 1.1$$
- At ramp apex, facing direction flips 180 degrees (revert) so descent returns smoothly along the transition face.

### Combo Engine & Scoring
- **Formula**: `Total Combo Score = (Sum of Base Trick Values) * Multiplier`.
- Each unique trick, grind segment, or rotation adds base points and increments the multiplier by 1.
- **Caveman Combo Bridge**: Dismounting mid-combo initiates a 2.5-second run-out timer. If the skater climbs or runs to another ledge and Cavemans back onto a rail or ramp before the timer expires, the combo chain remains active.
