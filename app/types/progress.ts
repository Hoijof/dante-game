export interface Upgrade {
  id: string;
  type: 'AUTO_LETTER' | 'HEALTH_BOOST' | 'TOWN_UPGRADE';
  target?: string; // e.g., 'A' for auto-letter
  cost: number;
  name: string; // Symbolic name or icon
  description: string;
}

export interface Quest {
  id: string;
  description: string;
  targetType: 'KILL_COUNT' | 'KILL_SPECIFIC_LETTER';
  targetLetter?: string; // if specific
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
  letters: string[]; // Allowed letters
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
  townLevel: number;
  completedLevels: string[]; // IDs
  unlockedLevels: string[]; // IDs
  upgrades: string[]; // IDs of purchased upgrades (e.g. "auto-A")
  activeQuests: Quest[];
  stats: {
      totalKills: number;
  }
}

export const INITIAL_PLAYER_STATE: PlayerState = {
    gold: 0,
    maxHealth: 5,
    townLevel: 0,
    completedLevels: [],
    unlockedLevels: ['level-1'], // Start with Tutorial
    upgrades: [],
    activeQuests: [],
    stats: {
        totalKills: 0
    }
};
