# AI Iteration Guide

This guide is designed to help AI agents understand and iterate on the Type Defense codebase.

## Codebase Overview

*   **Logic**: The brains are in `app/hooks/useGameEngine.ts`. This is where `update()`, `draw()`, and `spawnEnemy()` live.
*   **Configuration**: All tuning knobs are in `app/constants.ts`. Change speeds, spawn rates, and difficulty scaling here.
*   **Types**: `app/types.ts` defines the shape of the state.

## Common Tasks

### 1. Adjusting Difficulty
Modify `app/constants.ts`:
*   `ENEMY_SPEED_BASE`: Base speed of enemies.
*   `ENEMY_SPAWN_RATE_BASE`: Milliseconds between spawns.
*   `MAX_DIFFICULTY`: Cap for difficulty scaling.

In `useGameEngine.ts`, check the `spawnEnemy` function to see how difficulty affects letter sets (Easy/Medium/Hard).

### 2. Adding New Enemies
1.  Define a new type in `app/types.ts` if needed (e.g., `EnemyType` enum).
2.  Update `spawnEnemy` in `useGameEngine.ts` to randomly select the new type.
3.  Update `draw` in `useGameEngine.ts` to render the new type differently.
4.  Update `update` in `useGameEngine.ts` if the new type has unique movement logic.

### 3. Changing Visuals
*   **Colors**: Enemy colors are assigned in `spawnEnemy`.
*   **Shapes**: Rendering logic is in the `draw` function in `useGameEngine.ts`.
*   **Particles**: `createExplosion` controls the look of death effects.

### 4. Audio
*   Add new sounds to `public/` folder.
*   Register them in `app/hooks/useAudio.ts`.
*   Call `playSound('newName')` in `useGameEngine.ts`.

## Constraints & Patterns

*   **Performance**: Do not put complex logic or state updates that trigger React renders inside the `loop` or `update` functions. Use `gameStateRef` for high-frequency updates.
*   **Canvas**: Keep drawing logic efficient.
*   **React**: Only use `setUiState` for things the user needs to read (Score, Game Over screen).

## Testing
Currently, manual testing is the primary method due to the visual/real-time nature of the game.
*   Run `npm run dev` and play.
*   Check the console for errors.
