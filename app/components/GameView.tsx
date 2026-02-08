import React from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { LevelConfig, PlayerState } from '../types/progress';
import { formatWordWithSyllables, getAttackWordById } from '../data/words';
import type { AttackWord } from '../types/combat';

interface GameViewProps {
  levelConfig: LevelConfig;
  playerState: PlayerState;
  onGameEnd: (won: boolean, gold: number, killedEnemyIds: string[], sessionXp: number) => void;
  onBack: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  levelConfig,
  playerState,
  onGameEnd,
  onBack
}) => {
  const equippedWords = playerState.equippedWordIds
    .map(wordId => getAttackWordById(wordId))
    .filter((word): word is AttackWord => Boolean(word));
  const { canvasRef, uiState, startGame, togglePause, audio } = useGameEngine(
      levelConfig,
      playerState,
      onGameEnd
  );

  // Auto-start or wait for user?
  // Wait for user is better for "Ready?" feel.

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden font-mono">
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />

      {/* UI Overlay Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">

        {/* HUD */}
        {uiState.status !== 'IDLE' && (
            <div className="p-4 flex flex-col gap-4 sm:flex-row sm:justify-between text-white text-xl">
                <div className="bg-black/50 px-4 py-2 rounded-2xl border border-cyan-500/40 shadow-lg shadow-cyan-500/20 space-y-2">
                    <div className="text-yellow-300 font-bold">💰 {uiState.sessionGold}</div>

                    <div className="text-sm text-slate-300">Lv {playerState.level} · XP {playerState.xp}/{playerState.xpToNext}</div>
                    <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full"
                          style={{ width: `${Math.min(100, (playerState.xp / playerState.xpToNext) * 100)}%` }}
                        />
                    </div>

                    <div className="text-sm text-cyan-200">
                        Mana: {uiState.playerMana} / {uiState.playerMaxMana}
                    </div>
                    <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-400 h-full"
                          style={{ width: `${Math.min(100, (uiState.playerMana / uiState.playerMaxMana) * 100)}%` }}
                        />
                    </div>

                    {/* Objective Display */}
                    <div className="text-cyan-200 text-base">
                        {levelConfig.winCondition.type === 'KILL_COUNT' && (
                            <span>⚔️ Kills: {uiState.killCount} / {levelConfig.winCondition.value}</span>
                        )}
                        {levelConfig.winCondition.type === 'SURVIVE_TIME' && (
                            <span>⏱️ Time: {Math.floor(uiState.timeElapsed)} / {levelConfig.winCondition.value}s</span>
                        )}
                    </div>
                </div>
                <div className="text-right bg-black/50 px-4 py-2 rounded-2xl border border-red-500/40 shadow-lg shadow-red-500/20 space-y-2">
                    <div className="text-red-500 text-3xl">{'❤️'.repeat(uiState.baseHealth)}</div>
                    <div className="text-sm text-gray-300">{levelConfig.name}</div>
                    {uiState.targetName && uiState.targetHealth !== undefined && uiState.targetMaxHealth !== undefined && (
                        <div className="text-xs text-slate-200">
                          Target: {uiState.targetName} ({uiState.targetHealth}/{uiState.targetMaxHealth})
                        </div>
                    )}
                </div>
            </div>
        )}

        {(uiState.status === 'PLAYING' || uiState.status === 'PAUSED') && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 border border-slate-700 rounded-2xl px-6 py-4 text-white pointer-events-none">
                <div className="text-center text-sm text-slate-300 mb-2">
                    Type a word to attack · Current input: <span className="text-cyan-300 font-bold">{uiState.inputBuffer || '...'}</span>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                    {equippedWords.map(word => {
                        const remaining = uiState.cooldowns[word.id] ?? 0;
                        const onCooldown = remaining > 0;
                        return (
                            <div key={word.id} className="px-3 py-2 rounded-xl border border-slate-600 bg-slate-900/70 min-w-[140px] text-center">
                                <div className="font-bold text-sm">{word.text}</div>
                                <div className="text-xs text-slate-400">{formatWordWithSyllables(word)}</div>
                                <div className="text-xs text-slate-300">
                                  {word.type === 'MAGIC' ? `Mana ${word.manaCost}` : 'Melee'} · {word.damage} dmg
                                </div>
                                <div className={`text-xs mt-1 ${onCooldown ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {onCooldown ? `Cooldown ${(remaining / 1000).toFixed(1)}s` : 'Ready'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Start Screen */}
        {uiState.status === 'IDLE' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto">
                <div className="text-center text-white p-8 border-2 border-cyan-400/60 rounded-2xl bg-slate-950/90 shadow-2xl shadow-cyan-500/20">
                    <h1 className="text-4xl font-bold mb-2 text-cyan-300 drop-shadow">{levelConfig.name}</h1>
                    <p className="mb-6 text-lg text-slate-300">{levelConfig.description || "Channel syllable magic to defeat the enemy."}</p>

                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-2 text-slate-200">Objective:</h3>
                        {levelConfig.winCondition.type === 'KILL_COUNT' ? (
                            <p className="text-green-400 text-2xl">Defeat {levelConfig.winCondition.value} Enemies ⚔️</p>
                        ) : (
                            <p className="text-green-400 text-2xl">Survive {levelConfig.winCondition.value} Seconds ⏱️</p>
                        )}
                    </div>

                    <button
                        onClick={startGame}
                        className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 rounded-full text-xl font-bold transition-colors animate-pulse text-slate-900 shadow-lg shadow-cyan-500/40"
                    >
                        START LEVEL (ENTER)
                    </button>

                    <button
                        onClick={onBack}
                        className="block mx-auto mt-4 text-gray-400 hover:text-white underline"
                    >
                        Return to Map
                    </button>

                    <div className="mt-8 border-t border-slate-700 pt-4">
                        <div className="text-sm text-slate-300 mb-2">Equipped Words</div>
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                          {equippedWords.map(word => (
                            <div key={word.id} className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-sm">
                              {word.text}
                            </div>
                          ))}
                        </div>
                        <label className="block text-sm font-bold mb-2 text-slate-300">Volume</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={audio.volume}
                            onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
                            className="w-48 cursor-pointer accent-cyan-400"
                        />
                    </div>
                </div>
             </div>
        )}

        {/* Pause Screen */}
        {uiState.status === 'PAUSED' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-auto">
                <div className="text-center text-white bg-slate-900/90 p-8 rounded-2xl border-2 border-slate-500 shadow-xl">
                    <h2 className="text-4xl font-bold mb-4">PAUSED ⏸️</h2>
                    <button
                        onClick={togglePause}
                        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-full text-lg font-bold mb-4 w-full text-slate-900"
                    >
                        RESUME
                    </button>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-full text-lg font-bold w-full"
                    >
                        QUIT LEVEL
                    </button>
                </div>
             </div>
        )}

        {/* Game Over Screen */}
        {uiState.status === 'GAME_OVER' && (
             <div className="absolute inset-0 flex items-center justify-center bg-red-950/90 pointer-events-auto">
                <div className="text-center text-white bg-black/40 p-10 rounded-2xl border border-red-500/50">
                    <h2 className="text-6xl font-bold mb-4 text-red-500 drop-shadow-lg">DEFEAT ☠️</h2>
                    <p className="text-2xl mb-8">Don't give up!</p>
                    <button
                        onClick={startGame} // Restart
                        className="px-8 py-4 bg-red-600 hover:bg-red-500 rounded-full text-xl font-bold transition-colors mr-4"
                    >
                        TRY AGAIN
                    </button>
                    <button
                        onClick={onBack}
                        className="px-8 py-4 bg-slate-600 hover:bg-slate-500 rounded-full text-xl font-bold transition-colors"
                    >
                        GIVE UP
                    </button>
                </div>
             </div>
        )}

        {/* Victory Screen */}
        {uiState.status === 'VICTORY' && (
             <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/90 pointer-events-auto">
                <div className="text-center text-white bg-black/40 p-10 rounded-2xl border border-emerald-500/50">
                    <h2 className="text-6xl font-bold mb-4 text-green-400 drop-shadow-lg">VICTORY! 🎉</h2>
                    <div className="text-3xl mb-2 text-yellow-300">
                        Found {uiState.sessionGold} 💰
                    </div>
                    <div className="text-xl mb-8 text-green-200">
                         Reward: +{levelConfig.rewardGold} 💰
                    </div>
                    <button
                        onClick={onBack}
                        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-full text-xl font-bold transition-colors text-slate-900"
                    >
                        CONTINUE
                    </button>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};
