"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  BASE_WIDTH,
  BASE_HEIGHT,
  BASE_HEALTH,
  ENEMY_SPEED,
  ENEMY_SPAWN_RATE,
  MAX_DIFFICULTY,
  MIN_DIFFICULTY,
  SCORE_INCREMENT,
  ENEMY_SMALL_SIZE,
  ENEMY_LARGE_SIZE,
  initialGameState,
  GameState,
  Enemy,
  EASY_LETTERS,
  MEDIUM_LETTERS,
  HARD_LETTERS,
  serverSideState,
} from "./gameState";
import { getCastleImage } from "./castleSvg";

let gameState: GameState = initialGameState();
let gameOverOutside = false;
let currentLetterSet = EASY_LETTERS;

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setRender] = useState(0); // Dummy state to trigger re-renders
  const [gameOver, setGameOver] = useState(false);
  const [castleImage] = useState(
    typeof window === "undefined" ? null : getCastleImage()
  );

  const backgroundMusic = useRef<HTMLAudioElement | null>(null);
  const hitSound = useRef<HTMLAudioElement | null>(null);
  const killSound = useRef<HTMLAudioElement | null>(null);
  const deadSound = useRef<HTMLAudioElement | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (!gameOver) {
          // Draw the base
          context.drawImage(
            castleImage as CanvasImageSource,
            gameState.base.x - BASE_WIDTH / 2,
            gameState.base.y - BASE_HEIGHT / 2,
            BASE_WIDTH,
            BASE_HEIGHT
          );

          // Draw health bar
          context.fillStyle = "green";
          context.fillRect(
            gameState.base.x - BASE_WIDTH / 2,
            gameState.base.y - BASE_HEIGHT / 2 - 10,
            (BASE_WIDTH * gameState.base.health) / BASE_HEALTH,
            5
          );

          // Draw enemies
          context.fillStyle = "red";
          gameState.enemies.forEach((enemy) => {
            context.font = `${enemy.size}px Arial`;
            context.fillText(enemy.letter, enemy.x, enemy.y);
          });
        }

        // Draw score
        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText(`Score: ${gameState.score}`, 10, 30);

        // Draw difficulty
        context.fillText(`Difficulty: ${gameState.difficulty}`, 10, 60);

        // Draw current letter set
        context.fillText(`Letters: ${currentLetterSet.join(", ")}`, 10, 90);

        // Draw FPS
        context.fillText(
          `FPS: ${gameState.fps}`,
          gameState.dimensions.width - 100,
          30
        );

        // Draw game over screen
        if (gameOver) {
          context.fillStyle = "rgba(0, 0, 0, 0.5)";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = "white";
          context.font = "40px Arial";
          context.fillText(
            "Game Over",
            canvas.width / 2 - 100,
            canvas.height / 2 - 20
          );
          context.font = "20px Arial";
          context.fillText(
            `Score: ${gameState.score}`,
            canvas.width / 2 - 50,
            canvas.height / 2 + 20
          );
          context.fillText(
            "Press R to Restart",
            canvas.width / 2 - 100,
            canvas.height / 2 + 60
          );
        }
      }
    }
  }, [gameOver]);

  const updateGameState = useCallback(() => {
    if (!gameOverOutside && gameState.difficulty > 0) {
      gameState.enemies = gameState.enemies
        .map((enemy) => ({
          ...enemy,
          x: enemy.x - ENEMY_SPEED * gameState.difficulty,
        }))
        .filter((enemy) => {
          if (enemy.x < gameState.base.x) {
            gameState.base.health = Math.max(gameState.base.health - 1, 0);
            if (gameState.base.health === 0) {
              setGameOver(true);
              gameOverOutside = true;
              backgroundMusic.current?.pause();
              deadSound.current?.play();
              hitSound.current?.pause();
              killSound.current?.pause();
            }

            hitSound.current?.play();
            return false;
          }
          return true;
        });
      setRender((prev) => prev + 1); // Trigger re-render
    }
  }, [gameOver]);

  const resetGame = () => {
    gameState =
      typeof window === "undefined" ? serverSideState() : initialGameState();
    setGameOver(false);
    gameOverOutside = false;
    setRender((prev) => prev + 1); // Trigger re-render
    backgroundMusic.current?.play();
  };

  useEffect(() => {
    const handleResize = () => {
      gameState.dimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      gameState.base = {
        x: 50,
        y: window.innerHeight / 2,
        health: BASE_HEALTH,
      };
      setRender((prev) => prev + 1); // Trigger re-render
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const letter = event.key.toUpperCase();
      if (letter === "+") {
        gameState.difficulty = Math.min(
          gameState.difficulty + 1,
          MAX_DIFFICULTY
        );
      } else if (letter === "-") {
        gameState.difficulty = Math.max(
          gameState.difficulty - 1,
          MIN_DIFFICULTY
        );
      } else if (letter === "R" && gameOver) {
        resetGame();
      } else if (letter === "1") {
        currentLetterSet = EASY_LETTERS;
      } else if (letter === "2") {
        currentLetterSet = MEDIUM_LETTERS;
      } else if (letter === "3") {
        currentLetterSet = HARD_LETTERS;
      } else {
        const enemyIndex = gameState.enemies.findIndex(
          (enemy) => enemy.letter === letter
        );
        if (enemyIndex !== -1) {
          const enemy = gameState.enemies[enemyIndex];
          gameState.enemies.splice(enemyIndex, 1);
          gameState.score += SCORE_INCREMENT * (enemy.size / ENEMY_SMALL_SIZE);
          killSound.current?.play();
        }
      }
      setRender((prev) => prev + 1); // Trigger re-render
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [gameOver]);

  useEffect(() => {
    const spawnEnemies = () => {
      const size = Math.random() < 0.8 ? ENEMY_SMALL_SIZE : ENEMY_LARGE_SIZE;
      const newEnemy: Enemy = {
        x: gameState.dimensions.width - 50,
        y: Math.random() * gameState.dimensions.height,
        letter:
          currentLetterSet[Math.floor(Math.random() * currentLetterSet.length)],
        size,
      };
      gameState.enemies.push(newEnemy);
      setRender((prev) => prev + 1); // Trigger re-render
    };

    const interval = setInterval(
      spawnEnemies,
      ENEMY_SPAWN_RATE / (gameState.difficulty || 1)
    );
    return () => clearInterval(interval);
  }, [gameState.difficulty]);

  useEffect(() => {
    let lastFrameTime = performance.now();
    const updateFps = () => {
      const now = performance.now();
      const delta = now - lastFrameTime;
      gameState.fps = Math.round(1000 / delta);
      lastFrameTime = now;
      requestAnimationFrame(updateFps);
    };
    requestAnimationFrame(updateFps);
  }, []);

  useEffect(() => {
    const animationFrame = () => {
      if (!gameOver) {
        updateGameState();
      }
      draw();
      requestAnimationFrame(animationFrame);
    };
    requestAnimationFrame(animationFrame);
  }, [draw, updateGameState, gameOver]);

  useEffect(() => {
    backgroundMusic.current = new Audio("mega.mp3");
    hitSound.current = new Audio("hit.wav");
    killSound.current = new Audio("kill.wav");
    deadSound.current = new Audio("dead.wav");

    backgroundMusic.current.loop = true;
    backgroundMusic.current.volume = 0.3;

    const playAudio = () => {
      backgroundMusic.current?.play();
      document.removeEventListener("click", playAudio);
      document.removeEventListener("keypress", playAudio);
    };

    document.addEventListener("click", playAudio);
    document.addEventListener("keypress", playAudio);

    return () => {
      backgroundMusic.current?.pause();
      backgroundMusic.current = null;
      hitSound.current = null;
      killSound.current = null;
      deadSound.current = null;
      document.removeEventListener("click", playAudio);
    };
  }, []);

  return (
    <div className="h-full w-full bg-black">
      <canvas
        ref={canvasRef}
        width={gameState.dimensions.width}
        height={gameState.dimensions.height}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default Home;
