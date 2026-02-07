export type AttackType = 'MELEE' | 'MAGIC';

export interface AttackWord {
  id: string;
  text: string;
  syllables: string[];
  damage: number;
  cooldownMs: number;
  type: AttackType;
  manaCost: number;
  unlockLevel: number;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  attackWord: string;
  syllables: string[];
  maxHealth: number;
  color: string;
  baseXp: number;
  chargeIntervalMs: number;
}
