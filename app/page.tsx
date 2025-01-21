"use client";
import { useEffect, useRef, useState } from "react";

interface Enemy {
  x: number;
  y: number;
  letter: string;
}

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [base, setBase] = useState({ x: 50, y: window.innerHeight / 2 });
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      setBase({ x: 50, y: window.innerHeight / 2 });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const context = canvas.getContext("2d");
      if (context) {
        // Draw the base
        context.fillStyle = "blue";
        context.fillRect(base.x - 25, base.y - 25, 50, 50);

        // Draw enemies
        context.fillStyle = "red";
        context.font = "20px Arial";
        enemies.forEach((enemy) => {
          context.fillText(enemy.letter, enemy.x, enemy.y);
        });
      }
    }
  }, [dimensions, base, enemies]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnemies((prevEnemies) =>
        prevEnemies
          .map((enemy) => ({ ...enemy, x: enemy.x - 5 }))
          .filter((enemy) => enemy.x > 0)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const letter = event.key.toUpperCase();
      setEnemies((prevEnemies) =>
        prevEnemies.filter((enemy) => enemy.letter !== letter)
      );
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEnemy: Enemy = {
        x: dimensions.width - 50,
        y: Math.random() * dimensions.height,
        letter: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
      };
      setEnemies((prevEnemies) => [...prevEnemies, newEnemy]);
    }, 2000);

    return () => clearInterval(interval);
  }, [dimensions]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default Home;
