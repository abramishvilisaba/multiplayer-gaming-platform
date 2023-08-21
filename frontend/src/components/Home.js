import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
// const socketIo = require("socket.io/client-dist");
const apiURL = process.env.REACT_APP_API_URL || "http://localhost:3000";
const socket = io(apiURL);
console.log(apiURL);

const Home = () => {
    const navigate = useNavigate();

    const [playerName, setPlayerName] = useState("");
    const [roomId, setRoomId] = useState(null);
    const [session, setSession] = useState(null);
    const [players, setPlayers] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const createOrJoinGame = () => {
        console.log("createOrJoinGame");
        if (roomId === null && playerName.length > 0) {
            socket.emit("createOrJoinGame", { playerName });
            // setRoomId(1);
        }
        socket.on("gameSessionCreated", (session) => {
            console.log("gameSessionCreated", session.id);
            setRoomId(session.id);
            setErrorMessage("");
        });
        socket.on("playerJoined", (session) => {
            console.log("playerJoined", session.id);
            setRoomId(session.id);
            socket.emit("getSessionInfo", { roomId });
            setErrorMessage("");
        });
        socket.emit("getSessionInfo", { roomId });
        socket.on("returnSessionInfo", (session) => {
            console.log("playerJoined", session);
            setSession(session);
            console.log(session);
        });
    };
    console.log("session", session);
    useEffect(() => {
        if (!session) {
            socket.emit("getSessionInfo", { roomId });
        }
        if (session) {
            if (session.players.length > 1) {
                navigate("/tiktaktoe", {
                    state: { id: roomId, name: playerName, session: session },
                });
            }
        }
        socket.on("playerAlreadyJoined", (session) => {
            console.log("playerAlreadyJoined", session);
            setErrorMessage("playerAlreadyJoined");
        });
    }, [roomId, session]);

    const inputStyles = "border rounded py-1 px-2";
    const buttonStyles = "bg-blue-500 text-white py-1 px-3 rounded";

    return (
        <div className="bg-gray-200 h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-8">Multiplayer Gaming Platform</h1>
            <div className="mb-4">
                {errorMessage}
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
                {!roomId ? (
                    <button onClick={createOrJoinGame} className={`${buttonStyles} ml-2`}>
                        Create Game
                    </button>
                ) : null}
            </div>
            {session ? (
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">Game Session</h2>
                    <p className="mb-1">Session ID: {session.id}</p>
                    <p className="mb-4">Players: {session.players.join(", ")}</p>
                </div>
            ) : null}
        </div>
    );
};

export default Home;
