export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export interface Point {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  templateId: string;
  x: number;
  y: number;
  name: string;
  attackWord: string;
  chargeProgress: number;
  chargeTimer: number;
  chargeIntervalMs: number;
  size: number;
  color: string;
  spawnTime: number; // For auto-kill logic
  maxHealth: number;
  health: number;
  baseXp: number;
  baseGold: number;
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
  sessionXp: number;
  killCount: number;
  timeElapsed: number; // in seconds
  highScore: number;
  difficulty: number;
  baseHealth: number;
  baseMaxHealth: number;
  playerMana: number;
  playerMaxMana: number;
  enemies: Enemy[];
  particles: Particle[];
  stars: Star[];
  dimensions: { width: number; height: number };
  fps: number;
}
