export interface Upgrade {
  id: string;
  type: 'HEALTH_BOOST' | 'MANA_BOOST' | 'TOWN_UPGRADE';
  cost: number;
  name: string; // Symbolic name or icon
  description: string;
}

export interface Quest {
  id: string;
  description: string;
  targetType: 'KILL_COUNT' | 'KILL_SPECIFIC_ENEMY';
  targetEnemyId?: string; // if specific
  targetAmount: number;
  currentAmount: number;
  rewardGold: number;
  isCompleted: boolean;
  claimed: boolean; // Has the reward been collected?
}

export interface LevelConfig {
  id: string;
  name: string;
  difficulty: number; // Multiplier
  enemyIds: string[];
  winCondition: {
    type: 'KILL_COUNT' | 'SURVIVE_TIME';
    value: number; // e.g., 10 kills or 60 seconds
  };
  rewardGold: number;
  nextLevels: string[]; // IDs of levels unlocked by completing this one
  isTown?: boolean;
  description?: string;
  background?: string; // Hex color or basic theme ID
}

export interface MapNode extends LevelConfig {
    position: { x: number, y: number }; // For visual layout on map
}

export interface PlayerState {
  gold: number;
  maxHealth: number;
  maxMana: number;
  level: number;
  xp: number;
  xpToNext: number;
  townLevel: number;
  completedLevels: string[]; // IDs
  unlockedLevels: string[]; // IDs
  upgrades: string[]; // IDs of purchased upgrades (e.g. "auto-A")
  unlockedWordIds: string[];
  equippedWordIds: string[];
  activeQuests: Quest[];
  stats: {
      totalKills: number;
  }
}

export const INITIAL_PLAYER_STATE: PlayerState = {
    gold: 0,
    maxHealth: 5,
    maxMana: 20,
    level: 1,
    xp: 0,
    xpToNext: 100,
    townLevel: 0,
    completedLevels: [],
    unlockedLevels: ['level-1'], // Start with Tutorial
    upgrades: [],
    unlockedWordIds: ['jab', 'kick', 'push', 'spark'],
    equippedWordIds: ['jab', 'kick', 'push', 'spark'],
    activeQuests: [],
    stats: {
        totalKills: 0
    }
};
