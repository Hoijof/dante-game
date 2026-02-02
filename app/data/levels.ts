import { MapNode } from '../types/progress';
import { EASY_LETTERS, MEDIUM_LETTERS, HARD_LETTERS } from '../constants';

export const GAME_LEVELS: MapNode[] = [
    {
        id: 'level-1',
        name: 'Tutorial 📚',
        description: 'Learn to type! Destroy the letters A and S.',
        difficulty: 1,
        letters: ['A', 'S'],
        winCondition: { type: 'KILL_COUNT', value: 5 },
        rewardGold: 50,
        nextLevels: ['town'],
        position: { x: 100, y: 300 }
    },
    {
        id: 'town',
        name: 'Town 🏠',
        description: 'Safe haven. Buy upgrades here.',
        difficulty: 0,
        letters: [],
        winCondition: { type: 'SURVIVE_TIME', value: 0 },
        rewardGold: 0,
        nextLevels: ['level-2', 'level-3'],
        isTown: true,
        position: { x: 300, y: 300 }
    },
    {
        id: 'level-2',
        name: 'Forest 🌲',
        description: 'The letters are getting aggressive.',
        difficulty: 2,
        letters: ['A', 'S', 'D', 'F'],
        winCondition: { type: 'KILL_COUNT', value: 15 },
        rewardGold: 100,
        nextLevels: ['level-4'],
        position: { x: 500, y: 200 }
    },
    {
        id: 'level-3',
        name: 'Cave 🦇',
        description: 'Survive the swarm!',
        difficulty: 3,
        letters: ['Z', 'X', 'C', 'V'],
        winCondition: { type: 'SURVIVE_TIME', value: 45 },
        rewardGold: 120,
        nextLevels: ['level-5'],
        position: { x: 500, y: 400 }
    },
    {
        id: 'level-4',
        name: 'Castle 🏰',
        description: 'Storm the gates!',
        difficulty: 5,
        letters: MEDIUM_LETTERS,
        winCondition: { type: 'KILL_COUNT', value: 30 },
        rewardGold: 200,
        nextLevels: [],
        position: { x: 700, y: 200 }
    },
    {
        id: 'level-5',
        name: 'Volcano 🌋',
        description: 'It is getting hot!',
        difficulty: 6,
        letters: HARD_LETTERS,
        winCondition: { type: 'SURVIVE_TIME', value: 60 },
        rewardGold: 250,
        nextLevels: [],
        position: { x: 700, y: 400 }
    }
];
