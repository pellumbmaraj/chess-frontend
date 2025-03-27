import React, { useEffect } from "react";

import OpponentContext from "../Contexts/OpponentContext";

const OpponentProvider = ({ children }) => {
    const [opponent, setOpponent] = React.useState(() => {
        const storedOpponent = localStorage.getItem("opponent");
        return storedOpponent ? JSON.parse(storedOpponent) : null;
    });

    useEffect(() => {
        if (opponent) {
            localStorage.setItem("opponent", JSON.stringify(opponent));
        } else {
            localStorage.removeItem("opponent");
        }
    }, [opponent]);

    return (
        <OpponentContext.Provider value={{ opponent, setOpponent }}>
            {children}
        </OpponentContext.Provider>
    );
}

export default OpponentProvider;