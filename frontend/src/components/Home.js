import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const apiURL = process.env.REACT_APP_API_URL || "http://localhost:3000";
const socket = io(apiURL);

const Home = () => {
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState("");
    const [roomId, setRoomId] = useState(null);
    const [session, setSession] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        socket.on("gameSessionCreated", handleSocketEvent("gameSessionCreated"));
        socket.on("playerJoined", handleSocketEvent("playerJoined"));
        socket.on("returnSessionInfo", handleSocketEvent("returnSessionInfo"));
        socket.on("playerAlreadyJoined", handleSocketEvent("playerAlreadyJoined"));

        return () => {
            socket.off("gameSessionCreated", handleSocketEvent("gameSessionCreated"));
            socket.off("playerJoined", handleSocketEvent("playerJoined"));
            socket.off("returnSessionInfo", handleSocketEvent("returnSessionInfo"));
            socket.off("playerAlreadyJoined", handleSocketEvent("playerAlreadyJoined"));
        };
    }, []);

    const handleSocketEvent = (eventName) => (data) => {
        switch (eventName) {
            case "gameSessionCreated":
                console.log("gameSessionCreated", data.id);
                setRoomId(data.id);
                setErrorMessage("");
                break;
            case "playerJoined":
                console.log("playerJoined", data.id);
                setRoomId(data.id);
                socket.emit("getSessionInfo", { roomId: data.id });
                setErrorMessage("");
                break;
            case "returnSessionInfo":
                console.log("returnSessionInfo", data);
                setSession(data);
                break;
            case "playerAlreadyJoined":
                console.log("playerAlreadyJoined", data);
                setErrorMessage("playerAlreadyJoined");
                break;
            default:
                break;
        }
    };

    //

    console.log("roomId", roomId);
    console.log("session", session);

    //

    useEffect(() => {
        console.log("seessionUpdate");
        console.log(session);
        if (session && session.players.length > 1) {
            navigate("/tiktaktoe", {
                state: { id: roomId, name: playerName, session: session },
            });
        }
    }, [session]);

    const createOrJoinGame = () => {
        console.log("createOrJoinGame");
        if (roomId === null && playerName.length > 0) {
            socket.emit("createOrJoinGame", { playerName });
            if (roomId) {
                socket.emit("getSessionInfo", { roomId });
            }
        }
    };

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
