import React, { useContext, useEffect } from "react";
import UserContext from "../../context/Contexts/UserContext";
import { useNavigate, Navigate } from "react-router-dom";

const AllGames = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [allGames, setAllGames] = useState(null);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        if (!allGames) {
            fetch(`http://localhost:3000/games/${user.username}`, {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username: user.username }),
            })
            .then((res) => res.json())
            .then((data) => {
                setAllGames(data);
            })
            .catch((err) => {
                console.log(err);
            });
        }
    }, []);

    return (
        <>
        <h1>All Games</h1>
        </>
    );
}

export default AllGames;