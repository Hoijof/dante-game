import { MapNode } from '../types/progress';
import { EASY_LETTERS, MEDIUM_LETTERS, HARD_LETTERS } from '../constants';

// Helper to expand letter sets gradually
const TUTORIAL_LETTERS = ['A', 'S'];
const EASY_1 = ['A', 'S', 'D', 'F'];
const EASY_2 = ['A', 'S', 'D', 'F', 'G', 'H'];
const MEDIUM_1 = [...MEDIUM_LETTERS.slice(0, 10)]; // Subset
const MEDIUM_2 = MEDIUM_LETTERS;
const HARD_1 = [...MEDIUM_LETTERS, 'Q', 'W', 'E', 'R'];
const HARD_2 = HARD_LETTERS;
const SYLLABLES_1 = ['CA', 'CE', 'CI', 'CO', 'CU', 'TA', 'TE', 'TI', 'TO', 'TU'];
const SYLLABLES_2 = [...SYLLABLES_1, 'PA', 'PE', 'PI', 'PO', 'PU', 'LA', 'LE', 'LI', 'LO', 'LU'];
const SYLLABLES_3 = [...SYLLABLES_2, 'MA', 'ME', 'MI', 'MO', 'MU', 'SA', 'SE', 'SI', 'SO', 'SU'];

export const GAME_LEVELS: MapNode[] = [
    {
        id: 'level-1',
        name: 'Tutorial 📚',
        description: 'Learn to type! Destroy the letters A and S.',
        difficulty: 0.5,
        letters: TUTORIAL_LETTERS,
        winCondition: { type: 'KILL_COUNT', value: 5 },
        rewardGold: 50,
        nextLevels: ['town'],
        position: { x: 50, y: 300 }
    },
    {
        id: 'town',
        name: 'Town 🏠',
        description: 'Safe haven. Buy upgrades here.',
        difficulty: 0,
        letters: [],
        winCondition: { type: 'SURVIVE_TIME', value: 0 },
        rewardGold: 0,
        nextLevels: ['level-2a', 'level-2b'],
        isTown: true,
        position: { x: 150, y: 300 }
    },

    // Path A: Forest (Slower pace)
    {
        id: 'level-2a',
        name: 'Forest Edge 🌲',
        description: 'A gentle walk.',
        difficulty: 1.0,
        letters: EASY_1,
        winCondition: { type: 'KILL_COUNT', value: 10 },
        rewardGold: 60,
        nextLevels: ['level-3a'],
        position: { x: 300, y: 200 }
    },
    {
        id: 'level-3a',
        name: 'Deep Woods 🌳',
        description: 'More letters appear.',
        difficulty: 1.5,
        letters: EASY_2,
        winCondition: { type: 'KILL_COUNT', value: 15 },
        rewardGold: 80,
        nextLevels: ['level-4a'],
        position: { x: 450, y: 150 }
    },
    {
        id: 'level-4a',
        name: 'Elf Grove 🍃',
        description: 'They move faster!',
        difficulty: 2.0,
        letters: MEDIUM_1,
        winCondition: { type: 'KILL_COUNT', value: 18 },
        rewardGold: 100,
        nextLevels: ['level-5'],
        position: { x: 600, y: 150 }
    },

    // Path B: Cave (Faster pace, different letters)
    {
        id: 'level-2b',
        name: 'Cave Entrance 🕳️',
        description: 'It is dark inside.',
        difficulty: 1.2,
        letters: ['Z', 'X', 'C', 'V'],
        winCondition: { type: 'KILL_COUNT', value: 10 },
        rewardGold: 70,
        nextLevels: ['level-3b'],
        position: { x: 300, y: 400 }
    },
    {
        id: 'level-3b',
        name: 'Bat Cave 🦇',
        description: 'Beware of bats!',
        difficulty: 1.8,
        letters: ['Z', 'X', 'C', 'V', 'B', 'N'],
        winCondition: { type: 'KILL_COUNT', value: 20 },
        rewardGold: 90,
        nextLevels: ['level-4b'],
        position: { x: 450, y: 450 }
    },
    {
        id: 'level-4b',
        name: 'Crystal Mine 💎',
        description: 'Shiny but dangerous.',
        difficulty: 2.2,
        letters: MEDIUM_1,
        winCondition: { type: 'KILL_COUNT', value: 22 },
        rewardGold: 110,
        nextLevels: ['level-5'],
        position: { x: 600, y: 450 }
    },

    // Convergence
    {
        id: 'level-5',
        name: 'Castle Gates 🏰',
        description: 'The final challenge begins.',
        difficulty: 3.0,
        letters: MEDIUM_2,
        winCondition: { type: 'KILL_COUNT', value: 30 },
        rewardGold: 150,
        nextLevels: ['level-6'],
        position: { x: 750, y: 300 }
    },
    {
        id: 'level-6',
        name: 'Throne Room 👑',
        description: 'Defeat the Boss!',
        difficulty: 4.0,
        letters: HARD_1,
        winCondition: { type: 'KILL_COUNT', value: 40 },
        rewardGold: 300,
        nextLevels: ['world-2-1'],
        position: { x: 900, y: 300 }
    },

    // World 2: Syllable Realm
    {
        id: 'world-2-1',
        name: 'Syllable Shore 🌊',
        description: 'Two-letter syllables arrive.',
        difficulty: 4.4,
        letters: SYLLABLES_1,
        winCondition: { type: 'KILL_COUNT', value: 25 },
        rewardGold: 220,
        nextLevels: ['world-2-2'],
        position: { x: 1050, y: 240 }
    },
    {
        id: 'world-2-2',
        name: 'Echo Lagoon 🔮',
        description: 'Chain the syllables.',
        difficulty: 4.9,
        letters: SYLLABLES_2,
        winCondition: { type: 'KILL_COUNT', value: 30 },
        rewardGold: 260,
        nextLevels: ['world-2-3'],
        position: { x: 1200, y: 200 }
    },
    {
        id: 'world-2-3',
        name: 'Temple of Sounds 🏛️',
        description: 'Master the rhythm.',
        difficulty: 5.5,
        letters: SYLLABLES_3,
        winCondition: { type: 'KILL_COUNT', value: 38 },
        rewardGold: 320,
        nextLevels: [],
        position: { x: 1350, y: 180 }
    }
];
