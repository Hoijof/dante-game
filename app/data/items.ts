import { Upgrade, Quest } from '../types/progress';

export const SHOP_UPGRADES: Upgrade[] = [
  { id: 'HEALTH_BOOST_1', type: 'HEALTH_BOOST', cost: 120, name: '❤️ Max Health +1', description: 'Increases your base health permanently.' },
  { id: 'MANA_BOOST_1', type: 'MANA_BOOST', cost: 140, name: '✨ Max Mana +4', description: 'Gives more mana to cast magic words.' },
  { id: 'TOWN_UPGRADE_1', type: 'TOWN_UPGRADE', cost: 180, name: '🏘️ Town Square', description: 'Level up the town to unlock better rewards.' },
  { id: 'TOWN_UPGRADE_2', type: 'TOWN_UPGRADE', cost: 360, name: '🏰 Hero Guild', description: 'Improve town services for bigger payouts.' },
  { id: 'TOWN_UPGRADE_3', type: 'TOWN_UPGRADE', cost: 720, name: '✨ Crystal Bazaar', description: 'The town glows. Rewards keep scaling.' }
];

export const TOWN_QUESTS: Quest[] = [
  {
    id: 'quest_hunt_slime',
    description: 'Defeat 8 Syllable Slimes',
    targetType: 'KILL_SPECIFIC_ENEMY',
    targetEnemyId: 'slime',
    targetAmount: 8,
    currentAmount: 0,
    rewardGold: 60,
    isCompleted: false,
    claimed: false
  },
  {
    id: 'quest_hunter_beginner',
    description: 'Defeat 60 Enemies',
    targetType: 'KILL_COUNT',
    targetAmount: 60,
    currentAmount: 0,
    rewardGold: 140,
    isCompleted: false,
    claimed: false
  }
];
