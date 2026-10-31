# Google AI Studio Workflow & Implementation Prompts

## Quick Start: Import and Sync Workflow

Follow these 5 steps to iterate on the game inside Google AI Studio:

1. **Verify Git Remote**: Ensure your local repository is pushed to a remote GitHub repository.
2. **Open Google AI Studio**: Go to [aistudio.google.com](https://aistudio.google.com/) and navigate to the **Build** workspace (code and preview environment).
3. **Import Repository**: Click the `+` button in the project explorer and select **Import from GitHub**, then pick your `skategame` repository.
4. **Execute Phase Prompts**: Copy and paste each prompt below into the AI Studio prompt input in sequential order (Phase 2 through Phase 5). Verify gameplay in the live interactive canvas preview after each phase finishes generating.
5. **Sync Code Back**: Export the updated files or pull the commits back to your local repository branch.

---

## Phase 2 Prompt: Ramps, Quarter-Pipes & Rail Grinding

Copy the prompt block below into Google AI Studio Build mode:

```markdown
Implement Phase 2 for Skategame: Ramps, Quarter-Pipes, and Rail Grinding.

Strict Architectural Constraints:
- Keep the pure side-view 2D coordinate space (X/Y only).
- Keep the logical resolution at 320x180 pixels with imageSmoothingEnabled = false.
- Do not add external physics libraries or external assets. Update src/engine/physics.ts, src/types.ts, src/data/level.ts, and src/engine/renderer.ts.

Requirements:
1. Type Definitions (src/types.ts):
   - Add 'Slope' interface: { x1: number, y1: number, x2: number, y2: number, angle: number }.
   - Add 'QuarterPipe' interface: { x: number, y: number, width: number, height: number, facing: 'left' | 'right', radius: number }.
   - Add 'Rail' interface: { id: string, x1: number, y1: number, x2: number, y2: number, height: number }.
   - Extend SkaterState with 'GRINDING' mode, currentGrindType ('50-50' | 'Boardslide'), and grindBalance (-1.0 to 1.0).

2. Level Data (src/data/level.ts):
   - Add two quarter-pipes (one left-facing, one right-facing) to provide vert transitions.
   - Add angled launch slopes and an elevated rail (x1: 420, y1: 130, x2: 560, y2: 130).

3. Physics Engine (src/engine/physics.ts):
   - Slopes: Calculate slope angle; adjust velocity vector along the surface tangent with gravity deceleration uphill and acceleration downhill.
   - Quarter-Pipes: Detect entry on ramp curvature. Convert horizontal speed into vertical upward air launch: vy = -abs(vx) * 1.15. At the vertical apex, execute a 180-degree revert (flip facing direction) and snap descent back to the curved transition.
   - Rails and Coping: Detect collision when skater is airborne over a rail and presses Grab/Grind (K or X). Snap skater y-position to rail height and enter GRINDING state.
   - Grind Balance: While grinding, apply an oscillating drift to grindBalance that increases over time. Steer Left (A/Left) or Right (D/Right) to counter-balance. If grindBalance exceeds 1.0 or drops below -1.0, transition immediately to BAILED state. Jump (Space) exits the grind cleanly with an ollie pop.

4. Renderer & HUD (src/engine/renderer.ts):
   - Render quarter-pipe curved transition profiles and rail coping using the NES palette.
   - Emit bright yellow/white pixel grind sparks at the contact point between board trucks and rail during grinds.
   - Draw a minimal balance gauge above the skater during grinds with a center indicator tick and balance needle.
```

---

## Phase 3 Prompt: Tricks, Combos, Bails & Special Meter

Copy the prompt block below into Google AI Studio Build mode:

```markdown
Implement Phase 3 for Skategame: Tricks, Combos, Bails, and Special Meter.

Strict Architectural Constraints:
- Keep the pure side-view 2D coordinate space (X/Y only).
- Keep logical resolution at 320x180 pixels.
- Do not import external physics libraries or external assets. Update src/types.ts, src/engine/physics.ts, and src/engine/renderer.ts.

Requirements:
1. Trick System & Controls:
   - Directional Flip Tricks (Push/Flip key: J or Z in air):
     - Left or Right + J: Kickflip (100 pts)
     - Up + J: Heelflip (120 pts)
     - Down + J: Pop Shove-it (150 pts)
   - Directional Air Grabs (Grab/Grind key: K or X in air):
     - Right + K: Indy Grab (250 pts)
     - Left + K: Melon Grab (250 pts)
     - Up + K: Nosegrab (200 pts)
     - Down + K: Tailgrab (200 pts)
   - Rotations: Track 180, 360, 540, 720, and 900-degree air spins based on rotation keys held during flight.

2. Skater Signature Specials (Active when Special meter is 100):
   - Rune Glifberg: Christ Air (Hold Special L/C + Right in vert air, 2,500 pts).
   - Tony Hawk: The 900 (Hold Special L/C + Left in deep vert air, 3,000 pts).
   - Rodney Mullen: Darkslide (Hold Special L/C + Down onto a rail, 2,000 pts).
   - Steve Caballero: Caballerial (Hold Special L/C + Up off ramp launch, 2,200 pts).

3. Combo Engine & Caveman Bridge:
   - Track active combo: List of performed tricks, cumulative base points, and trick multiplier.
   - Multiplier increments with each distinct trick, grind, or rotation.
   - Successful landing on ground banks the points into total score: Total = (Sum of Base Points) * Multiplier.
   - Caveman Combo Extension: Pressing Dismount (E or Shift) while rolling starts a 2.5-second countdown timer. If the skater runs, climbs, jumps off a ledge, and lands back on board (Caveman) onto a rail or ramp before the timer hits 0, the combo continues unbroken.

4. Bail Mechanics:
   - Enter BAILED state if the skater touches ground or transition mid-flip, lands with board rotation angled beyond 30 degrees from surface normal, or loses grind balance.
   - Bailing wipes out the unbanked combo score to 0 and drops the Special meter to 0.

5. Renderer & HUD (src/engine/renderer.ts):
   - Render floating pixel text showing trick names as they are executed.
   - Render combo HUD at bottom center: "TRICK LIST ... TOTAL x MULTIPLIER".
   - Render Special meter gauge at top left: fills with yellow; flashes gold when full.
   - Render the 2.5-second Caveman countdown bar when running on foot mid-combo.
```

---

## Phase 4 Prompt: Full 1-Level Warehouse & Copenhagen Yard + THPS Goals

Copy the prompt block below into Google AI Studio Build mode:

```markdown
Implement Phase 4 for Skategame: Full 1-Level Environment and THPS Goal System.

Strict Architectural Constraints:
- Keep the pure side-view 2D coordinate space (X/Y only).
- Keep logical resolution at 320x180 pixels.
- Do not import external assets. Update src/data/level.ts, src/types.ts, src/App.tsx, and src/engine/renderer.ts.

Requirements:
1. Environment Design (src/data/level.ts):
   - Expand level width to 2400 pixels across three interconnected zones and an upper tier:
     - Left Zone (Deep Vert Bowl): Large U-shaped halfpipe bowl with steep transitions and top coping rails, tuned for vert airs and 900 attempts.
     - Center Zone (Warehouse Floor): Roll-in ramp, launch funbox with flat top and angled sides, center kicker, and flat practice rails.
     - Right Zone (Street Plaza): 4-stair set with down rail, street planters, curb ledges, and wallride-ready quarter-pipe return.
     - Upper Tier (Rooftop Catwalks): Overhead steel beams, hanging platforms, and high ledges accessible only on foot via ladders, offering high drop-ins for Caveman stunts.

2. Game Modes (src/types.ts and src/App.tsx):
   - 2:00 Session Mode: 2-minute timed run with objective tracking.
   - Free Skate Mode: Untimed exploration with no clock or bail penalties.

3. 5 Classic THPS Goals for Session Mode:
   - High Score: Reach 15,000 points.
   - Pro Score: Reach 50,000 points.
   - Collect S-K-A-T-E: 5 floating golden letters placed across key spots (Vert coping, Funbox apex, Street handrail, High catwalk beam, Street plaza stairs).
   - Grind the Plaza Handrail: Complete an uninterrupted grind across the entire street down rail.
   - Grab the Secret Tape: Reach the highest catwalk beam via foot platforming and jump across to snag the floating cassette tape.

4. Character Select Screen:
   - Add a retro arcade character selection screen before starting a run.
   - Display all 4 skaters (Rune Glifberg, Tony Hawk, Rodney Mullen, Steve Caballero) with sprite portraits, stat ratings (Speed, Air, Hangtime, Flip Speed, Rail Balance), and signature special trick details.
   - Allow cycling skaters with Left/Right keys and selecting with Space/Enter.

5. Session End Summary:
   - On timer expiration, halt simulation and display session summary card: Total Score, Goals Completed (checked off), and High Score record.
```

---

## Phase 5 Prompt: Authentic 8-Bit NES Pixel Sprites & Web Audio Chiptune

Copy the prompt block below into Google AI Studio Build mode:

```markdown
Implement Phase 5 for Skategame: Authentic 8-Bit NES Pixel Sprites and Web Audio Chiptune.

Strict Architectural Constraints:
- Do not load external image or audio URLs. All assets must be programmatically defined and synthesized.
- Keep logical canvas at 320x180 with pixelated rendering.
- Create src/data/sprites.ts and src/engine/audio.ts, integrating them into renderer.ts, physics.ts, and App.tsx.

Requirements:
1. Sprite System (src/data/sprites.ts):
   - Build 2D pixel matrix arrays using 4-color NES palette indexes (0: transparent, 1: outline, 2: skin/highlight, 3: primary clothing/deck, 4: accent/wheels):
     - Skate rolling cycle (3 frames)
     - Crouch / windup frame
     - Ollie / airborne frame
     - Flip trick rotation sequence (4 frames)
     - Air grab poses (Indy, Melon, Nosegrab, Tailgrab)
     - Signature Special poses: Rune Glifberg Christ Air (cross pose), Tony Hawk 900 spin, Rodney Mullen Darkslide (inverted board on rail), Steve Caballero Caballerial
     - Rail grind poses: 50-50 and Boardslide
     - On-foot walking cycle (4 frames with board tucked under arm)
     - Ladder climb cycle (2 frames)
     - Bail sliding/tumble frame
   - Level scenery pixel art:
     - Repeating brick warehouse background tiles with graffiti tags
     - Structural steel trusses and industrial windows
     - Concrete ramp coping and curb textures

2. Web Audio Sound Engine (src/engine/audio.ts):
   - Synthesize sound effects using Web Audio API nodes (OscillatorNode, BiquadFilterNode, AudioBufferSourceNode with noise buffers):
     - Wheel Rolling: Loop of low-pass filtered brown noise with playback frequency tracking horizontal velocity.
     - Ollie Pop: Quick square wave frequency sweep down (160 Hz to 40 Hz).
     - Rail Grind: Metallic hiss using bandpass-filtered white noise with slight resonance.
     - Flip Trick: Quick triangle wave whoosh sweep.
     - Grab Tweak: Short mid-tone pulse blip.
     - Special Fanfare: Arpeggiated 8-bit triad chime on special activation.
     - Bail Crash: Low triangle thump combined with burst of noise.
     - Objective Chime: Bright high two-tone chime when collecting S-K-A-T-E letters or Secret Tape.

3. 8-Bit Skate-Punk Music Track:
   - Program a fast, driving 8-bit skate-punk musical loop using Web Audio scheduling:
     - Channel 1 (Pulse wave): Melodic punk lead riff.
     - Channel 2 (Triangle wave): Fast walking punk bassline.
     - Channel 3 (White noise): Snare hits and hi-hats.
   - Include a global audio toggle button in the HUD (M key or click) to mute or play music and sound effects.
```
