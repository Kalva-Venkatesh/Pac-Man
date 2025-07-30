import React, { useState, useEffect, useCallback, useRef } from 'react';
import './output.css';

// Constants for game elements and colors
const CELL_SIZE = 30; // Size of each cell in pixels
const GAME_WIDTH = 21; // Number of cells wide
const GAME_HEIGHT = 23; // Number of cells high (standard Pac-Man board size)

// Game states
const GAME_STATE = {
    READY: 'READY',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER',
    WIN: 'WIN',
};

// Difficulty settings for ghost speed (interval in ms)
const DIFFICULTY_SPEEDS = {
    EASY: 400,
    MEDIUM: 300,
    HARD: 200,
};

// Map 1: Original Map
const map1 = {
    board: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
        [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
        [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
        [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
        [0,0,0,0,1,2,1,0,1,1,4,1,1,0,1,2,1,0,0,0,0], // Ghost house entrance (4)
        [1,1,1,1,1,2,1,0,1,0,0,0,1,0,1,2,1,1,1,1,1],
        [1,2,2,2,2,2,2,0,1,0,0,0,1,0,2,2,2,2,2,2,1],
        [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
        [0,0,0,0,1,2,1,0,1,1,1,1,1,0,1,2,1,0,0,0,0],
        [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
        [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
        [1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1,1],
        [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    pacManStart: { x: 10, y: 17 },
    ghostStart: { x: 10, y: 10 }
};

// Map 2: More Enclosed
const map2 = {
    board: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2,1],
        [1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1],
        [1,2,1,2,1,2,2,2,1,2,1,2,1,2,2,2,1,2,1,2,1],
        [1,2,1,2,1,2,1,2,1,2,2,2,1,2,1,2,1,2,1,2,1],
        [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
        [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
        [0,0,0,0,1,2,1,0,1,1,4,1,1,0,1,2,1,0,0,0,0],
        [1,1,1,1,1,2,1,0,1,0,0,0,1,0,1,2,1,1,1,1,1],
        [1,2,2,2,2,2,2,0,1,0,0,0,1,0,2,2,2,2,2,2,1],
        [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
        [0,0,0,0,1,2,1,0,1,1,1,1,1,0,1,2,1,0,0,0,0],
        [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
        [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
        [1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1,1],
        [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    pacManStart: { x: 10, y: 17 },
    ghostStart: { x: 10, y: 10 }
};

// Map 3: Open Center
const map3 = {
    board: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,1],
        [1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1],
        [1,2,1,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,1,2,1],
        [1,2,1,2,1,2,1,1,1,0,1,0,1,1,1,2,1,2,1,2,1],
        [1,2,1,2,1,2,1,0,0,0,0,0,0,0,1,2,1,2,1,2,1],
        [1,2,1,2,1,2,1,0,1,1,4,1,1,0,1,2,1,2,1,2,1],
        [1,2,1,2,1,2,1,0,1,0,0,0,1,0,1,2,1,2,1,2,1],
        [1,2,1,2,1,2,2,0,1,0,0,0,1,0,2,2,1,2,1,2,1],
        [1,2,1,2,1,1,1,0,1,1,1,1,1,0,1,1,1,2,1,2,1],
        [1,2,1,2,2,2,2,0,0,0,0,0,0,0,2,2,2,2,1,2,1],
        [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
        [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
        [1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1,1],
        [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    pacManStart: { x: 10, y: 17 },
    ghostStart: { x: 10, y: 10 }
};


const MAPS = {
    'Map 1': map1,
    'Map 2': map2,
    'Map 3': map3,
};


// Helper to create a deep copy of the board
const createBoard = (selectedMap) => selectedMap.board.map(row => [...row]);

// Component for a single cell on the game board
const Cell = ({ type }) => {
    let content = null;
    let bgColor = 'bg-gray-900'; // Default background for path/empty

    switch (type) {
        case 1: // Wall
            bgColor = 'bg-blue-900';
            break;
        case 2: // Dot
            content = <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>;
            break;
        case 3: // Empty path (eaten dot)
            bgColor = 'bg-gray-900';
            break;
        case 4: // Ghost house entrance (visually like a path)
            bgColor = 'bg-gray-900';
            break;
        default: // 0 = empty path
            bgColor = 'bg-gray-900';
            break;
    }

    return (
        <div
            className={`flex items-center justify-center ${bgColor}`}
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
        >
            {content}
        </div>
    );
};

// Component for Pac-Man
const PacMan = ({ position, direction }) => {
    // Rotate Pac-Man based on direction
    let rotation = 'rotate-0';
    switch (direction) {
        case 'RIGHT': rotation = 'rotate-0'; break;
        case 'LEFT': rotation = 'rotate-180'; break;
        case 'UP': rotation = '-rotate-90'; break;
        case 'DOWN': rotation = 'rotate-90'; break;
        default: break;
    }

    return (
        <div
            className="absolute z-10"
            style={{
                left: position.x * CELL_SIZE,
                top: position.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
            }}
        >
            {/* Pac-Man SVG - simple circle with a mouth */}
            <svg viewBox="0 0 100 100" className={`w-full h-full ${rotation}`}>
                <circle cx="50" cy="50" r="45" fill="yellow" />
                <polygon points="50,50 100,25 100,75" fill="black" /> {/* Mouth */}
            </svg>
        </div>
    );
};

// Component for a Ghost
const Ghost = ({ position, color }) => {
    return (
        <div
            className="absolute z-10"
            style={{
                left: position.x * CELL_SIZE,
                top: position.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
            }}
        >
            {/* Ghost SVG - simple shape */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                    d="M 10 50 C 10 20, 90 20, 90 50 L 90 80 L 80 70 L 70 80 L 60 70 L 50 80 L 40 70 L 30 80 L 20 70 L 10 80 Z"
                    fill={color}
                />
                {/* Eyes */}
                <circle cx="35" cy="40" r="10" fill="white" />
                <circle cx="65" cy="40" r="10" fill="white" />
                <circle cx="35" cy="45" r="5" fill="blue" />
                <circle cx="65" cy="45" r="5" fill="blue" />
            </svg>
        </div>
    );
};

// Main App component
export default function App() {
    const [currentMapName, setCurrentMapName] = useState('Map 1'); // New state for current map
    const selectedMapData = MAPS[currentMapName];

    const [board, setBoard] = useState(createBoard(selectedMapData));
    const [pacManPos, setPacManPos] = useState(selectedMapData.pacManStart);
    const [pacManDirection, setPacManDirection] = useState('RIGHT'); // Initial direction
    const [ghostPos, setGhostPos] = useState(selectedMapData.ghostStart);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameState, setGameState] = useState(GAME_STATE.READY);
    const [message, setMessage] = useState('');
    const [difficulty, setDifficulty] = useState('EASY'); // State for difficulty

    const gameIntervalRef = useRef(null);
    const ghostIntervalRef = useRef(null);

    // Function to reset the game
    const resetGame = useCallback(() => {
        const newMapData = MAPS[currentMapName];
        setBoard(createBoard(newMapData));
        setPacManPos(newMapData.pacManStart);
        setPacManDirection('RIGHT');
        setGhostPos(newMapData.ghostStart);
        setScore(0);
        setLives(3);
        setGameState(GAME_STATE.READY);
        setMessage('Press any arrow key to start!');
        if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
        if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current);
    }, [currentMapName]); // Dependency on currentMapName

    // Game initialization on component mount or map change
    useEffect(() => {
        resetGame();
    }, [resetGame, currentMapName]); // Re-run resetGame if currentMapName changes

    // Function to move Pac-Man
    const movePacMan = useCallback((dx, dy) => {
        setPacManPos(prevPos => {
            let newX = prevPos.x + dx;
            let newY = prevPos.y + dy;

            // Handle wrapping around the board (tunnels)
            if (newX < 0) newX = GAME_WIDTH - 1;
            if (newX >= GAME_WIDTH) newX = 0;

            // Check for wall collision
            if (board[newY] && board[newY][newX] !== 1) {
                // Eat dot if present
                if (board[newY][newX] === 2) {
                    setScore(prevScore => prevScore + 10);
                    setBoard(prevBoard => {
                        const newBoard = [...prevBoard.map(row => [...row])];
                        newBoard[newY][newX] = 3; // Mark as empty path
                        return newBoard;
                    });
                }
                return { x: newX, y: newY };
            }
            return prevPos; // Stay in place if it's a wall
        });
    }, [board]);

    // Function to move Ghost (simple random movement for now)
    const moveGhost = useCallback(() => {
        setGhostPos(prevPos => {
            const possibleMoves = [];
            // Check UP
            if (prevPos.y > 0 && board[prevPos.y - 1][prevPos.x] !== 1) possibleMoves.push({ x: prevPos.x, y: prevPos.y - 1 });
            // Check DOWN
            if (prevPos.y < GAME_HEIGHT - 1 && board[prevPos.y + 1][prevPos.x] !== 1) possibleMoves.push({ x: prevPos.x, y: prevPos.y + 1 });
            // Check LEFT
            if (prevPos.x > 0 && board[prevPos.y][prevPos.x - 1] !== 1) possibleMoves.push({ x: prevPos.x - 1, y: prevPos.y });
            // Check RIGHT
            if (prevPos.x < GAME_WIDTH - 1 && board[prevPos.y][prevPos.x + 1] !== 1) possibleMoves.push({ x: prevPos.x + 1, y: prevPos.y });

            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                return randomMove;
            }
            return prevPos;
        });
    }, [board]);

    // Game loop for Pac-Man and Ghost movement
    useEffect(() => {
        if (gameState === GAME_STATE.PLAYING) {
            // Clear any existing ghost interval
            if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current);

            // Set ghost movement interval based on difficulty
            const ghostSpeed = DIFFICULTY_SPEEDS[difficulty];
            ghostIntervalRef.current = setInterval(() => {
                moveGhost();
            }, ghostSpeed);
        } else {
            if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current);
        }

        return () => {
            if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current);
        };
    }, [gameState, moveGhost, difficulty]); // Add difficulty to dependencies

    // Collision detection
    useEffect(() => {
        if (gameState === GAME_STATE.PLAYING) {
            if (pacManPos.x === ghostPos.x && pacManPos.y === ghostPos.y) {
                setLives(prevLives => prevLives - 1);
                // Reset Pac-Man and Ghost position after collision
                setPacManPos(selectedMapData.pacManStart); // Use selected map's start pos
                setGhostPos(selectedMapData.ghostStart); // Use selected map's start pos
                setMessage('You got caught!');
                setTimeout(() => setMessage(''), 1000); // Clear message after a short delay
            }
        }
    }, [pacManPos, ghostPos, gameState, selectedMapData]); // Add selectedMapData to dependencies

    // Check for game over or win
    useEffect(() => {
        if (lives <= 0 && gameState === GAME_STATE.PLAYING) {
            setGameState(GAME_STATE.GAME_OVER);
            setMessage('Game Over! You ran out of lives.');
            if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
            if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current);
        }

        // Check if all dots are eaten (excluding walls, empty paths, ghost house entrance)
        const remainingDots = board.flat().filter(cell => cell === 2).length;
        if (remainingDots === 0 && gameState === GAME_STATE.PLAYING) {
            setGameState(GAME_STATE.WIN);
            setMessage('Congratulations! You ate all the dots!');
            if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
            if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current);
        }
    }, [lives, board, gameState]);

    // Keyboard input handler for Pac-Man movement
    const handleKeyDown = useCallback((e) => {
        if (gameState === GAME_STATE.READY) {
            setGameState(GAME_STATE.PLAYING);
            setMessage('');
        }
        if (gameState !== GAME_STATE.PLAYING) return;

        let dx = 0;
        let dy = 0;
        let newDirection = pacManDirection;

        switch (e.key) {
            case 'ArrowUp':
                dy = -1;
                newDirection = 'UP';
                break;
            case 'ArrowDown':
                dy = 1;
                newDirection = 'DOWN';
                break;
            case 'ArrowLeft':
                dx = -1;
                newDirection = 'LEFT';
                break;
            case 'ArrowRight':
                dx = 1;
                newDirection = 'RIGHT';
                break;
            default:
                return;
        }
        e.preventDefault(); // Prevent default arrow key scrolling
        setPacManDirection(newDirection);
        movePacMan(dx, dy);
    }, [gameState, pacManDirection, movePacMan]);

    // Attach and detach keyboard listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const handleDifficultyChange = (newDifficulty) => {
        setDifficulty(newDifficulty);
        resetGame(); // Reset game when difficulty changes
    };

    const handleMapChange = (newMapName) => {
        setCurrentMapName(newMapName);
        // resetGame will be called by the useEffect when currentMapName changes
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 font-inter">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
               
                body {
                    font-family: 'Inter', sans-serif;
                }
                .game-container {
                    border: 4px solid #3b82f6; /* Blue border */
                    box-shadow: 0 0 20px rgba(0, 128, 255, 0.7); /* Blue glow */
                    border-radius: 15px;
                    overflow: hidden;
                    background-color: #1a202c; /* Darker background for the game area */
                }
                .game-button {
                    background: linear-gradient(145deg, #4CAF50, #2E8B57); /* Green gradient */
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                }
                .game-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4);
                }
                .game-button:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                .difficulty-button, .map-button {
                    background-color: #3b82f6; /* Blue */
                    color: white;
                    padding: 8px 15px;
                    border-radius: 8px;
                    margin: 0 5px;
                    cursor: pointer;
                    transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    font-weight: bold;
                }
                .difficulty-button.active, .map-button.active {
                    background-color: #2563eb; /* Darker blue when active */
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
                }
                .difficulty-button:hover:not(.active), .map-button:hover:not(.active) {
                    background-color: #60a5fa; /* Lighter blue on hover */
                }
                `}
            </style>

            <h1 className="text-5xl font-bold mb-8 text-yellow-400 drop-shadow-lg">
                Pac-Man React
            </h1>

            <div className="flex flex-col items-center mb-6">
                <div className="text-2xl font-bold mb-2">Score: {score}</div>
                <div className="text-2xl font-bold">Lives: {lives}</div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-4 flex space-x-4">
                <span className="text-xl font-semibold mr-2">Difficulty:</span>
                {Object.keys(DIFFICULTY_SPEEDS).map(mode => (
                    <button
                        key={mode}
                        className={`difficulty-button ${difficulty === mode ? 'active' : ''}`}
                        onClick={() => handleDifficultyChange(mode)}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            {/* Map Selection */}
            <div className="mb-6 flex space-x-4">
                <span className="text-xl font-semibold mr-2">Map:</span>
                {Object.keys(MAPS).map(mapName => (
                    <button
                        key={mapName}
                        className={`map-button ${currentMapName === mapName ? 'active' : ''}`}
                        onClick={() => handleMapChange(mapName)}
                    >
                        {mapName}
                    </button>
                ))}
            </div>


            {message && (
                <div className="text-yellow-300 text-2xl font-semibold mb-4 animate-pulse">
                    {message}
                </div>
            )}

            <div
                className="game-container relative"
                style={{
                    width: GAME_WIDTH * CELL_SIZE,
                    height: GAME_HEIGHT * CELL_SIZE,
                }}
            >
                {/* Render the game board */}
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                        {row.map((cellType, colIndex) => (
                            <Cell key={`${rowIndex}-${colIndex}`} type={cellType} />
                        ))}
                    </div>
                ))}

                {/* Render Pac-Man */}
                <PacMan position={pacManPos} direction={pacManDirection} />

                {/* Render Ghost */}
                <Ghost position={ghostPos} color="red" />
            </div>

            {(gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN) && (
                <button
                    onClick={resetGame}
                    className="game-button mt-8"
                >
                    Play Again
                </button>
            )}

            {gameState === GAME_STATE.READY && (
                 <p className="text-lg text-gray-400 mt-4">Use Arrow Keys to Move</p>
            )}
        </div>
    );
}

