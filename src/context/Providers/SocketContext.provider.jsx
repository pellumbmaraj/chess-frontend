import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

import SocketContext from "../Contexts/SocketContext";

const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
        socketRef.current = io("https://chess-backend-1-q77l.onrender.com/", {
            transports: ["websocket"],
            reconnectionAttempts: 5, 
        });

        socketRef.current.on("connect", () => {
            console.log("Connected to socket:", socketRef.current.id);
        });

        socketRef.current.on("disconnect", () => {
            console.log("Disconnected from socket");
        });
    }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={socketRef.current}>
        {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);