import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import styles from '../Home/Home.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import OpponentContext from '../../context/Contexts/OpponentContext';

const NewGameModal = ({
    newGame
}) => {
    const [show, setShow] = useState(false);
    const [showButton, setShowButton] = useState(true);
    const opponent = useContext(OpponentContext);
    const navigate = useNavigate();

    const handleClose = () => {
        setShow(false);
        setShowButton(true);
    }
    const handleShow = () => {
        setShow(true);
        setShowButton(false);
    }

    const [formData, setFormData] = useState({
        color: "white",
        strength: "beginner",
        undoCheck: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        const oppColor = formData.color === "white" ? "black" : "white";

        opponent.setOpponent({
            username: "Computer",
            color: oppColor,
            strength: formData.strength,
            undo: formData.undoCheck,
            rating: 2100,
        });

        // console.log(formData)

        handleClose();
        newGame();
    }

  return (
    <>
        {showButton && <button className="btn btn-primary" onClick={handleShow}>
            Start New Game
        </button>}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            {/* Color Selection */}
            <div className={styles.colorSideContainer}>
                <p className={styles.title}>Select the color</p>
                <div id="colors" className={styles.colors}>
                        <input
                            name="color"
                            type="radio"
                            value="white"
                            id="white"
                            className={styles.colorSide}
                            onChange={handleChange}
                        />
                        <label htmlFor="white">White</label>

                        <input
                            name="color"
                            type="radio"
                            value="black"
                            id="black"
                            className={styles.colorSide}
                            onChange={handleChange}
                        />
                        <label htmlFor="black">Black</label>
                </div>
            </div>

            {/* Strength Selection */}
            <div className={styles.depthContainer}>
                <p className={styles.title}>Select the strength of the engine</p> 
                <div className={styles.strengthContainer}>
                    <select
                        name="strength"
                        id="strength"
                        className={styles.strength}
                        value={formData.strength}
                        onChange={handleChange}
                    >
                        <option value="beginner">Beginner</option>
                        <option value="amateur">Amateur</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Undo Moves */}
            <div className={styles.undoContainer}>
                    <input
                        type="checkbox"
                        className={styles.undoCheck}
                        name="undoCheck"
                        id="undoCheck"
                        checked={formData.undoCheck}
                        onChange={handleChange}
                    />
                    <label htmlFor="undoCheck" className={styles.undoContent}>Undo moves?</label>
            </div>

            {/* Submit Button */}
            <button className={styles.submitBtn} type="submit">Start the game</button>
        </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NewGameModal;