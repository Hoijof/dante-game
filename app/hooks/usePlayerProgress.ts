"use client";

import { useState, useEffect, useCallback } from 'react';
import { PlayerState, INITIAL_PLAYER_STATE, Quest, Upgrade } from '../types/progress';

const STORAGE_KEY = 'type-defense-save-v1';

export const usePlayerProgress = () => {
  const [state, setState] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState({ ...INITIAL_PLAYER_STATE, ...parsed });
        } catch (e) {
          console.error("Failed to load save", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const addGold = useCallback((amount: number) => {
    setState(prev => ({ ...prev, gold: prev.gold + amount }));
  }, []);

  const buyUpgrade = useCallback((upgrade: Upgrade) => {
    setState(prev => {
      if (prev.gold < upgrade.cost) return prev;
      if (prev.upgrades.includes(upgrade.id)) return prev;

      if (upgrade.type === 'TOWN_UPGRADE') {
        const upgradeLevel = Number(upgrade.id.split('_').pop());
        const expectedLevel = prev.townLevel + 1;
        if (!Number.isFinite(upgradeLevel) || upgradeLevel !== expectedLevel) return prev;

        return {
          ...prev,
          gold: prev.gold - upgrade.cost,
          upgrades: [...prev.upgrades, upgrade.id],
          townLevel: prev.townLevel + 1
        };
      }

      return {
        ...prev,
        gold: prev.gold - upgrade.cost,
        upgrades: [...prev.upgrades, upgrade.id],
        maxHealth: upgrade.type === 'HEALTH_BOOST' ? prev.maxHealth + 1 : prev.maxHealth
      };
    });
  }, []);

  const completeLevel = useCallback((levelId: string, nextLevels: string[], rewardGold: number) => {
    setState(prev => {
      const isFirstClear = !prev.completedLevels.includes(levelId);
      const newCompleted = isFirstClear
        ? [...prev.completedLevels, levelId]
        : prev.completedLevels;

      const newUnlocked = [...prev.unlockedLevels];
      nextLevels.forEach(id => {
          if (!newUnlocked.includes(id)) newUnlocked.push(id);
      });

      const townBonus = Math.floor(rewardGold * (prev.townLevel * 0.1));

      return {
        ...prev,
        gold: prev.gold + rewardGold + townBonus,
        completedLevels: newCompleted,
        unlockedLevels: newUnlocked
      };
    });
  }, []);

  const acceptQuest = useCallback((quest: Quest) => {
      setState(prev => {
          if (prev.activeQuests.find(q => q.id === quest.id)) return prev;
          return {
              ...prev,
              activeQuests: [...prev.activeQuests, quest]
          };
      });
  }, []);

  const claimQuestReward = useCallback((questId: string) => {
      setState(prev => {
          const questIndex = prev.activeQuests.findIndex(q => q.id === questId);
          if (questIndex === -1) return prev;

          const quest = prev.activeQuests[questIndex];
          if (!quest.isCompleted || quest.claimed) return prev;

          const newQuests = [...prev.activeQuests];
          newQuests[questIndex] = { ...quest, claimed: true };
          // Remove claimed quests? Or keep them in history?
          // For now, let's remove them to keep the list clean, or filter them in UI.
          // Let's remove them for simplicity.
          const filteredQuests = newQuests.filter(q => q.id !== questId);

          return {
              ...prev,
              gold: prev.gold + quest.rewardGold,
              activeQuests: filteredQuests
          };
      });
  }, []);

  const updateQuestProgress = useCallback((killedLetter: string) => {
      setState(prev => {
          let updated = false;
          const newQuests = prev.activeQuests.map(q => {
              if (q.isCompleted) return q;

              let progress = false;
              if (q.targetType === 'KILL_COUNT') {
                  progress = true;
              } else if (q.targetType === 'KILL_SPECIFIC_LETTER' && q.targetLetter === killedLetter) {
                  progress = true;
              }

              if (progress) {
                  updated = true;
                  const newAmount = q.currentAmount + 1;
                  return {
                      ...q,
                      currentAmount: newAmount,
                      isCompleted: newAmount >= q.targetAmount
                  };
              }
              return q;
          });

          if (!updated) return prev;

          return {
              ...prev,
              activeQuests: newQuests,
              stats: {
                  ...prev.stats,
                  totalKills: prev.stats.totalKills + 1
              }
          };
      });
  }, []);

  const resetProgress = useCallback(() => {
      setState(INITIAL_PLAYER_STATE);
  }, []);

  return {
    playerState: state,
    isLoaded,
    addGold,
    buyUpgrade,
    completeLevel,
    acceptQuest,
    claimQuestReward,
    updateQuestProgress,
    resetProgress
  };
};
