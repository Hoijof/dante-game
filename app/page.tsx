"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface Enemy {
  x: number;
  y: number;
  letter: string;
}

const BASE_WIDTH = 50;
const BASE_HEIGHT = 50;
const BASE_HEALTH = 5;
const ENEMY_SPEED = 0.25;
const ENEMY_SPAWN_RATE = 4000;
const MAX_DIFFICULTY = 10;
const MIN_DIFFICULTY = 1;
const SCORE_INCREMENT = 10;
const FPS_UPDATE_INTERVAL = 1000;

const initialGameState = () => ({
  dimensions: { width: window.innerWidth, height: window.innerHeight },
  base: { x: 50, y: window.innerHeight / 2, health: BASE_HEALTH },
  enemies: [] as Enemy[],
  score: 0,
  difficulty: 1,
  fps: 0,
});

let gameState = initialGameState();

const castleSvg = `
  <svg width="${BASE_WIDTH}" height="${BASE_HEIGHT}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="30" width="10" height="20" fill="blue"/>
    <rect x="25" y="20" width="15" height="30" fill="blue"/>
    <rect x="45" y="30" width="10" height="20" fill="blue"/>
    <rect x="0" y="50" width="64" height="10" fill="blue"/>
    <rect x="20" y="10" width="5" height="10" fill="blue"/>
    <rect x="39" y="10" width="5" height="10" fill="blue"/>
  </svg>
`;

const img = new Image();
const svg = new Blob([castleSvg], {
  type: "image/svg+xml;charset=utf-8",
});

const url = URL.createObjectURL(svg);

img.src = url;
const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setRender] = useState(0); // Dummy state to trigger re-renders
  const [gameOver, setGameOver] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
          img,
          gameState.base.x - BASE_WIDTH / 2,
          gameState.base.y - BASE_HEIGHT / 2,
          BASE_WIDTH,
          BASE_HEIGHT
        );
        // Draw the base
        img.onload = () => {
          URL.revokeObjectURL(url);
        };

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
        context.font = "20px Arial";
        gameState.enemies.forEach((enemy) => {
          context.fillText(enemy.letter, enemy.x, enemy.y);
        });

        // Draw score
        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText(`Score: ${gameState.score}`, 10, 30);

        // Draw difficulty
        context.fillText(`Difficulty: ${gameState.difficulty}`, 10, 60);

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
          }
          return false;
        }
        return true;
      });
    setRender((prev) => prev + 1); // Trigger re-render
  }, []);

  const resetGame = () => {
    gameState = initialGameState();
    setGameOver(false);
    setRender((prev) => prev + 1); // Trigger re-render
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
      } else {
        const remainingEnemies = gameState.enemies.filter(
          (enemy) => enemy.letter !== letter
        );
        if (remainingEnemies.length < gameState.enemies.length) {
          gameState.score += SCORE_INCREMENT;
        }
        gameState.enemies = remainingEnemies;
      }
      setRender((prev) => prev + 1); // Trigger re-render
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [gameOver]);

  useEffect(() => {
    const spawnEnemies = () => {
      const newEnemy: Enemy = {
        x: gameState.dimensions.width - 50,
        y: Math.random() * gameState.dimensions.height,
        letter: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
      };
      gameState.enemies.push(newEnemy);
      setRender((prev) => prev + 1); // Trigger re-render
    };

    const interval = setInterval(
      spawnEnemies,
      ENEMY_SPAWN_RATE / gameState.difficulty
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
      updateGameState();
      draw();
      requestAnimationFrame(animationFrame);
    };
    requestAnimationFrame(animationFrame);
  }, [draw, updateGameState]);

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
