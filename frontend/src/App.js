import React, { useState } from "react";
import "./App.css";
import axios from "axios"; // Import axios

const inputStyles = "border rounded py-1 px-2";
const buttonStyles = "bg-blue-500 text-white py-1 px-3 rounded";

const App = () => {
    const [playerName, setPlayerName] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [players, setPlayers] = useState([]);

    const createGameSession = async () => {
        try {
            const response = await axios.post("/createGameSession", { playerName });
            setSessionId(response.data.id);
            setPlayers(response.data.players);
        } catch (error) {
            console.error("Error creating game session:", error);
        }
    };

    const joinGameSession = async () => {
        try {
            const response = await axios.post("/joinGameSession", { sessionId, playerName });
            // Handle the response and game logic as needed
        } catch (error) {
            console.error("Error joining game session:", error);
        }
    };

    return (
        <div className="bg-gray-200 h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Multiplayer Gaming Platform</h1>
            <div className="mb-4">
                <label htmlFor="playerName" className="mr-2">
                    Enter your name:
                </label>
                <input
                    type="text"
                    id="playerName"
                    className={inputStyles}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
                <button onClick={createGameSession} className={`${buttonStyles} ml-2`}>
                    Create Game
                </button>
            </div>
            {sessionId && (
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">Game Session</h2>
                    <p className="mb-1">Session ID: {sessionId}</p>
                    <p className="mb-4">Players: {players.join(", ")}</p>
                    {/* Add the game board and other elements here */}
                </div>
            )}
        </div>
    );
};

export default App;
