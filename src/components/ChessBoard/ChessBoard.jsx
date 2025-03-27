import React, { useState, useEffect, useContext, useRef } from "react";
import { Chessboard } from "react-chessboard";
import styles from './ChessBoard.module.css';
import { Chess } from "chess.js";
import Clock from "./Clock";
import UserContext from "../../context/Contexts/UserContext";
import OpponentContext from "../../context/Contexts/OpponentContext";
import { getSocket } from "../../utils";

const ChessBoard = ({ 
        haveTimer,
        onGameOver,
        haveGameLog,
    }) => {

    // Initial variables
    const [game, setGame] = useState(new Chess());
    const [moveLog, setMoveLog] = useState([]);
    const [capturedPiece, setCapturedPiece] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const movesPerRow = 2;
    const [stopTimer, setStopTimer] = useState(false);
    const [lock, setLock] = useState(true);
    // const [socket, setSocket] = useState(null);
    
    const { user } = useContext(UserContext);
    const { opponent, setOpponent } = useContext(OpponentContext);
    
    const orientation = {
        "w" : "white",
        "b" : "black"
    }
    const strength = {
        "beginner" : 1,
        "amateur" : 3,
        "medium" : 5,
        "hard" : 7
    }

    /**
     * Function to deconstruct the move string
     * @param {String} move - The move from the backend 
     * @returns {Object} - The move object { start, end, promotion(if there is one) } 
    */
    const deconstructMove = (move) => {
        if (move.length < 4 || move.length > 5) {
            throw new Error("Invalid move format");
        }
        
        return {
            start: move.slice(0, 2),  
            end: move.slice(2, 4),    
            promotion: move.length === 5 ? move[4] : null, 
        };
    };
    
    // Function to handle the timeout of a player
    const handleTimeout = (player) => {
        if (player === "me")
            onGameOver("defeat");
        else 
            onGameOver("victory");
    }

    // Function to make a move
    const makeMove = move => {
        // Create a copy of the game using the current FEN
        let gameCopy = new Chess(game.fen());
        let result = null;
    
        try {
            // Apply the move to the copied game
            result = gameCopy.move(move);
            
            // If move is valid, update the game state and perform necessary actions
            if (result) {
                setGame(gameCopy);           // Update game state
                setHasMoved(true);           // Flag to indicate a move has been made
    
                if (result.captured) {
                    setCapturedPiece(true); // Capture piece logic
                }
            }
        } catch (error) {
            console.error("Invalid move:", error);
        }
        
        return result;
    };

    /**
     * Function to lay out the logic to make a move
     * @param {String} sourceSquare - The source square
     * @param {String} targetSquare - The target square
     * @param {String} piece - If there is a promotion, this will be the promoted piece, otherwise just the moved piece
     * @returns {Boolean} - True if the move was correct, otherwise nothing
     */
    const onDrop = (sourceSquare, targetSquare, piece) => {
        // If the turn is the opponents' turn
        if (opponent.color !== orientation[game.turn()]) { // Otherwise, make a move as normal
            const move = makeMove({
                from: sourceSquare,
                to: targetSquare,
                promotion: piece[1].toLowerCase() ?? "q",
            });
            
            if (move === null) return;
        
            const socket = getSocket();

            socket.emit("move", {
                roomId: opponent.roomId,
                move: {
                    from: user.username,
                    start: sourceSquare,
                    end: targetSquare,
                    promotion: piece[1].toLowerCase() ?? "q",
                }
            });
        }
        
        return true;
    }
    
    /**
     * Function to play a sound
     * @param {String} sound - Path to the sound
     */
    const playSound = (sound) => {
        if (hasMoved) {
            const audio = new Audio(sound);
            audio.play();
        }
        
    }

    useEffect(() => {
        // If the game history is not 0, add to the game log
        if (game.history().length){
            setMoveLog(preItems => [...preItems, game.history()]);
        }
        
        if (!game.isGameOver()) {            
            if (game.history()) {
                if (game.inCheck())
                    playSound("/sounds/Check.mp3");
                else if(capturedPiece) {
                    playSound("/sounds/Capture.mp3");
                    setCapturedPiece(false);
                }
                else 
                    playSound("/sounds/Move.mp3");
                setHasMoved(false);
            }
        } else {
            if (game.history()){
                if (game.isCheckmate() && opponent.color !== orientation[game.turn()]) {
                    playSound("/sounds/Defeat.mp3");
                    onGameOver("defeat");
                } else {
                    playSound("/sounds/Victory.mp3");
                    onGameOver("victory");
                }

                if (game.isDraw()) {
                    playSound("/sounds/Draw.mp3");
                    onGameOver("draw");
                }
                setHasMoved(false);

                if (opponent.username !== "Computer") {
                    const socket = getSocket();
                    socket.emit("game-over", {roomId: opponent.roomId});
                }
            }
            setLock(false);
            setStopTimer(true);
        }
        
    }, [game]);

    useEffect(() => {
        if (opponent.username !== "Computer") {
            const socket = getSocket(); 
    
            socket.on("connect", () => {
                console.log("Connected with ID:", socket.id);
            });
        
            socket.on("welcome", (data) => {
                console.log("Server:", data.message);
            });
        
            return () => {
                socket.off("welcome");
            };
        }
    }, []);

    useEffect(() => {
        const socket = getSocket();
        socket.on("oppMove", data => {
            if (data.from !== user.username) {
                const result = makeMove({
                    from: data.start,
                    to: data.end,
                    promotion: data.promotion,
                });
            }
        });

        return () => {
            socket.off("oppMove");
        }
    }, [game]);

    const handleResign = e => {
        if (opponent.username !== "Computer") {
            const socket = getSocket();
            socket.emit("game-resign", {roomId: opponent.roomId});
        }

        onGameOver("defeat");
    }

    return (
        <>
        <div className={styles.container}>
            <div className={styles.gameContainer}>
                <div className={styles.oppclock}>
                    <Clock 
                        player={"opponent"} 
                        haveTimer={haveTimer} 
                        turn={opponent && opponent.color === orientation[game.turn()]} 
                        stopTimer={stopTimer} 
                        onTimeout={handleTimeout} />
                </div>
                <div className={styles.boardcontainer}>
                    <Chessboard 
                        onPieceDrop={onDrop} 
                        position={game.fen()} 
                        boardOrientation={opponent && opponent.color === "white" ? "black" : "white"}
                        arePiecesDraggable = {lock}
                    />
                </div>
                <div className={styles.myclock}>
                    <Clock 
                        player={"me"} 
                        haveTimer={haveTimer} 
                        turn={opponent && opponent.color !== orientation[game.turn()]} 
                        stopTimer={stopTimer}  
                        onTimeout={handleTimeout} />
                </div>
            </div>

            {haveGameLog && <div className={styles.gameLogContainer} id="gameLog">
                <p className={styles.gameLogTitle}>Game Log</p>
                <hr /> 
                <div className={styles.gameLogContent}>
                {moveLog.length > 0 && (
                <ul>
                    {Array.from({ length: Math.ceil(moveLog.length / movesPerRow) }).map((_, rowIndex) => {
                    const whiteMove = moveLog[rowIndex * movesPerRow]; // White's move
                    const blackMove = moveLog[rowIndex * movesPerRow + 1]; // Black's move (if exists)

                    return (
                        <li key={rowIndex} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ width: '45%' }}>{whiteMove}</span>
                        <span style={{ width: '45%' }}>{blackMove ? blackMove : ''}</span>
                        </li>
                    );
                    })}
                </ul>
                )}
                </div>
                <div className={styles.aboutGame}>
                    {!game.isGameOver() && <button className={styles.resignBtn} onClick={handleResign}>Resign</button>}
                </div>
            </div>}
        </div>
        </>
    );
};

export default ChessBoard;



