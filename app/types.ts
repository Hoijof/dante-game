export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export interface Point {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  letter: string;
  size: number;
  color: string;
  spawnTime: number; // For auto-kill logic
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
  type?: 'NORMAL' | 'GOLD'; // Different visuals
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
  sessionGold: number;
  killCount: number;
  timeElapsed: number; // in seconds
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
