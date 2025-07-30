import React, { useState, useEffect, useRef, useCallback } from "react";

// Game constants
const GRAVITY = 0.6;
const JUMP_POWER = 12;
const INITIAL_OBSTACLE_SPEED = 5;
const OBSTACLE_SPAWN_INTERVAL = 1500; // ms
const VR_HEADSET_CHANCE = 0.1; // 10% chance to spawn collectible
const INSANE_MODE_SPEED_MULTIPLIER = 1.7;
const GAME_WIDTH = 600;
const GAME_HEIGHT = 250;
const BIKE_WIDTH = 60;
const BIKE_HEIGHT = 40;
const BIKE_X = 80;

interface Obstacle {
  id: number;
  x: number;
  width: number;
  height: number;
  isCollectible: boolean;
  type: 'rock' | 'ramp' | 'vr';
}

export default function DirtBikeGame() {
  // Bike physics states
  const [bikeY, setBikeY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  // Game states
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [insaneMode, setInsaneMode] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  // Refs for animation frame access
  const velocityRef = useRef(velocity);
  const bikeYRef = useRef(bikeY);
  const obstaclesRef = useRef(obstacles);
  const gameOverRef = useRef(gameOver);
  const insaneModeRef = useRef(insaneMode);
  const scoreRef = useRef(score);
  const gameStartedRef = useRef(gameStarted);
  const animationFrameRef = useRef<number>();
  const lastSpawnTimeRef = useRef<number>(0);
  const gameSpeedRef = useRef(INITIAL_OBSTACLE_SPEED);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update refs when state changes
  useEffect(() => { velocityRef.current = velocity; }, [velocity]);
  useEffect(() => { bikeYRef.current = bikeY; }, [bikeY]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { insaneModeRef.current = insaneMode; }, [insaneMode]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { gameStartedRef.current = gameStarted; }, [gameStarted]);

  // Initialize audio (placeholder for sound effects)
  useEffect(() => {
    try {
      audioRef.current = new Audio();
      // audioRef.current.src = '/dirt-bike-sound.mp3'; // Add your sound file
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  // Start jump function
  const startJump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
    
    if (!isJumping && !gameOver && bikeY <= 2) {
      setIsJumping(true);
      setVelocity(JUMP_POWER);
    }
  }, [isJumping, gameOver, bikeY, gameStarted]);

  // Handle keyboard and click events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        startJump();
      }
    };

    const handleClick = () => {
      startJump();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClick);
    };
  }, [startJump]);

  // Collision detection function
  const checkCollision = useCallback((bike: { x: number; y: number; width: number; height: number }, obstacle: Obstacle): boolean => {
    return (
      bike.x < obstacle.x + obstacle.width &&
      bike.x + bike.width > obstacle.x &&
      bike.y < obstacle.height &&
      bike.y + bike.height > 0
    );
  }, []);

  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!gameStartedRef.current || gameOverRef.current) return;

    // Update bike physics
    setBikeY(prevY => {
      let newY = prevY + velocityRef.current;
      if (newY <= 0) {
        newY = 0;
        setIsJumping(false);
        setVelocity(0);
      }
      return newY;
    });

    setVelocity(prevVelocity => {
      if (bikeYRef.current > 0 || isJumping) {
        return prevVelocity - GRAVITY;
      }
      return 0;
    });

    // Calculate current game speed (increases over time)
    const speedMultiplier = insaneModeRef.current ? INSANE_MODE_SPEED_MULTIPLIER : 1;
    const difficultyIncrease = 1 + Math.floor(scoreRef.current / 10) * 0.2;
    gameSpeedRef.current = INITIAL_OBSTACLE_SPEED * speedMultiplier * difficultyIncrease;

    // Update obstacles
    setObstacles(prevObstacles => {
      let newObstacles = prevObstacles.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - gameSpeedRef.current
      })).filter(obstacle => obstacle.x + obstacle.width > -50);

      // Check collisions and scoring
      newObstacles.forEach(obstacle => {
        const bikeRect = {
          x: BIKE_X,
          y: bikeYRef.current,
          width: BIKE_WIDTH,
          height: BIKE_HEIGHT
        };

        if (checkCollision(bikeRect, obstacle)) {
          if (obstacle.isCollectible) {
            // Collect VR headset
            setScore(prevScore => prevScore + 50);
            newObstacles = newObstacles.filter(obs => obs.id !== obstacle.id);
          } else {
            // Hit obstacle - game over
            setGameOver(true);
            if (audioRef.current) {
              audioRef.current.pause();
            }
          }
        }

        // Score for passing obstacles
        if (!obstacle.isCollectible && obstacle.x + obstacle.width < BIKE_X && obstacle.x + obstacle.width > BIKE_X - gameSpeedRef.current) {
          setScore(prevScore => prevScore + 1);
        }
      });

      return newObstacles;
    });

    // Spawn new obstacles
    if (timestamp - lastSpawnTimeRef.current > OBSTACLE_SPAWN_INTERVAL / (insaneModeRef.current ? 1.5 : 1)) {
      const isCollectible = Math.random() < VR_HEADSET_CHANCE;
      const obstacleType = isCollectible ? 'vr' : (Math.random() > 0.5 ? 'rock' : 'ramp');
      
      const newObstacle: Obstacle = {
        id: timestamp + Math.random(),
        x: GAME_WIDTH,
        width: isCollectible ? 35 : (30 + Math.random() * 20),
        height: isCollectible ? 35 : (40 + Math.random() * 30),
        isCollectible,
        type: obstacleType
      };

      setObstacles(prev => [...prev, newObstacle]);
      lastSpawnTimeRef.current = timestamp;
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [checkCollision, isJumping]);

  // Start/stop game loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);

  // Restart game function
  const restartGame = useCallback(() => {
    setGameOver(false);
    setGameStarted(true);
    setObstacles([]);
    setScore(0);
    setBikeY(0);
    setVelocity(0);
    setIsJumping(false);
    lastSpawnTimeRef.current = 0;
    gameSpeedRef.current = INITIAL_OBSTACLE_SPEED;

    if (soundOn && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [soundOn]);

  // Toggle Insane Mode with flash effect
  const toggleInsaneMode = useCallback(() => {
    setInsaneMode(prev => {
      const newMode = !prev;
      if (newMode) {
        setFlashEffect(true);
        setTimeout(() => setFlashEffect(false), 200);
      }
      return newMode;
    });
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      const newSoundOn = !prev;
      if (audioRef.current) {
        if (newSoundOn && gameStarted && !gameOver) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
      return newSoundOn;
    });
  }, [gameStarted, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-900 rounded-lg max-w-4xl mx-auto">
      {/* Game Title and Controls */}
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-red-accent mb-4 font-serif">
          🏍️ Dirt Bike Jump Challenge
        </h2>
        
        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <button
            onClick={toggleInsaneMode}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
              insaneMode
                ? 'bg-red-accent text-white shadow-lg shadow-red-accent/25 animate-pulse'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            aria-label={`${insaneMode ? 'Disable' : 'Enable'} insane mode`}
          >
            {insaneMode ? '🔥 INSANE MODE' : '⚡ Insane Mode'}
          </button>
          
          <button
            onClick={toggleSound}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
              soundOn
                ? 'bg-white text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            aria-label={`${soundOn ? 'Mute' : 'Unmute'} sound`}
          >
            {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
        </div>

        {/* Score Display */}
        <div className="text-white text-xl font-semibold mb-2">
          Score: <span className="text-red-accent text-2xl font-mono">{score}</span>
        </div>

        {/* Instructions */}
        <p className="text-gray-300 text-sm md:text-base">
          Press <kbd className="bg-gray-700 px-2 py-1 rounded text-white font-mono text-xs">SPACEBAR</kbd> or tap to jump! 
          Collect 🥽 VR headsets for bonus points!
        </p>
      </div>

      {/* Game Area */}
      <div
        className={`relative bg-gradient-to-b from-gray-800 to-gray-900 border-4 border-red-accent rounded-lg overflow-hidden shadow-2xl cursor-pointer focus:outline-none focus:ring-4 focus:ring-red-accent focus:ring-opacity-50 transition-all duration-200 ${
          flashEffect ? 'bg-red-900' : ''
        }`}
        style={{
          width: `${GAME_WIDTH}px`,
          height: `${GAME_HEIGHT}px`,
          maxWidth: '100%',
          aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
        }}
        onClick={startJump}
        tabIndex={0}
        role="button"
        aria-label="Dirt bike game area - click or press spacebar to jump"
      >
        {/* Flash Effect Overlay */}
        {flashEffect && (
          <div className="absolute inset-0 bg-red-600 opacity-40 pointer-events-none animate-pulse" />
        )}

        {/* Ground Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-50" />

        {/* Dirt Bike */}
        <img
          id="bike"
          src="/images/dirtbike.png"
          alt="Dirt Bike"
          className="absolute z-10"
          style={{
            left: `${BIKE_X}px`,
            bottom: `${bikeY}px`,
            width: `${BIKE_WIDTH}px`,
            height: `${BIKE_HEIGHT}px`,
            transform: `rotate(${velocity < 0 ? -10 : velocity > 0 ? 10 : 0}deg)`,
            transition: 'transform 0.2s ease-out',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
            imageRendering: 'pixelated', // Preserve pixel art style
          }}
        />

        {/* Obstacles */}
        {obstacles.map((obstacle) => (
          <div
            key={obstacle.id}
            className={`absolute bottom-0 ${
              obstacle.isCollectible
                ? 'bg-blue-500 rounded-lg animate-pulse'
                : obstacle.type === 'rock'
                ? 'bg-gray-600 rounded-lg'
                : 'bg-gray-500 rounded-b-lg'
            } shadow-md border ${
              obstacle.isCollectible ? 'border-blue-400' : 'border-gray-400'
            }`}
            style={{
              left: `${obstacle.x}px`,
              width: `${obstacle.width}px`,
              height: `${obstacle.height}px`,
            }}
          >
            {obstacle.isCollectible && (
              <div className="flex items-center justify-center h-full text-2xl">
                🥽
              </div>
            )}
            {!obstacle.isCollectible && obstacle.type === 'rock' && (
              <div className="absolute inset-1 bg-gray-700 rounded opacity-50" />
            )}
          </div>
        ))}

        {/* Start Screen */}
        {!gameStarted && (
          <div className="absolute inset-0 bg-black bg-opacity-85 flex flex-col items-center justify-center text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4 text-red-accent">Ready to Ride?</h3>
              <p className="text-lg mb-2">🏍️ Jump over obstacles</p>
              <p className="text-lg mb-2">🥽 Collect VR headsets (+50 points)</p>
              <p className="text-lg mb-6">⚡ Try Insane Mode for extreme challenge!</p>
              <button
                onClick={startJump}
                className="bg-red-accent hover:bg-red-hover text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-accent focus:ring-opacity-50 shadow-lg"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center text-white">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-red-accent mb-4">Game Over!</h3>
              <p className="text-2xl mb-2">
                Final Score: <span className="text-red-accent font-bold font-mono">{score}</span>
              </p>
              <p className="text-gray-300 mb-6">
                {score < 10 
                  ? "Keep practicing, rider!" 
                  : score < 25 
                  ? "Nice jumping skills!" 
                  : score < 50
                  ? "Excellent performance!"
                  : score < 100
                  ? "You're getting good at this!"
                  : "Dirt bike legend! 🏆"}
              </p>
              <button
                onClick={restartGame}
                className="bg-red-accent hover:bg-red-hover text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-accent focus:ring-opacity-50 shadow-lg"
                autoFocus
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Game Stats */}
        {gameStarted && !gameOver && (
          <div className="absolute top-2 right-4 text-white text-sm font-mono bg-black bg-opacity-50 px-2 py-1 rounded">
            Speed: {Math.round(gameSpeedRef.current)}x
            {insaneMode && <span className="text-red-accent ml-2">🔥</span>}
          </div>
        )}
      </div>

      {/* Mobile Instructions */}
      <div className="mt-4 text-center text-gray-400 text-sm max-w-md">
        <p className="md:hidden">Tap the game area to jump over obstacles!</p>
        <p className="hidden md:block">
          Use <kbd className="bg-gray-700 px-1 rounded">SPACEBAR</kbd> or click to jump over obstacles
        </p>
      </div>
    </div>
  );
}