import { MapNode } from '../types/progress';

export const GAME_LEVELS: MapNode[] = [
  {
    id: 'level-1',
    name: 'Scribe Training 📜',
    description: 'Learn the first syllable strikes against gentle foes.',
    difficulty: 0.6,
    enemyIds: ['slime', 'goblin'],
    winCondition: { type: 'KILL_COUNT', value: 6 },
    rewardGold: 50,
    nextLevels: ['town'],
    position: { x: 50, y: 300 }
  },
  {
    id: 'town',
    name: 'Town 🏠',
    description: 'Equip spells, boost your mana, and plan your next quest.',
    difficulty: 0,
    enemyIds: [],
    winCondition: { type: 'SURVIVE_TIME', value: 0 },
    rewardGold: 0,
    nextLevels: ['level-2a', 'level-2b'],
    isTown: true,
    position: { x: 150, y: 300 }
  },
  {
    id: 'level-2a',
    name: 'Whisper Woods 🌲',
    description: 'Short words still work, but enemies charge faster.',
    difficulty: 1.0,
    enemyIds: ['slime', 'goblin', 'bat'],
    winCondition: { type: 'KILL_COUNT', value: 12 },
    rewardGold: 70,
    nextLevels: ['level-3a'],
    position: { x: 300, y: 200 }
  },
  {
    id: 'level-3a',
    name: 'Echo Glade ✨',
    description: 'Mid-length spells unlock here.',
    difficulty: 1.4,
    enemyIds: ['bat', 'shade'],
    winCondition: { type: 'KILL_COUNT', value: 16 },
    rewardGold: 90,
    nextLevels: ['level-4a'],
    position: { x: 450, y: 150 }
  },
  {
    id: 'level-4a',
    name: 'Arcane Ruins 🏛️',
    description: 'Keep your mana ready for the mystics.',
    difficulty: 1.8,
    enemyIds: ['shade', 'mystic'],
    winCondition: { type: 'KILL_COUNT', value: 20 },
    rewardGold: 120,
    nextLevels: ['level-5'],
    position: { x: 600, y: 150 }
  },
  {
    id: 'level-2b',
    name: 'Crystal Caves 💎',
    description: 'Tighter corridors, stronger foes.',
    difficulty: 1.2,
    enemyIds: ['goblin', 'knight'],
    winCondition: { type: 'KILL_COUNT', value: 12 },
    rewardGold: 80,
    nextLevels: ['level-3b'],
    position: { x: 300, y: 400 }
  },
  {
    id: 'level-3b',
    name: 'Rune Halls 🗡️',
    description: 'Enemy charges grow longer. Time your strikes.',
    difficulty: 1.7,
    enemyIds: ['knight', 'mystic'],
    winCondition: { type: 'KILL_COUNT', value: 18 },
    rewardGold: 110,
    nextLevels: ['level-4b'],
    position: { x: 450, y: 450 }
  },
  {
    id: 'level-4b',
    name: 'Skyward Gate 🌌',
    description: 'The wyvern arrives. Longer words hit harder.',
    difficulty: 2.1,
    enemyIds: ['mystic', 'wyvern'],
    winCondition: { type: 'KILL_COUNT', value: 22 },
    rewardGold: 140,
    nextLevels: ['level-5'],
    position: { x: 600, y: 450 }
  },
  {
    id: 'level-5',
    name: 'Citadel Approach 🏰',
    description: 'Enemies attack in disciplined rhythms.',
    difficulty: 2.6,
    enemyIds: ['knight', 'mystic', 'wyvern'],
    winCondition: { type: 'KILL_COUNT', value: 28 },
    rewardGold: 180,
    nextLevels: ['level-6'],
    position: { x: 750, y: 300 }
  },
  {
    id: 'level-6',
    name: 'Hall of the Lich 👑',
    description: 'Face the master of syllables.',
    difficulty: 3.2,
    enemyIds: ['wyvern', 'lich'],
    winCondition: { type: 'KILL_COUNT', value: 32 },
    rewardGold: 260,
    nextLevels: [],
    position: { x: 900, y: 300 }
  }
];
