import React from 'react';
import { PlayerState, Quest, Upgrade } from '../types/progress';
import { SHOP_UPGRADES, TOWN_QUESTS } from '../data/items';
import { ATTACK_WORDS, formatWordWithSyllables } from '../data/words';
import { MAX_EQUIPPED_WORDS } from '../constants';

interface TownViewProps {
  playerState: PlayerState;
  onBuyUpgrade: (upgrade: Upgrade) => void;
  onAcceptQuest: (quest: Quest) => void;
  onClaimQuest: (questId: string) => void;
  onEquipWord: (wordId: string) => void;
  onUnequipWord: (wordId: string) => void;
  onBack: () => void;
}

export const TownView: React.FC<TownViewProps> = ({
  playerState,
  onBuyUpgrade,
  onAcceptQuest,
  onClaimQuest,
  onEquipWord,
  onUnequipWord,
  onBack
}) => {
  const townBonus = playerState.townLevel * 10;
  const nextTownLevel = playerState.townLevel + 1;
  const maxTownLevel = 3;
  const townUpgradeStatus = nextTownLevel > maxTownLevel
    ? 'Town fully upgraded!'
    : `Upgrade to Town Level ${nextTownLevel} for +${nextTownLevel * 10}% reward gold.`;

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-800 to-slate-900 text-white p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 border-b border-slate-700 pb-4 gap-4">
        <div>
          <h1 className="text-4xl font-bold">Town 🏠</h1>
          <p className="text-slate-300 mt-1">Spend your gold to grow the town and boost rewards.</p>
        </div>
        <div className="text-2xl font-mono text-yellow-300 bg-slate-900/60 px-4 py-2 rounded-full border border-yellow-500/40 shadow-lg">
          💰 {playerState.gold}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/70 p-6 rounded-2xl shadow-xl border border-slate-700 lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Town Hall 🏛️</h2>
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg text-slate-200">Town Level</div>
            <div className="text-2xl font-bold text-cyan-300">Lv {playerState.townLevel}</div>
          </div>
          <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden mb-4">
            <div
              className="bg-cyan-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (playerState.townLevel / maxTownLevel) * 100)}%` }}
            />
          </div>
          <div className="text-sm text-slate-300">Current bonus: +{townBonus}% reward gold.</div>
          <div className="text-sm text-slate-400 mt-2">{townUpgradeStatus}</div>
        </div>

        {/* SHOP SECTION */}
        <div className="bg-slate-800/70 p-6 rounded-2xl shadow-xl border border-slate-700 lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Market 🛒</h2>
          <div className="space-y-4">
            {SHOP_UPGRADES.map(upgrade => {
              const isOwned = playerState.upgrades.includes(upgrade.id);
              const canAfford = playerState.gold >= upgrade.cost;
              const isTownUpgrade = upgrade.type === 'TOWN_UPGRADE';
              const upgradeLevel = Number(upgrade.id.split('_').pop());
              const isTownLocked = isTownUpgrade && upgradeLevel !== playerState.townLevel + 1;

              return (
                <div key={upgrade.id} className="flex justify-between items-center bg-slate-900/60 p-4 rounded-lg border border-slate-700">
                  <div>
                    <div className="font-bold text-lg">{upgrade.name}</div>
                    <div className="text-sm text-gray-400">{upgrade.description}</div>
                  </div>
                  <button
                    onClick={() => onBuyUpgrade(upgrade)}
                    disabled={isOwned || !canAfford || isTownLocked}
                    className={`px-4 py-2 rounded font-bold transition-colors
                      ${isOwned
                        ? 'bg-green-600 text-white cursor-default'
                        : canAfford && !isTownLocked
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

        {/* SPELLBOOK */}
        <div className="bg-slate-800/70 p-6 rounded-2xl shadow-xl border border-slate-700 lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Spellbook 📖</h2>
          <div className="text-sm text-slate-300 mb-4">
            Equip up to {MAX_EQUIPPED_WORDS} attack words. Longer words deal more damage but take longer to recharge.
          </div>
          <div className="space-y-3">
            {ATTACK_WORDS.filter(word => playerState.unlockedWordIds.includes(word.id)).map(word => {
              const isEquipped = playerState.equippedWordIds.includes(word.id);
              const isAtLimit = playerState.equippedWordIds.length >= MAX_EQUIPPED_WORDS;
              const canEquip = !isEquipped && !isAtLimit;

              return (
                <div key={word.id} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                  <div>
                    <div className="font-bold text-lg">{word.text} <span className="text-xs text-cyan-300">({formatWordWithSyllables(word)})</span></div>
                    <div className="text-xs text-slate-400">
                      {word.type === 'MAGIC' ? `Magic · ${word.manaCost} mana` : 'Melee'} · {word.damage} dmg · {Math.round(word.cooldownMs / 100) / 10}s cooldown
                    </div>
                  </div>
                  {isEquipped ? (
                    <button
                      onClick={() => onUnequipWord(word.id)}
                      className="px-3 py-1 rounded font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      EQUIPPED
                    </button>
                  ) : (
                    <button
                      onClick={() => onEquipWord(word.id)}
                      disabled={!canEquip}
                      className={`px-3 py-1 rounded font-bold transition-colors ${
                        canEquip ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isAtLimit ? 'FULL' : 'EQUIP'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* QUEST BOARD */}
        <div className="bg-slate-800/70 p-6 rounded-2xl shadow-xl border border-slate-700 lg:col-span-1">
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
