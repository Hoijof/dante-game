import { EnemyTemplate } from '../types/combat';

export const ENEMIES: EnemyTemplate[] = [
  {
    id: 'slime',
    name: 'Syllable Slime',
    attackWord: 'slurp',
    syllables: ['slurp'],
    maxHealth: 16,
    color: '#60A5FA',
    baseXp: 6,
    chargeIntervalMs: 700
  },
  {
    id: 'goblin',
    name: 'Goblin Scribe',
    attackWord: 'stab',
    syllables: ['stab'],
    maxHealth: 20,
    color: '#34D399',
    baseXp: 8,
    chargeIntervalMs: 600
  },
  {
    id: 'bat',
    name: 'Echo Bat',
    attackWord: 'screech',
    syllables: ['screech'],
    maxHealth: 18,
    color: '#A78BFA',
    baseXp: 8,
    chargeIntervalMs: 550
  },
  {
    id: 'shade',
    name: 'Shadow Adept',
    attackWord: 'hex',
    syllables: ['hex'],
    maxHealth: 26,
    color: '#F472B6',
    baseXp: 12,
    chargeIntervalMs: 650
  },
  {
    id: 'knight',
    name: 'Rune Knight',
    attackWord: 'guard',
    syllables: ['guard'],
    maxHealth: 34,
    color: '#FACC15',
    baseXp: 16,
    chargeIntervalMs: 750
  },
  {
    id: 'mystic',
    name: 'Arcane Mystic',
    attackWord: 'chant',
    syllables: ['chant'],
    maxHealth: 28,
    color: '#22D3EE',
    baseXp: 15,
    chargeIntervalMs: 600
  },
  {
    id: 'wyvern',
    name: 'Sky Wyvern',
    attackWord: 'inferno',
    syllables: ['in', 'fer', 'no'],
    maxHealth: 45,
    color: '#FB7185',
    baseXp: 22,
    chargeIntervalMs: 800
  },
  {
    id: 'lich',
    name: 'Lich of Echoes',
    attackWord: 'cataclysm',
    syllables: ['cat', 'a', 'clysm'],
    maxHealth: 60,
    color: '#C084FC',
    baseXp: 30,
    chargeIntervalMs: 900
  }
];

export const ENEMIES_BY_ID = Object.fromEntries(
  ENEMIES.map(enemy => [enemy.id, enemy])
);

export const getEnemyTemplateById = (id: string) => ENEMIES_BY_ID[id];
