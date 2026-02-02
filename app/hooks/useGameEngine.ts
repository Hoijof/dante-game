import { useRef, useEffect, useCallback, useState } from 'react';
import {
  GameState,
  GameStatus,
  Enemy,
  Star
} from '../types';
import {
  BASE_INITIAL_HEALTH,
  ENEMY_SPEED_BASE,
  ENEMY_SPAWN_RATE_BASE,
  SCORE_INCREMENT,
  ENEMY_SMALL_SIZE,
  ENEMY_LARGE_SIZE,
  EASY_LETTERS,
  MEDIUM_LETTERS,
  HARD_LETTERS,
  MAX_DIFFICULTY
} from '../constants';
import { getCastleImage } from '../castleSvg';
import { useAudio } from './useAudio';

export const useGameEngine = () => {
  const { playBgm, pauseBgm, playSound, volume, setVolume, isMuted, setIsMuted } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  // Game State Ref (Mutable for performance)
  const gameStateRef = useRef<GameState>({
    status: 'IDLE',
    score: 0,
    highScore: 0,
    difficulty: 1,
    baseHealth: BASE_INITIAL_HEALTH,
    baseMaxHealth: BASE_INITIAL_HEALTH,
    enemies: [],
    particles: [],
    stars: [],
    dimensions: { width: 800, height: 600 },
    fps: 0
  });

  // React State for UI updates (only update when necessary)
  const [uiState, setUiState] = useState<{
    status: GameStatus;
    score: number;
    highScore: number;
    baseHealth: number;
    difficulty: number;
    showLevelUp: boolean;
  }>({
    status: 'IDLE',
    score: 0,
    highScore: 0,
    baseHealth: BASE_INITIAL_HEALTH,
    difficulty: 1,
    showLevelUp: false
  });

  const [castleImage, setCastleImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHighScore = localStorage.getItem('dante-game-highscore');
      if (storedHighScore) {
        gameStateRef.current.highScore = parseInt(storedHighScore, 10);
        setUiState(prev => ({ ...prev, highScore: gameStateRef.current.highScore }));
      }

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

  const createExplosion = useCallback((x: number, y: number, color: string) => {
      const count = 10;
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
              color,
              size: Math.random() * 3 + 1
          });
      }
  }, []);

  const spawnEnemy = useCallback(() => {
    const { width, height } = gameStateRef.current.dimensions;
    const difficulty = gameStateRef.current.difficulty;

    // Determine letter set based on difficulty
    let letterSet = EASY_LETTERS;
    if (difficulty > 5) letterSet = MEDIUM_LETTERS;
    if (difficulty > 10) letterSet = HARD_LETTERS;

    const size = Math.random() < 0.8 ? ENEMY_SMALL_SIZE : ENEMY_LARGE_SIZE;
    const letter = letterSet[Math.floor(Math.random() * letterSet.length)];

    // Random vibrant color
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5', '#FFFF33'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newEnemy: Enemy = {
      id: Math.random().toString(36).substr(2, 9),
      x: width + 50, // Spawn just outside
      y: Math.random() * (height - 100) + 50, // Avoid very top/bottom
      letter,
      size,
      color
    };

    gameStateRef.current.enemies.push(newEnemy);
  }, []);

  const update = useCallback((deltaTime: number) => {
    const state = gameStateRef.current;

    // Always update stars (background animation)
    state.stars.forEach(star => {
        star.x -= star.speed * (deltaTime / 16); // Normalise to frame roughly
        if (star.x < 0) {
            star.x = state.dimensions.width;
            star.y = Math.random() * state.dimensions.height;
        }
    });

    // Update Particles
    state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02; // Fade out
    });
    state.particles = state.particles.filter(p => p.life > 0);

    if (state.status !== 'PLAYING') return;

    // Update enemies
    const speed = ENEMY_SPEED_BASE * (1 + state.difficulty * 0.1); // Linear scaling

    // Move enemies
    state.enemies.forEach(enemy => {
      enemy.x -= speed * deltaTime;
    });

    // Check collisions with base
    const baseX = 50; // Hardcoded for now

    const enemiesToRemove: string[] = [];

    state.enemies.forEach(enemy => {
      if (enemy.x < baseX) {
        state.baseHealth = Math.max(0, state.baseHealth - 1);
        enemiesToRemove.push(enemy.id);

        // Trigger damage visual/sound here
        createExplosion(enemy.x, enemy.y, 'red');
        playSound('hit');

        if (state.baseHealth <= 0) {
            state.status = 'GAME_OVER';
            playSound('dead');
            pauseBgm();
            // Sync UI
            setUiState(prev => ({
                ...prev,
                status: 'GAME_OVER',
                baseHealth: 0
            }));
        } else {
             setUiState(prev => ({ ...prev, baseHealth: state.baseHealth }));
        }
      }
    });

    state.enemies = state.enemies.filter(e => !enemiesToRemove.includes(e.id));
  }, [pauseBgm, playSound, createExplosion]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Clear with semi-transparent black for trail effect? No, simple clear.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Stars
    ctx.fillStyle = 'white';
    state.stars.forEach(star => {
        ctx.globalAlpha = star.brightness;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw Particles
    state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    if (state.status !== 'IDLE') {
        // Draw Base
        if (castleImage) {
            ctx.drawImage(castleImage, 10, state.dimensions.height / 2 - 32, 64, 64);
        } else {
            ctx.fillStyle = 'blue';
            ctx.fillRect(10, state.dimensions.height / 2 - 25, 50, 50);
        }

        // Draw Base Health Shield/Aura if healthy
        if (state.baseHealth > 1) {
            ctx.strokeStyle = `rgba(0, 255, 0, ${state.baseHealth / state.baseMaxHealth})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(42, state.dimensions.height / 2, 40, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Draw Enemies
    state.enemies.forEach(enemy => {
        // Draw shape (Hexagon)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2;

        ctx.beginPath();
        const r = enemy.size; // Radius
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

        // Draw Letter
        ctx.fillStyle = '#FFF';
        ctx.font = `bold ${Math.floor(enemy.size * 1.2)}px Mono`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enemy.letter, enemy.x, enemy.y);

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = enemy.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
    });

    // Draw HUD (Debug/fps) - make it subtle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`FPS: ${state.fps}`, state.dimensions.width - 10, 20);
    ctx.textAlign = 'left'; // Reset

  }, [castleImage]);

  const loop = useCallback((time: number) => {
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;

    // FPS Calc
    gameStateRef.current.fps = Math.round(1000 / deltaTime);

    update(deltaTime);
    draw();

    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  // Initial Setup and Resize Listener
  useEffect(() => {
    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            gameStateRef.current.dimensions = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            // Re-init stars on resize to fill screen? Or just add more?
            // Simple: just keeping existing ones is fine, maybe add checks in update.
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
          baseHealth: BASE_INITIAL_HEALTH,
          enemies: [],
          difficulty: 1,
          particles: [] // Clear particles
      };
      // Keep stars

      setUiState({
          status: 'PLAYING',
          score: 0,
          highScore: gameStateRef.current.highScore,
          baseHealth: BASE_INITIAL_HEALTH,
          difficulty: 1,
          showLevelUp: false
      });
      playBgm();
  }, [playBgm]);

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

  // Spawner Interval (handled nicely with pause)
  useEffect(() => {
    const interval = setInterval(() => {
        if (gameStateRef.current.status === 'PLAYING') {
            spawnEnemy();
        }
    }, ENEMY_SPAWN_RATE_BASE / (uiState.difficulty || 1));
    return () => clearInterval(interval);
  }, [spawnEnemy, uiState.difficulty]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const char = e.key.toUpperCase();

        // Start Game
        if (gameStateRef.current.status === 'IDLE' || gameStateRef.current.status === 'GAME_OVER') {
            if (char === 'ENTER') {
                startGame();
            }
            return;
        }

        if (gameStateRef.current.status === 'PLAYING') {
            if (e.key === 'Escape') {
                togglePause();
                return;
            }

            // Find matching enemy
            // Prioritize closest? or first in list?
            // Original used first found.
            const enemyIndex = gameStateRef.current.enemies.findIndex(e => e.letter === char);
            if (enemyIndex !== -1) {
                const enemy = gameStateRef.current.enemies[enemyIndex];
                gameStateRef.current.enemies.splice(enemyIndex, 1);

                createExplosion(enemy.x, enemy.y, enemy.color);
                playSound('kill');

                // Update Score
                gameStateRef.current.score += SCORE_INCREMENT;
                if (gameStateRef.current.score > gameStateRef.current.highScore) {
                     gameStateRef.current.highScore = gameStateRef.current.score;
                     localStorage.setItem('dante-game-highscore', gameStateRef.current.highScore.toString());
                }

                // Difficulty scaling check (simple every 500 points for now?)
                let levelUp = false;
                if (gameStateRef.current.score % 50 === 0) { // Fast scaling for testing
                     const newDifficulty = Math.min(MAX_DIFFICULTY, gameStateRef.current.difficulty + 1);
                     if (newDifficulty > gameStateRef.current.difficulty) {
                         gameStateRef.current.difficulty = newDifficulty;
                         levelUp = true;
                     }
                }

                // Sync UI
                setUiState(prev => ({
                    ...prev,
                    score: gameStateRef.current.score,
                    highScore: gameStateRef.current.highScore,
                    difficulty: gameStateRef.current.difficulty,
                    showLevelUp: levelUp ? true : prev.showLevelUp
                }));

                if (levelUp) {
                    setTimeout(() => {
                        setUiState(prev => ({ ...prev, showLevelUp: false }));
                    }, 2000);
                }
            }
        } else if (gameStateRef.current.status === 'PAUSED') {
            if (e.key === 'Escape') {
                togglePause();
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, togglePause, playSound, createExplosion]);

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
