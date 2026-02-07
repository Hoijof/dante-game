import React, { useEffect } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { LevelConfig, PlayerState } from '../types/progress';

interface GameViewProps {
  levelConfig: LevelConfig;
  playerState: PlayerState;
  onGameEnd: (won: boolean, gold: number, killedLetters: string[]) => void;
  onBack: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  levelConfig,
  playerState,
  onGameEnd,
  onBack
}) => {
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
                <div className="bg-black/50 px-4 py-2 rounded-full border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
                    <div className="text-yellow-300 font-bold">💰 {uiState.sessionGold}</div>

                    {/* Objective Display */}
                    <div className="mt-2 text-cyan-200 text-base">
                        {levelConfig.winCondition.type === 'KILL_COUNT' && (
                            <span>⚔️ Kills: {uiState.killCount} / {levelConfig.winCondition.value}</span>
                        )}
                        {levelConfig.winCondition.type === 'SURVIVE_TIME' && (
                            <span>⏱️ Time: {Math.floor(uiState.timeElapsed)} / {levelConfig.winCondition.value}s</span>
                        )}
                    </div>
                </div>
                <div className="text-right bg-black/50 px-4 py-2 rounded-full border border-red-500/40 shadow-lg shadow-red-500/20">
                    <div className="text-red-500 text-3xl">{'❤️'.repeat(uiState.baseHealth)}</div>
                    <div className="text-sm text-gray-300 mt-1">{levelConfig.name}</div>
                </div>
            </div>
        )}

        {/* Start Screen */}
        {uiState.status === 'IDLE' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto">
                <div className="text-center text-white p-8 border-2 border-cyan-400/60 rounded-2xl bg-slate-950/90 shadow-2xl shadow-cyan-500/20">
                    <h1 className="text-4xl font-bold mb-2 text-cyan-300 drop-shadow">{levelConfig.name}</h1>
                    <p className="mb-6 text-lg text-slate-300">{levelConfig.description || "Defeat the letters!"}</p>

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
