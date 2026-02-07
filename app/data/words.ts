import { AttackWord } from '../types/combat';

export const ATTACK_WORDS: AttackWord[] = [
  {
    id: 'jab',
    text: 'jab',
    syllables: ['jab'],
    damage: 6,
    cooldownMs: 600,
    type: 'MELEE',
    manaCost: 0,
    unlockLevel: 1
  },
  {
    id: 'kick',
    text: 'kick',
    syllables: ['kick'],
    damage: 8,
    cooldownMs: 800,
    type: 'MELEE',
    manaCost: 0,
    unlockLevel: 1
  },
  {
    id: 'push',
    text: 'push',
    syllables: ['push'],
    damage: 7,
    cooldownMs: 750,
    type: 'MELEE',
    manaCost: 0,
    unlockLevel: 1
  },
  {
    id: 'spark',
    text: 'spark',
    syllables: ['spark'],
    damage: 9,
    cooldownMs: 900,
    type: 'MAGIC',
    manaCost: 3,
    unlockLevel: 1
  },
  {
    id: 'slash',
    text: 'slash',
    syllables: ['slash'],
    damage: 12,
    cooldownMs: 1200,
    type: 'MELEE',
    manaCost: 0,
    unlockLevel: 2
  },
  {
    id: 'lunge',
    text: 'lunge',
    syllables: ['lunge'],
    damage: 13,
    cooldownMs: 1300,
    type: 'MELEE',
    manaCost: 0,
    unlockLevel: 2
  },
  {
    id: 'fireball',
    text: 'fireball',
    syllables: ['fire', 'ball'],
    damage: 18,
    cooldownMs: 1800,
    type: 'MAGIC',
    manaCost: 6,
    unlockLevel: 2
  },
  {
    id: 'icebolt',
    text: 'icebolt',
    syllables: ['ice', 'bolt'],
    damage: 16,
    cooldownMs: 1600,
    type: 'MAGIC',
    manaCost: 5,
    unlockLevel: 2
  },
  {
    id: 'cleave',
    text: 'cleave',
    syllables: ['cleave'],
    damage: 15,
    cooldownMs: 1500,
    type: 'MELEE',
    manaCost: 0,
    unlockLevel: 3
  },
  {
    id: 'barrier',
    text: 'barrier',
    syllables: ['bar', 'rier'],
    damage: 10,
    cooldownMs: 2000,
    type: 'MAGIC',
    manaCost: 7,
    unlockLevel: 3
  },
  {
    id: 'whirlwind',
    text: 'whirlwind',
    syllables: ['whirl', 'wind'],
    damage: 22,
    cooldownMs: 2400,
    type: 'MELEE',
    manaCost: 0,
    unlockLevel: 3
  },
  {
    id: 'thunderstrike',
    text: 'thunderstrike',
    syllables: ['thun', 'der', 'strike'],
    damage: 26,
    cooldownMs: 3200,
    type: 'MAGIC',
    manaCost: 10,
    unlockLevel: 4
  },
  {
    id: 'obliterate',
    text: 'obliterate',
    syllables: ['ob', 'lit', 'er', 'ate'],
    damage: 30,
    cooldownMs: 3600,
    type: 'MAGIC',
    manaCost: 12,
    unlockLevel: 4
  }
];

export const ATTACK_WORDS_BY_ID = Object.fromEntries(
  ATTACK_WORDS.map(word => [word.id, word])
);

export const getAttackWordById = (id: string) => ATTACK_WORDS_BY_ID[id];

export const formatWordWithSyllables = (word: AttackWord) => word.syllables.join('·');
