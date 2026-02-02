import React from 'react';
import { PlayerState, Quest, Upgrade } from '../types/progress';
import { SHOP_UPGRADES, TOWN_QUESTS } from '../data/items';

interface TownViewProps {
  playerState: PlayerState;
  onBuyUpgrade: (upgrade: Upgrade) => void;
  onAcceptQuest: (quest: Quest) => void;
  onClaimQuest: (questId: string) => void;
  onBack: () => void;
}

export const TownView: React.FC<TownViewProps> = ({
  playerState,
  onBuyUpgrade,
  onAcceptQuest,
  onClaimQuest,
  onBack
}) => {
  return (
    <div className="w-full h-full bg-slate-800 text-white p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-8 border-b border-gray-600 pb-4">
        <h1 className="text-4xl font-bold">Town 🏠</h1>
        <div className="text-2xl font-mono text-yellow-400">
          💰 {playerState.gold}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SHOP SECTION */}
        <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Market 🛒</h2>
          <div className="space-y-4">
            {SHOP_UPGRADES.map(upgrade => {
              const isOwned = playerState.upgrades.includes(upgrade.id);
              const canAfford = playerState.gold >= upgrade.cost;

              return (
                <div key={upgrade.id} className="flex justify-between items-center bg-slate-800 p-4 rounded">
                  <div>
                    <div className="font-bold text-lg">{upgrade.name}</div>
                    <div className="text-sm text-gray-400">{upgrade.description}</div>
                  </div>
                  <button
                    onClick={() => onBuyUpgrade(upgrade)}
                    disabled={isOwned || !canAfford}
                    className={`px-4 py-2 rounded font-bold transition-colors
                      ${isOwned
                        ? 'bg-green-600 text-white cursor-default'
                        : canAfford
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    {isOwned ? 'OWNED' : `${upgrade.cost} 💰`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* QUEST BOARD */}
        <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Quest Board 📜</h2>
          <div className="space-y-4">
            {TOWN_QUESTS.map(quest => {
              const activeQuest = playerState.activeQuests.find(q => q.id === quest.id);
              // If active, use the state from activeQuests (which has progress), else use template
              const currentQuestState = activeQuest || quest;
              const isCompleted = currentQuestState.isCompleted;
              const isClaimed = currentQuestState.claimed;

              if (isClaimed) return null; // Hide claimed quests? Or show as done? let's hide for now.

              return (
                <div key={quest.id} className="bg-slate-800 p-4 rounded border-l-4 border-yellow-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg">{quest.description}</div>
                    <div className="text-yellow-400 font-mono">{quest.rewardGold} 💰</div>
                  </div>

                  {activeQuest ? (
                    <div>
                      <div className="w-full bg-gray-600 h-4 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-green-500 h-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (currentQuestState.currentAmount / currentQuestState.targetAmount) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {currentQuestState.currentAmount} / {currentQuestState.targetAmount}
                        </span>
                        {isCompleted ? (
                          <button
                            onClick={() => onClaimQuest(quest.id)}
                            className="px-4 py-1 bg-green-500 hover:bg-green-600 rounded text-white font-bold animate-bounce"
                          >
                            CLAIM
                          </button>
                        ) : (
                          <span className="text-sm text-yellow-500 font-bold">IN PROGRESS</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAcceptQuest(quest)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
                    >
                      ACCEPT QUEST
                    </button>
                  )}
                </div>
              );
            })}

            {playerState.activeQuests.length === 0 && TOWN_QUESTS.every(q => {
                 const active = playerState.activeQuests.find(aq => aq.id === q.id);
                 return active?.claimed; // If all template quests are claimed (Wait, I filter them out above)
                 // This logic is tricky because I hide claimed quests.
                 // If TOWN_QUESTS is empty or all claimed.
            }) && (
                <div className="text-center text-gray-400 py-8">No new quests available.</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-2xl font-bold shadow-lg transform hover:scale-105 transition-all"
        >
          BACK TO MAP 🗺️
        </button>
      </div>
    </div>
  );
};
