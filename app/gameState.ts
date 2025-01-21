export interface Enemy {
  x: number;
  y: number;
  letter: string;
}

export interface GameState {
  dimensions: { width: number; height: number };
  base: { x: number; y: number; health: number };
  enemies: Enemy[];
  score: number;
  difficulty: number;
  fps: number;
}

export const BASE_WIDTH = 50;
export const BASE_HEIGHT = 50;
export const BASE_HEALTH = 5;
export const ENEMY_SPEED = 0.25;
export const ENEMY_SPAWN_RATE = 4000;
export const MAX_DIFFICULTY = 20;
export const MIN_DIFFICULTY = 1;
export const SCORE_INCREMENT = 10;
export const FPS_UPDATE_INTERVAL = 1000;

export const initialGameState = (): GameState => ({
  dimensions: { width: window.innerWidth, height: window.innerHeight },
  base: { x: 50, y: window.innerHeight / 2, health: BASE_HEALTH },
  enemies: [],
  score: 0,
  difficulty: 1,
  fps: 0,
});
