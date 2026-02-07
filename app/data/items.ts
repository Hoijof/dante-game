import { Upgrade, Quest } from '../types/progress';

export const SHOP_UPGRADES: Upgrade[] = [
    { id: 'HEALTH_BOOST_1', type: 'HEALTH_BOOST', cost: 100, name: '❤️ Max Health +1', description: 'Increases your base health permanently.' },
    { id: 'TOWN_UPGRADE_1', type: 'TOWN_UPGRADE', cost: 150, name: '🏘️ Town Square', description: 'Level up the town to unlock better rewards.' },
    { id: 'TOWN_UPGRADE_2', type: 'TOWN_UPGRADE', cost: 300, name: '🏰 Hero Guild', description: 'Improve town services for bigger payouts.' },
    { id: 'TOWN_UPGRADE_3', type: 'TOWN_UPGRADE', cost: 600, name: '✨ Crystal Bazaar', description: 'The town glows. Rewards keep scaling.' },
    { id: 'AUTO_LETTER_A', type: 'AUTO_LETTER', target: 'A', cost: 50, name: '🤖 Auto-A', description: 'Automatically targets "A" enemies.' },
    { id: 'AUTO_LETTER_S', type: 'AUTO_LETTER', target: 'S', cost: 60, name: '🤖 Auto-S', description: 'Automatically targets "S" enemies.' },
    { id: 'AUTO_LETTER_D', type: 'AUTO_LETTER', target: 'D', cost: 70, name: '🤖 Auto-D', description: 'Automatically targets "D" enemies.' },
    { id: 'AUTO_LETTER_F', type: 'AUTO_LETTER', target: 'F', cost: 80, name: '🤖 Auto-F', description: 'Automatically targets "F" enemies.' },
];

export const TOWN_QUESTS: Quest[] = [
    {
        id: 'quest_hunt_z',
        description: 'Hunt 10 "Z"s',
        targetType: 'KILL_SPECIFIC_LETTER',
        targetLetter: 'Z',
        targetAmount: 10,
        currentAmount: 0,
        rewardGold: 50,
        isCompleted: false,
        claimed: false
    },
    {
        id: 'quest_hunter_beginner',
        description: 'Defeat 50 Enemies',
        targetType: 'KILL_COUNT',
        targetAmount: 50,
        currentAmount: 0,
        rewardGold: 100,
        isCompleted: false,
        claimed: false
    }
];
