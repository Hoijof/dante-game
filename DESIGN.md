# Design Document - Type Defense

## Architecture

Type Defense is a typing game built with Next.js and HTML5 Canvas. It uses a custom React hook-based architecture to manage the game loop and state, keeping the React rendering cycle separate from the high-performance game loop.

### Core Components

1.  **`app/page.tsx`**: The main entry point. It handles the UI layout, rendering the Canvas and the React-based UI overlays (HUD, Menus).
2.  **`app/hooks/useGameEngine.ts`**: The core game logic.
    *   **Game Loop**: Uses `requestAnimationFrame` to drive the `update` and `draw` cycles.
    *   **State Management**: Uses `useRef` for mutable game state (positions, particles, enemies) to avoid React re-renders on every frame. Uses `useState` (`uiState`) only for low-frequency UI updates (Score, Game Over).
    *   **Input Handling**: Manages keyboard listeners.
3.  **`app/hooks/useAudio.ts`**: Manages the Web Audio API context, loading sounds, playing BGM, and handling volume/mute states.

### State Management

*   **`GameState` (Ref)**: Contains high-frequency data:
    *   `enemies`: Array of active enemies.
    *   `particles`: Array of active visual particles.
    *   `stars`: Array of background stars.
    *   `dimensions`: Canvas size.
*   **`UIState` (State)**: Contains low-frequency data for the UI:
    *   `score`, `highScore`, `difficulty`.
    *   `status` (IDLE, PLAYING, PAUSED, GAME_OVER).

### Rendering

The game uses the Canvas 2D API for all game entities.
*   **Performance**: The `draw` function clears and redraws the entire canvas every frame.
*   **Optimization**: Entities are simple geometric shapes to maintain high FPS.

### File Structure

*   `app/`
    *   `hooks/`: Custom hooks (`useGameEngine`, `useAudio`).
    *   `types.ts`: TypeScript definitions for game entities.
    *   `constants.ts`: Game configuration (speeds, sizes, difficulty).
    *   `castleSvg.ts`: SVG asset for the base.
    *   `page.tsx`: Main UI component.

## Future Improvements

*   **Enemy Types**: Add different enemy behaviors (sine wave movement, fast/slow).
*   **Power-ups**: Typing special words to clear screen or heal.
*   **Leaderboard**: Online leaderboard backend.
