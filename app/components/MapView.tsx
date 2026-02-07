import React from 'react';
import { MapNode, PlayerState } from '../types/progress';

interface MapViewProps {
  levels: MapNode[];
  playerState: PlayerState;
  onSelectLevel: (levelId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ levels, playerState, onSelectLevel }) => {
  // Find connections to draw lines
  // We need to know which nodes connect to which.
  // level.nextLevels contains IDs.

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-auto text-white font-mono">
      <div className="absolute top-4 left-4 text-2xl font-bold tracking-wide text-cyan-200 drop-shadow">
        Star Map 🗺️
      </div>
      <div className="absolute top-14 left-4 text-sm text-cyan-400/80">
        Scroll to explore the next world ✨
      </div>

      <div className="relative min-w-[1500px] min-h-full">
        {/* SVG Layer for paths */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {levels.map(level => (
            level.nextLevels.map(nextId => {
              const target = levels.find(l => l.id === nextId);
              if (!target) return null;

              // Only draw line if origin is unlocked? Or always show paths?
              // Show paths if origin is revealed (unlocked).
              const isUnlocked = playerState.unlockedLevels.includes(level.id);

              return (
                <line
                  key={`${level.id}-${nextId}`}
                  x1={level.position.x}
                  y1={level.position.y}
                  x2={target.position.x}
                  y2={target.position.y}
                  stroke={isUnlocked ? "#7dd3fc" : "#334155"}
                  strokeWidth="5"
                  strokeDasharray={isUnlocked ? "" : "6,6"}
                />
              );
            })
          ))}
        </svg>

      {/* Nodes Layer */}
        {levels.map(level => {
          const isUnlocked = playerState.unlockedLevels.includes(level.id);
          const isCompleted = playerState.completedLevels.includes(level.id);
          const isTown = level.isTown;

          return (
            <button
              key={level.id}
              onClick={() => isUnlocked && onSelectLevel(level.id)}
              disabled={!isUnlocked}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-200
                ${isUnlocked ? 'hover:scale-110 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
              `}
              style={{ left: level.position.x, top: level.position.y }}
            >
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center border-4 text-3xl shadow-lg shadow-cyan-500/30 ring-2 ring-transparent
                ${isTown
                  ? 'bg-sky-600 border-sky-300 ring-sky-400/60'
                  : isCompleted
                    ? 'bg-emerald-600 border-emerald-300 ring-emerald-400/60'
                    : isUnlocked
                      ? 'bg-amber-500 border-amber-300 animate-pulse ring-amber-400/60'
                      : 'bg-slate-700 border-slate-500'}
              `}>
                {isTown ? '🏠' : (isCompleted ? '⭐' : '⚔️')}
              </div>
              <div className="mt-2 bg-black/50 px-3 py-1 rounded-full text-xs text-center tracking-wide">
                {level.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
