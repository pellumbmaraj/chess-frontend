import React, { useContext, useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import OpponentContext from "../../context/Contexts/OpponentContext";

const EndGameModal = ({
    newGame,
    gameEnd,
    winner,
}) => {
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState("");
    const { opponent } = useContext(OpponentContext);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        if(gameEnd === "game end")
            handleShow();
    }, [gameEnd])

    useEffect(() => {
        if (winner) {
            if (winner === "victory") {
                setMessage("Congratulations! You won the game. You will be redirected to the home page.");
            } else if (winner === "defeat") {
                setMessage("You lost the game. Better luck next time. You will be redirected to the home page.");
            } else if (winner === "draw") {
                setMessage("The game ended in a draw. You will be redirected to the home page.");
            }
        }
    }, [winner])

    return (
        <>
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
            <Modal.Title>Game Results</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message}
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Close
            </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
};

export default EndGameModal;