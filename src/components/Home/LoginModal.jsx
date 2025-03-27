import React, { useContext, useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import UserContext from "../../context/Contexts/UserContext";
import styles from "./LoginModal.module.css";

const LoginModal = ({
    showModal,
    closeModal,
}) => {
    const [show, setShow] = useState(false);
    const [username, setUsername] = useState("");
    const { user, setUser } = useContext(UserContext);

    const handleClose = () => {
        setShow(false);
        if (username !== "") {
            setUser({
                username,
                rating: 1000,
            });
        }
        closeModal();
    };

    useEffect(() => {
        setShow(showModal);
    }, [showModal]);

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
            <Modal.Title>Register</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <input
                    type="text"
                    name="username"
                    id="username"
                    className={styles.username}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                />
            </Modal.Body>
            <Modal.Footer>
            <Button variant="success" onClick={handleClose}>
                Enter
            </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default LoginModal;