export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface Point {
  x: number;
  y: number;
}

export interface Enemy {
  id: string; // Add ID for easier removal
  x: number;
  y: number;
  letter: string;
  size: number;
  color: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  difficulty: number;
  baseHealth: number;
  baseMaxHealth: number;
  enemies: Enemy[];
  particles: Particle[];
  stars: Star[];
  dimensions: { width: number; height: number };
  fps: number;
}
