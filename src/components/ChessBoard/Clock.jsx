import React, { useState, useEffect, useContext } from "react";
import styles from "./Clock.module.css";
import UserContext from "../../context/Contexts/UserContext";
import OpponentContext from "../../context/Contexts/OpponentContext";

const Clock = ({ 
    turn, 
    initialTime, 
    stopTimer,
    onTimeout,
    playerInfo, 
    player, 
    haveTimer,
}) => {
    const user = useContext(UserContext);
    const opponent = useContext(OpponentContext);

    const parseTimeControl = (timeControl) => {
        const [minutes, increment] = timeControl.split("+").map(Number);
        return { baseTime: minutes * 60, increment }; // Convert minutes to seconds
    };

    const { baseTime, increment } = opponent?.opponent?.gameType
        ? parseTimeControl(opponent.opponent.gameType)
        : { baseTime: null, increment: null };
    const [timeLeft, setTimeLeft] = useState(baseTime);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        let timer;

        if (!stopTimer && turn && isRunning && baseTime !== null) {
            // Start the timer countdown
            timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    const newTime = Math.max(prevTime - 1, 0);
                    if (newTime === 0) {
                        clearInterval(timer);
                        if (onTimeout) onTimeout(player);
                    }
                    return newTime;
                });
            }, 1000);
        }

        // Cleanup timer on component unmount or turn change
        return () => clearInterval(timer);
    }, [turn, isRunning, onTimeout, stopTimer]);

    useEffect(() => {
        setTimeLeft(baseTime);
    }, [baseTime]);

    useEffect(() => {
        setTimeLeft((prevTime) => prevTime + increment);
    }, [turn]);

    // Format the time in MM:SS format
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <>
        <div className={styles.container}>
            {haveTimer && <div className={styles.clock}>
                <p>{formatTime(timeLeft)}</p>
            </div>}
            <div className={styles.playerInfo}>
                <p className={styles.playerUsername}>{player === "me" ? user.user.username : opponent.opponent.username}</p>
                <p className={styles.playerRating}>{player === "me" ? user.user.rating : opponent.opponent.rating}</p>
            </div>
        </div>
        </>
    );
};

export default Clock;
