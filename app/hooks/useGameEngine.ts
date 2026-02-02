import { useRef, useEffect, useCallback, useState } from 'react';
import {
  GameState,
  GameStatus,
  Enemy,
  Star
} from '../types';
import {
  LevelConfig,
  PlayerState
} from '../types/progress';
import {
  BASE_INITIAL_HEALTH,
  ENEMY_SPEED_BASE,
  ENEMY_SPAWN_RATE_BASE,
  SCORE_INCREMENT,
  ENEMY_SMALL_SIZE,
  ENEMY_LARGE_SIZE
} from '../constants';
import { getCastleImage } from '../castleSvg';
import { useAudio } from './useAudio';

export const useGameEngine = (
    levelConfig: LevelConfig,
    playerState: PlayerState,
    onGameEnd: (won: boolean, gold: number, killedLetters: string[]) => void
) => {
  const { playBgm, pauseBgm, playSound, volume, setVolume, isMuted, setIsMuted } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  // Game State Ref (Mutable for performance)
  const gameStateRef = useRef<GameState>({
    status: 'IDLE',
    score: 0,
    sessionGold: 0,
    killCount: 0,
    timeElapsed: 0,
    highScore: 0, // Not really used in level mode but kept for compat
    difficulty: levelConfig.difficulty,
    baseHealth: playerState.maxHealth,
    baseMaxHealth: playerState.maxHealth,
    enemies: [],
    particles: [],
    stars: [],
    dimensions: { width: 800, height: 600 },
    fps: 0
  });

  // React State for UI updates
  const [uiState, setUiState] = useState<{
    status: GameStatus;
    score: number;
    sessionGold: number;
    baseHealth: number;
    killCount: number;
    timeElapsed: number;
  }>({
    status: 'IDLE',
    score: 0,
    sessionGold: 0,
    baseHealth: playerState.maxHealth,
    killCount: 0,
    timeElapsed: 0
  });

  const [castleImage, setCastleImage] = useState<HTMLImageElement | null>(null);

  // Keep track of killed letters for quest updates
  const killedLettersRef = useRef<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gameStateRef.current.dimensions = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Init Stars
      const stars: Star[] = [];
      for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            brightness: Math.random()
        });
      }
      gameStateRef.current.stars = stars;

      setCastleImage(getCastleImage());
    }
  }, []);

  const createExplosion = useCallback((x: number, y: number, color: string, type: 'NORMAL' | 'GOLD' = 'NORMAL') => {
      const count = type === 'GOLD' ? 15 : 10;
      for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2 + 1;
          gameStateRef.current.particles.push({
              id: Math.random().toString(36).substr(2, 9),
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              maxLife: 1.0,
              color: type === 'GOLD' ? '#FFD700' : color,
              size: Math.random() * 3 + 1,
              type
          });
      }
  }, []);

  const spawnEnemy = useCallback(() => {
    const { width, height } = gameStateRef.current.dimensions;
    const difficulty = gameStateRef.current.difficulty;

    const size = Math.random() < 0.8 ? ENEMY_SMALL_SIZE : ENEMY_LARGE_SIZE;
    const letter = levelConfig.letters[Math.floor(Math.random() * levelConfig.letters.length)];

    // Random vibrant color
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5', '#FFFF33'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newEnemy: Enemy = {
      id: Math.random().toString(36).substr(2, 9),
      x: width + 50,
      y: Math.random() * (height - 100) + 50,
      letter,
      size,
      color,
      spawnTime: performance.now()
    };

    gameStateRef.current.enemies.push(newEnemy);
  }, [levelConfig]);

  const killEnemy = useCallback((enemyIndex: number) => {
      const state = gameStateRef.current;
      const enemy = state.enemies[enemyIndex];
      state.enemies.splice(enemyIndex, 1);

      createExplosion(enemy.x, enemy.y, enemy.color);
      playSound('kill');

      // Update Score & Kill Count
      state.score += SCORE_INCREMENT;
      state.killCount += 1;

      // Gold Logic (Simple: 1 gold per kill, + visual)
      state.sessionGold += 1;
      createExplosion(enemy.x, enemy.y, 'gold', 'GOLD');

      killedLettersRef.current.push(enemy.letter);
  }, [createExplosion, playSound]);

  const endGame = useCallback((won: boolean) => {
      const state = gameStateRef.current;
      state.status = won ? 'VICTORY' : 'GAME_OVER';
      pauseBgm();
      playSound(won ? 'levelUp' : 'dead'); // Assume 'levelUp' sound exists or fallback? 'dead' works.

      setUiState(prev => ({
          ...prev,
          status: state.status
      }));

      onGameEnd(won, state.sessionGold, killedLettersRef.current);
  }, [pauseBgm, playSound, onGameEnd]);

  const update = useCallback((deltaTime: number, time: number) => {
    const state = gameStateRef.current;

    // Background Stars
    state.stars.forEach(star => {
        star.x -= star.speed * (deltaTime / 16);
        if (star.x < 0) {
            star.x = state.dimensions.width;
            star.y = Math.random() * state.dimensions.height;
        }
    });

    // Particles
    state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
    });
    state.particles = state.particles.filter(p => p.life > 0);

    if (state.status !== 'PLAYING') return;

    // Update Time Elapsed (accumulate seconds)
    // Note: deltaTime is ms
    state.timeElapsed += deltaTime / 1000;

    // Check Win Condition
    if (levelConfig.winCondition.type === 'KILL_COUNT') {
        if (state.killCount >= levelConfig.winCondition.value) {
            endGame(true);
            return;
        }
    } else if (levelConfig.winCondition.type === 'SURVIVE_TIME') {
         if (state.timeElapsed >= levelConfig.winCondition.value) {
             endGame(true);
             return;
         }
    }

    // Move enemies
    const speed = ENEMY_SPEED_BASE * (1 + state.difficulty * 0.1);
    state.enemies.forEach(enemy => {
      enemy.x -= speed * deltaTime;
    });

    // Auto-Letter Logic
    // Check backwards loop for safe removal? Or findIndex.
    // We'll iterate and collect indices to remove or just remove one per frame for simplicity?
    // Let's do a loop and check conditions.
    const autoEnemiesToRemove: number[] = [];
    state.enemies.forEach((enemy, index) => {
        const autoUpgradeId = `AUTO_LETTER_${enemy.letter}`;
        if (playerState.upgrades.includes(autoUpgradeId)) {
            // Check if alive > 0.5s (500ms)
            if (time - enemy.spawnTime > 500) {
                autoEnemiesToRemove.push(index);
            }
        }
    });

    // Process Auto-Kills (Reverse order to preserve indices)
    for (let i = autoEnemiesToRemove.length - 1; i >= 0; i--) {
        killEnemy(autoEnemiesToRemove[i]);
    }

    // Check Base Collision
    const baseX = 50;
    const enemiesToCrash: string[] = [];

    state.enemies.forEach(enemy => {
      if (enemy.x < baseX) {
        state.baseHealth = Math.max(0, state.baseHealth - 1);
        enemiesToCrash.push(enemy.id);

        createExplosion(enemy.x, enemy.y, 'red');
        playSound('hit');

        if (state.baseHealth <= 0) {
            endGame(false);
        } else {
             setUiState(prev => ({ ...prev, baseHealth: state.baseHealth }));
        }
      }
    });

    // Remove crashed enemies (filter by ID to be safe)
    state.enemies = state.enemies.filter(e => !enemiesToCrash.includes(e.id));

    // Sync UI periodically or on event?
    // Syncing every frame is expensive for React.
    // Let's sync only if changed significantly or throttle.
    // For now, let's sync every frame but maybe optimise later.
    // Actually, simple throttle: only sync if score/health/time changed significantly.
    // Or just let it be, 60fps React renders on simple DOM is usually "okay" but not great.
    // We'll optimize by comparing values before setUiState if needed.
    // Here we'll just do it:
    setUiState(prev => ({
        ...prev,
        score: state.score,
        sessionGold: state.sessionGold,
        killCount: state.killCount,
        timeElapsed: Math.floor(state.timeElapsed)
    }));

  }, [pauseBgm, playSound, createExplosion, levelConfig, playerState, killEnemy, endGame]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = 'white';
    state.stars.forEach(star => {
        ctx.globalAlpha = star.brightness;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Particles
    state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    if (state.status !== 'IDLE') {
        // Base
        if (castleImage) {
            ctx.drawImage(castleImage, 10, state.dimensions.height / 2 - 32, 64, 64);
        } else {
            ctx.fillStyle = 'blue';
            ctx.fillRect(10, state.dimensions.height / 2 - 25, 50, 50);
        }

        if (state.baseHealth > 1) {
            ctx.strokeStyle = `rgba(0, 255, 0, ${state.baseHealth / state.baseMaxHealth})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(42, state.dimensions.height / 2, 40, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Enemies
    state.enemies.forEach(enemy => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2;

        ctx.beginPath();
        const r = enemy.size;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const ex = enemy.x + r * Math.cos(angle);
            const ey = enemy.y + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(ex, ey);
            else ctx.lineTo(ex, ey);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.font = `bold ${Math.floor(enemy.size * 1.2)}px Mono`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enemy.letter, enemy.x, enemy.y);

        ctx.shadowBlur = 10;
        ctx.shadowColor = enemy.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
    });

  }, [castleImage]);

  const loop = useCallback((time: number) => {
    if (previousTimeRef.current === 0) {
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
        return;
    }
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;

    const cappedDelta = Math.min(deltaTime, 100);

    gameStateRef.current.fps = Math.round(1000 / (deltaTime || 16));

    update(cappedDelta, time);
    draw();

    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  // Initial Setup & Resize
  useEffect(() => {
    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            gameStateRef.current.dimensions = {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    requestRef.current = requestAnimationFrame(loop);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  const startGame = useCallback(() => {
      gameStateRef.current = {
          ...gameStateRef.current,
          status: 'PLAYING',
          score: 0,
          sessionGold: 0,
          killCount: 0,
          timeElapsed: 0,
          baseHealth: playerState.maxHealth,
          baseMaxHealth: playerState.maxHealth,
          enemies: [],
          particles: []
      };
      killedLettersRef.current = [];

      setUiState({
          status: 'PLAYING',
          score: 0,
          sessionGold: 0,
          killCount: 0,
          timeElapsed: 0,
          baseHealth: playerState.maxHealth
      });
      playBgm();
  }, [playBgm, playerState.maxHealth]);

  const togglePause = useCallback(() => {
      const currentStatus = gameStateRef.current.status;
      if (currentStatus === 'PLAYING') {
          gameStateRef.current.status = 'PAUSED';
          setUiState(prev => ({ ...prev, status: 'PAUSED' }));
          pauseBgm();
      } else if (currentStatus === 'PAUSED') {
          gameStateRef.current.status = 'PLAYING';
          setUiState(prev => ({ ...prev, status: 'PLAYING' }));
          playBgm();
      }
  }, [pauseBgm, playBgm]);

  // Spawner
  useEffect(() => {
    const interval = setInterval(() => {
        if (gameStateRef.current.status === 'PLAYING') {
            spawnEnemy();
        }
    }, ENEMY_SPAWN_RATE_BASE / (levelConfig.difficulty || 1));
    return () => clearInterval(interval);
  }, [spawnEnemy, levelConfig.difficulty]);

  // Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const char = e.key.toUpperCase();

        if (gameStateRef.current.status === 'IDLE' || gameStateRef.current.status === 'GAME_OVER' || gameStateRef.current.status === 'VICTORY') {
            if (char === 'ENTER') {
                // startGame(); // Handled by UI mostly now, but keep for robustness?
                // Actually, level logic usually has a "Start Level" button in UI.
                // We'll expose startGame and let UI call it.
            }
            return;
        }

        if (gameStateRef.current.status === 'PLAYING') {
            if (e.key === 'Escape') {
                togglePause();
                return;
            }

            const enemyIndex = gameStateRef.current.enemies.findIndex(e => e.letter === char);
            if (enemyIndex !== -1) {
                killEnemy(enemyIndex);
            }
        } else if (gameStateRef.current.status === 'PAUSED') {
            if (e.key === 'Escape') {
                togglePause();
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, togglePause, killEnemy]);

  return {
    canvasRef,
    uiState,
    startGame,
    togglePause,
    audio: {
        volume,
        setVolume,
        isMuted,
        setIsMuted
    }
  };
};
