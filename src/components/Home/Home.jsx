import React, { useState, useContext, useEffect } from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/Contexts/UserContext";
import OpponentContext from "../../context/Contexts/OpponentContext";
import { getSocket } from "../../utils";
import Loading from "../Loading/Loading";
import LoginModal from "./LoginModal";

const Home = () => {
    const navigate = useNavigate();
    const user = useContext(UserContext);
    const opponent = useContext(OpponentContext);
    const [showModal, setShowModal] = useState(false);

    const [seconds, setSeconds] = useState(null);
    const [isRunning, setIsRunning] = useState(true);
    const [loading, setLoading] = useState(false);

    const closeModal = () => {
        setShowModal(false);
    }

    const handleClickGameType = (event) => {
        if (!user.user) {
            alert("You need to login to play online");
            setShowModal(true);
            return;
        }

        const buttonContent = event.target.textContent;
        opponent.setOpponent(null);
        const socket = getSocket();

        opponent.setOpponent(null);

        socket.emit("create-room", {
            user: user.user.username,
            gameType: buttonContent,
            rating: user.user.rating
        });

        setLoading(true);
        setIsRunning(true);
        setSeconds(60);
    }

    useEffect(() => {
        const socket = getSocket();

        socket.on("connect", () => {
            console.log("Connected with ID:", socket.id);
        });
    
        socket.on("welcome", (data) => {
            console.log("Server:", data.message);
        });

        socket.on("room-created", (data) => {
            setLoading(true);
            setIsRunning(true);
            setSeconds(60);
        });

        socket.on("play", data => {
            opponent.setOpponent({
                username: data.username,
                color: data.color,
                rating: data.rating,
                roomId: data.roomId,
                gameType: data.gameType,
            });

            navigate(`/play-multiplayer/${data.roomId}`);
        });
    
        return () => {
            socket.off("welcome");
            socket.off("room-created");
            socket.off("play");
        };
    }, []);

    useEffect(() => {
        if (!isRunning || !seconds) return;

        if (seconds > 0) {
            const timer = setInterval(() => {
                setSeconds((prevSeconds) => prevSeconds - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setIsRunning(false);
            setLoading(false);
            alert("Could not find an opponent");
        }
    }, [seconds, isRunning]);

    return (
        <>
        {loading && <Loading />}
        <div className={styles.homeContainer}>
            <div className={styles.homeArea}>
                <div className={styles.playOnline}>
                    <h2>Play Online</h2>
                    <div className={styles.selectMode}>
                        <button className={styles.playMultiButton} onClick={handleClickGameType}>1+1</button>
                        <button className={styles.playMultiButton} onClick={handleClickGameType}>2+0</button>
                        <button className={styles.playMultiButton} onClick={handleClickGameType}>2+1</button>
                        <button className={styles.playMultiButton} onClick={handleClickGameType}>3+0</button>
                        <button className={styles.playMultiButton} onClick={handleClickGameType}>3+2</button>
                        <button className={styles.playMultiButton} onClick={handleClickGameType}>5+0</button>
                        <button className={styles.playMultiButton} onClick={handleClickGameType}>10+0</button>
                    </div>
                </div>
            
            </div>
            <LoginModal showModal={showModal} closeModal={closeModal} />
        </div>
        </>
    );
};

export default Home;