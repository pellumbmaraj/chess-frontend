import React, { useState, useEffect, useContext } from "react";
import ChessBoard from "../ChessBoard/ChessBoard";

import styles from './PlayMulti.module.css';
import EndGameModal from "../EndGame/EndGameModal";
import { useNavigate, Navigate } from "react-router-dom";
import UserContext from "../../context/Contexts/UserContext";
import Loading from "../Loading/Loading";
import { getSocket } from "../../utils";
import OpponentContext from "../../context/Contexts/OpponentContext";

const PlayMulti = () => {

    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const opponent = useContext(OpponentContext);
    const [loading, setLoading] = useState(false);
    const [key, setKey] = useState(0);

    // Used to check the game state. If true, means game is starting. If false, means there is no game starting
    const [gameState, setGameState] = useState("game start");
    const [winner, setWinner] = useState("");
    
    const onGameOver = (winner) => {
        setGameState("game end");
        setWinner(winner);
        setTimeout(() => {
            opponent.setOpponent(null);
            navigate("/");
        }, 5000);
    }

    const newGame = (gameType) => {
        const socket = getSocket();

        socket.emit("create-room", {
            user: user.username,
            gameType: gameType,
            rating: user.rating,
        });

        setLoading(true);
    }

    if (!user && !opponent.opponent) {
        return <Navigate to="/" replace />; 
    }

    useEffect(() => {
        const socket = getSocket();

        socket.on("oppResign", () => {
            onGameOver("victory");
        });

        return () => {
            socket.off("oppResign");
        }
    }, []);

    return (
       <>
       {loading && <Loading />}
        <div className={styles.container} key={key}>
            <ChessBoard haveTimer={true} haveGameLog={true} onGameOver={onGameOver} />
            <EndGameModal gameEnd={gameState} winner={winner} newGame={newGame} />
        </div>
       </>
    );
}

export default PlayMulti;