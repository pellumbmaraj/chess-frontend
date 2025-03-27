import React, { useContext, useState } from "react";
import ChessBoard from "../ChessBoard/ChessBoard";
import { FaArrowLeft } from "react-icons/fa";

import styles from "./PlayComp.module.css"
import NewGameModal from "./NewGameModal";
import UserContext from "../../context/Contexts/UserContext";
import OpponentContext from "../../context/Contexts/OpponentContext";

const PlayComp = ({data}) => {
    const user = useContext(UserContext);
    const [startGame, setStartGame] = useState(false);
    const [endGame, setEndGame] = useState(false);
    const [key, setKey] = useState(0);

    const newGame = () => {
        setKey(key + 1);
    }
        
    return (
        <>
        <div className={styles.playComputer}>
            <div className={styles.controllers}>
                <a href="/"><FaArrowLeft style={{ marginRight: "5px" }} />Home</a>
            </div>
            <div className={styles.playArea}>
                <div className={styles.board} key={key}>
                    <ChessBoard haveTimer={false} haveGameLog={false} />
                </div>
                <div className={styles.newGameModal}>
                    <NewGameModal newGame={newGame} />
                </div>
            </div>
        </div>
        </>
    );
};

export default PlayComp;