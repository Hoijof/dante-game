"use client";
export const dynamic = "force-dynamic";

import { useGameEngine } from "./hooks/useGameEngine";

const Home = () => {
  const { canvasRef, uiState, startGame, togglePause, audio } = useGameEngine();

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />

      {/* UI Overlay Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">

        {/* HUD */}
        {uiState.status !== 'IDLE' && (
            <div className="p-4 flex justify-between text-white font-mono text-xl">
                <div>
                    <div>Score: {uiState.score}</div>
                    <div>High Score: {uiState.highScore}</div>
                    <div>Difficulty: {uiState.difficulty}</div>
                </div>
                <div className="text-right">
                    <div className="text-green-500">Health: {'♥'.repeat(uiState.baseHealth)}</div>
                </div>
            </div>
        )}

        {/* Level Up Notification */}
        {uiState.showLevelUp && (
            <div className="absolute top-1/4 left-0 w-full text-center pointer-events-none animate-bounce">
                <div className="text-6xl font-bold text-yellow-400 drop-shadow-lg">
                    LEVEL UP!
                </div>
                <div className="text-2xl text-yellow-200">
                    Difficulty Increased
                </div>
            </div>
        )}

        {/* Start Screen */}
        {uiState.status === 'IDLE' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto">
                <div className="text-center text-white">
                    <h1 className="text-6xl font-bold mb-4 text-blue-500">TYPE DEFENSE</h1>
                    <p className="mb-8 text-xl">Type the letters to destroy enemies!</p>
                    <button
                        onClick={startGame}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded text-xl font-bold transition-colors"
                    >
                        START GAME (ENTER)
                    </button>

                    <div className="mt-8">
                        <label className="block text-sm font-bold mb-2">Volume: {Math.round(audio.volume * 100)}%</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={audio.volume}
                            onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
                            className="w-48 cursor-pointer"
                        />
                        <button
                            onClick={() => audio.setIsMuted(!audio.isMuted)}
                            className="ml-4 px-3 py-1 bg-gray-700 rounded text-sm"
                        >
                            {audio.isMuted ? 'Unmute' : 'Mute'}
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* Pause Screen */}
        {uiState.status === 'PAUSED' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-auto">
                <div className="text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
                    <button
                        onClick={togglePause}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded text-lg font-bold"
                    >
                        RESUME (ESC)
                    </button>

                    <div className="mt-8">
                        <label className="block text-sm font-bold mb-2">Volume: {Math.round(audio.volume * 100)}%</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={audio.volume}
                            onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
                            className="w-48 cursor-pointer"
                        />
                         <button
                            onClick={() => audio.setIsMuted(!audio.isMuted)}
                            className="ml-4 px-3 py-1 bg-gray-700 rounded text-sm"
                        >
                            {audio.isMuted ? 'Unmute' : 'Mute'}
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* Game Over Screen */}
        {uiState.status === 'GAME_OVER' && (
             <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 pointer-events-auto">
                <div className="text-center text-white">
                    <h2 className="text-5xl font-bold mb-4 text-red-500">GAME OVER</h2>
                    <p className="text-2xl mb-2">Final Score: {uiState.score}</p>
                    <p className="text-xl mb-8">High Score: {uiState.highScore}</p>
                    <button
                        onClick={startGame}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded text-xl font-bold transition-colors"
                    >
                        TRY AGAIN (ENTER)
                    </button>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default Home;
