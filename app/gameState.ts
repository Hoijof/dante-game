export interface Enemy {
  x: number;
  y: number;
  letter: string;
  size: number;
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
export const MIN_DIFFICULTY = 0;
export const SCORE_INCREMENT = 10;
export const FPS_UPDATE_INTERVAL = 1000;
export const ENEMY_SMALL_SIZE = 20;
export const ENEMY_LARGE_SIZE = 40;
export const EASY_LETTERS = ["Z", "X", "C", "V", "B", "N", "M"];
export const MEDIUM_LETTERS = [
  ...EASY_LETTERS,
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
];
export const HARD_LETTERS = [
  ...MEDIUM_LETTERS,
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
];

export const initialGameState = (): GameState => ({
  dimensions: { width: window.innerWidth, height: window.innerHeight },
  base: { x: 50, y: window.innerHeight / 2, health: BASE_HEALTH },
  enemies: [],
  score: 0,
  difficulty: 1,
  fps: 0,
});
