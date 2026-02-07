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
  ENEMY_SPEED_BASE,
  ENEMY_SPAWN_RATE_BASE,
  SCORE_INCREMENT,
  ENEMY_SMALL_SIZE,
  ENEMY_LARGE_SIZE,
  MANA_REGEN_PER_SECOND
} from '../constants';
import { getCastleImage } from '../castleSvg';
import { useAudio } from './useAudio';
import { getAttackWordById } from '../data/words';
import { getEnemyTemplateById } from '../data/enemies';
import type { AttackWord } from '../types/combat';

export const useGameEngine = (
    levelConfig: LevelConfig,
    playerState: PlayerState,
    onGameEnd: (won: boolean, gold: number, killedEnemyIds: string[], sessionXp: number) => void
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
    sessionXp: 0,
    killCount: 0,
    timeElapsed: 0,
    highScore: 0, // Not really used in level mode but kept for compat
    difficulty: levelConfig.difficulty,
    baseHealth: playerState.maxHealth,
    baseMaxHealth: playerState.maxHealth,
    playerMana: playerState.maxMana,
    playerMaxMana: playerState.maxMana,
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
    playerMana: number;
    playerMaxMana: number;
    inputBuffer: string;
    cooldowns: Record<string, number>;
    targetName?: string;
    targetHealth?: number;
    targetMaxHealth?: number;
  }>({
    status: 'IDLE',
    score: 0,
    sessionGold: 0,
    baseHealth: playerState.maxHealth,
    killCount: 0,
    timeElapsed: 0,
    playerMana: playerState.maxMana,
    playerMaxMana: playerState.maxMana,
    inputBuffer: '',
    cooldowns: {}
  });

  const [castleImage, setCastleImage] = useState<HTMLImageElement | null>(null);

  // Keep track of killed enemies for quest updates
  const killedEnemiesRef = useRef<string[]>([]);
  const inputBufferRef = useRef<string>('');
  const cooldownsRef = useRef<Record<string, number>>({});

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
    if (levelConfig.enemyIds.length === 0) return;

    const size = Math.random() < 0.75 ? ENEMY_SMALL_SIZE : ENEMY_LARGE_SIZE;
    const enemyId = levelConfig.enemyIds[Math.floor(Math.random() * levelConfig.enemyIds.length)];
    const template = getEnemyTemplateById(enemyId);
    if (!template) return;

    const healthScale = 1 + difficulty * 0.2;
    const maxHealth = Math.round(template.maxHealth * healthScale);
    const baseGold = Math.max(1, Math.round(maxHealth / 12));

    const newEnemy: Enemy = {
      id: Math.random().toString(36).substr(2, 9),
      templateId: template.id,
      x: width + 50,
      y: Math.random() * (height - 100) + 50,
      name: template.name,
      attackWord: template.attackWord,
      chargeProgress: 0,
      chargeTimer: 0,
      chargeIntervalMs: template.chargeIntervalMs,
      size,
      color: template.color,
      spawnTime: performance.now(),
      maxHealth,
      health: maxHealth,
      baseXp: template.baseXp,
      baseGold
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
      state.sessionXp += enemy.baseXp;

      // Gold Logic (Simple: 1 gold per kill, + visual)
      state.sessionGold += enemy.baseGold;
      createExplosion(enemy.x, enemy.y, 'gold', 'GOLD');

      killedEnemiesRef.current.push(enemy.templateId);
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

      onGameEnd(won, state.sessionGold, killedEnemiesRef.current, state.sessionXp);
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

    // Mana regen
    state.playerMana = Math.min(
      state.playerMaxMana,
      state.playerMana + (MANA_REGEN_PER_SECOND * deltaTime) / 1000
    );

    // Enemy charge attacks
    state.enemies.forEach(enemy => {
        enemy.chargeTimer += deltaTime;
        while (enemy.chargeTimer >= enemy.chargeIntervalMs) {
            enemy.chargeTimer -= enemy.chargeIntervalMs;
            enemy.chargeProgress += 1;
            if (enemy.chargeProgress >= enemy.attackWord.length) {
                enemy.chargeProgress = 0;
                state.baseHealth = Math.max(0, state.baseHealth - 1);
                createExplosion(enemy.x, enemy.y, 'red');
                playSound('hit');
                if (state.baseHealth <= 0) {
                    endGame(false);
                }
            }
        }
    });

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
    const cooldowns = playerState.equippedWordIds.reduce<Record<string, number>>((acc, wordId) => {
        const word = getAttackWordById(wordId);
        if (!word) return acc;
        const lastUsed = cooldownsRef.current[wordId] ?? -Infinity;
        const remaining = Math.max(0, word.cooldownMs - (time - lastUsed));
        acc[wordId] = remaining;
        return acc;
    }, {});

    const target = state.enemies.reduce<Enemy | null>((closest, enemy) => {
        if (!closest) return enemy;
        return enemy.x < closest.x ? enemy : closest;
    }, null);

    setUiState(prev => ({
        ...prev,
        score: state.score,
        sessionGold: state.sessionGold,
        baseHealth: state.baseHealth,
        killCount: state.killCount,
        timeElapsed: Math.floor(state.timeElapsed),
        playerMana: Math.floor(state.playerMana),
        playerMaxMana: state.playerMaxMana,
        inputBuffer: inputBufferRef.current,
        cooldowns,
        targetName: target?.name,
        targetHealth: target?.health,
        targetMaxHealth: target?.maxHealth
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

        // Enemy name
        ctx.fillStyle = '#E2E8F0';
        ctx.font = `bold ${Math.floor(enemy.size * 0.6)}px Mono`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(enemy.name, enemy.x, enemy.y - enemy.size - 12);

        // Enemy health bar
        const healthWidth = enemy.size * 2;
        const healthX = enemy.x - healthWidth / 2;
        const healthY = enemy.y + enemy.size + 8;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(healthX, healthY, healthWidth, 6);
        ctx.fillStyle = '#34D399';
        ctx.fillRect(healthX, healthY, healthWidth * (enemy.health / enemy.maxHealth), 6);

        // Enemy charge word with progress
        const typed = enemy.attackWord.slice(0, enemy.chargeProgress);
        const remaining = enemy.attackWord.slice(enemy.chargeProgress);
        ctx.font = `bold ${Math.floor(enemy.size * 0.7)}px Mono`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(typed, enemy.x - ctx.measureText(remaining).width / 2, enemy.y);
        ctx.fillStyle = '#F8FAFC';
        ctx.fillText(remaining, enemy.x + ctx.measureText(typed).width / 2, enemy.y);

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
          sessionXp: 0,
          killCount: 0,
          timeElapsed: 0,
          baseHealth: playerState.maxHealth,
          baseMaxHealth: playerState.maxHealth,
          playerMana: playerState.maxMana,
          playerMaxMana: playerState.maxMana,
          enemies: [],
          particles: []
      };
      killedEnemiesRef.current = [];
      inputBufferRef.current = '';
      cooldownsRef.current = {};

      setUiState({
          status: 'PLAYING',
          score: 0,
          sessionGold: 0,
          killCount: 0,
          timeElapsed: 0,
          baseHealth: playerState.maxHealth,
          playerMana: playerState.maxMana,
          playerMaxMana: playerState.maxMana,
          inputBuffer: '',
          cooldowns: {}
      });
      playBgm();
  }, [playBgm, playerState.maxHealth, playerState.maxMana]);

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
        const char = e.key.toLowerCase();

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

            if (e.key === 'Backspace') {
                inputBufferRef.current = inputBufferRef.current.slice(0, -1);
                return;
            }

            if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
                const nextBuffer = `${inputBufferRef.current}${char}`;
                const equippedWords = playerState.equippedWordIds
                  .map(wordId => getAttackWordById(wordId))
                  .filter((word): word is AttackWord => Boolean(word));

                const matchingWords = equippedWords.filter(word => word.text.startsWith(nextBuffer));
                if (matchingWords.length === 0) {
                    const retryMatch = equippedWords.filter(word => word.text.startsWith(char));
                    inputBufferRef.current = retryMatch.length > 0 ? char : '';
                    return;
                }

                inputBufferRef.current = nextBuffer;

                const exactMatch = matchingWords.find(word => word.text === nextBuffer);
                if (exactMatch) {
                    const now = performance.now();
                    const lastUsed = cooldownsRef.current[exactMatch.id] ?? -Infinity;
                    const cooldownReady = now - lastUsed >= exactMatch.cooldownMs;
                    const hasMana = gameStateRef.current.playerMana >= exactMatch.manaCost;

                    if (!cooldownReady || !hasMana) {
                        return;
                    }

                    const targetIndex = gameStateRef.current.enemies.reduce<number | null>((closestIndex, enemy, index) => {
                        if (closestIndex === null) return index;
                        return enemy.x < gameStateRef.current.enemies[closestIndex].x ? index : closestIndex;
                    }, null);

                    if (targetIndex === null) {
                        return;
                    }

                    const target = gameStateRef.current.enemies[targetIndex];
                    cooldownsRef.current[exactMatch.id] = now;
                    gameStateRef.current.playerMana = Math.max(0, gameStateRef.current.playerMana - exactMatch.manaCost);
                    target.health = Math.max(0, target.health - exactMatch.damage);
                    createExplosion(target.x, target.y, exactMatch.type === 'MAGIC' ? '#38BDF8' : '#F59E0B');
                    playSound('hit');

                    if (target.health <= 0) {
                        killEnemy(targetIndex);
                    }

                    inputBufferRef.current = '';
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
  }, [startGame, togglePause, killEnemy, createExplosion, playSound, playerState.equippedWordIds]);

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
