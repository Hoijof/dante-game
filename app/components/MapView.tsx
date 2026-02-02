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
    <div className="relative w-full h-full bg-slate-900 overflow-hidden text-white font-mono">
      <div className="absolute top-4 left-4 text-2xl">
        Map 🗺️
      </div>

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
                stroke={isUnlocked ? "#FFF" : "#444"}
                strokeWidth="4"
                strokeDasharray={isUnlocked ? "" : "5,5"}
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
              w-16 h-16 rounded-full flex items-center justify-center border-4 text-3xl shadow-lg
              ${isTown
                ? 'bg-blue-600 border-blue-300'
                : isCompleted
                  ? 'bg-green-600 border-green-300'
                  : isUnlocked
                    ? 'bg-yellow-600 border-yellow-300 animate-pulse'
                    : 'bg-gray-700 border-gray-500'}
            `}>
              {isTown ? '🏠' : (isCompleted ? '⭐' : '⚔️')}
            </div>
            <div className="mt-2 bg-black/50 px-2 rounded text-sm text-center">
              {level.name}
            </div>
          </button>
        );
      })}
    </div>
  );
};
