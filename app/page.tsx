"use client";
export const dynamic = "force-dynamic";

import React, { useState } from 'react';
import { usePlayerProgress } from './hooks/usePlayerProgress';
import { MapView } from './components/MapView';
import { TownView } from './components/TownView';
import { GameView } from './components/GameView';
import { GAME_LEVELS } from './data/levels';

type ViewState = 'MAP' | 'TOWN' | 'GAME';

const Home = () => {
  const {
    playerState,
    isLoaded,
    addGold,
    buyUpgrade,
    completeLevel,
    acceptQuest,
    claimQuestReward,
    updateQuestProgress,
    equipWord,
    unequipWord,
    gainExperience
  } = usePlayerProgress();

  const [currentView, setCurrentView] = useState<ViewState>('MAP');
  const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);

  // If loading, show spinner?
  if (!isLoaded) return <div className="h-screen w-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  const handleSelectLevel = (levelId: string) => {
    const level = GAME_LEVELS.find(l => l.id === levelId);
    if (!level) return;

    if (level.isTown) {
      setCurrentLevelId(levelId);
      setCurrentView('TOWN');
      // Fix: Visiting town unlocks its next levels immediately
      completeLevel(level.id, level.nextLevels, 0);
    } else {
      setCurrentLevelId(levelId);
      setCurrentView('GAME');
    }
  };

  const handleGameEnd = (won: boolean, sessionGold: number, killedEnemyIds: string[], sessionXp: number) => {
    // 1. Add session gold (loot)
    if (sessionGold > 0) {
        addGold(sessionGold);
    }

    // 2. Update Quests
    killedEnemyIds.forEach(enemyId => updateQuestProgress(enemyId));

    if (sessionXp > 0) {
        gainExperience(sessionXp);
    }

    // 3. Handle Level Completion
    if (won && currentLevelId) {
        const level = GAME_LEVELS.find(l => l.id === currentLevelId);
        if (level) {
            completeLevel(level.id, level.nextLevels, level.rewardGold);
        }
    }
  };

  const handleBackToMap = () => {
      setCurrentView('MAP');
      setCurrentLevelId(null);
  };

  // Render Logic
  if (currentView === 'TOWN') {
      return (
          <TownView
            playerState={playerState}
            onBuyUpgrade={buyUpgrade}
            onAcceptQuest={acceptQuest}
            onClaimQuest={claimQuestReward}
            onEquipWord={equipWord}
            onUnequipWord={unequipWord}
            onBack={handleBackToMap}
          />
      );
  }

  if (currentView === 'GAME' && currentLevelId) {
      const level = GAME_LEVELS.find(l => l.id === currentLevelId);
      if (level) {
          return (
              <GameView
                levelConfig={level}
                playerState={playerState}
                onGameEnd={handleGameEnd}
                onBack={handleBackToMap}
              />
          );
      }
  }

  // Default: Map View
  return (
      <MapView
        levels={GAME_LEVELS}
        playerState={playerState}
        onSelectLevel={handleSelectLevel}
      />
  );
};

export default Home;
