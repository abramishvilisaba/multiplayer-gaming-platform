import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { TextField, Button, Typography } from "@mui/material";
import { styled, createTheme, ThemeProvider } from "@mui/system";

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
        socket.on("setSessions", handleSocketEvent("setSessions"));

        return () => {
            socket.off("gameSessionCreated", handleSocketEvent("gameSessionCreated"));
            socket.off("playerJoined", handleSocketEvent("playerJoined"));
            socket.off("returnSessionInfo", handleSocketEvent("returnSessionInfo"));
            socket.off("playerAlreadyJoined", handleSocketEvent("playerAlreadyJoined"));
            socket.off("setSessions", handleSocketEvent("setSessions"));
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
            case "setSessions":
                console.log("setSessions", data);
                setSessions(Object.values(data));
                break;

            default:
                break;
        }
    };

    //

    //

    useEffect(() => {
        socket.emit("getSessions");
    }, []);

    useEffect(() => {
        console.log("seessionUpdate");
        console.log(session);
        if (session && session.players.length > 1) {
            navigate(`/${session.game}`, {
                state: { id: roomId, name: playerName, session: session },
            });
        }
    }, [session]);

    const createOrJoinGame = () => {
        console.log("createOrJoinGame");
        if (roomId === null && playerName.length > 0) {
            socket.emit(`createOrJoin${selectedGame}`, { playerName });
            if (roomId) {
                socket.emit("getSessionInfo", { roomId });
            }
        }
    };

    const joinTicTacToe = (game, session) => {
        if (roomId === null && playerName.length > 0) {
            console.log(`join${game}`);
            socket.emit(`join${game}`, { playerName, session });
        }
    };

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === "Enter" && playerName.length > 0) {
                createOrJoinGame();
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [playerName]);

    const [selectedGame, setSelectedGame] = useState(null);
    const [sessions, setSessions] = useState(null);

    const handleGameSelection = (game) => {
        setSelectedGame(game);
    };

    console.log(selectedGame);

    console.log("sessions", sessions);

    useEffect(() => {
        createOrJoinGame();
    }, [selectedGame]);

    const inputStyles = "border rounded py-1 px-2 mx-2";
    const buttonStyles = "bg-blue-500 text-white py-1 px-3 rounded h-[40px]";

    return (
        <div
            className="
         h-screen flex flex-col items-center justify-center"
        >
            <Typography variant="h3" sx={{ mb: 20 }}>
                Multiplayer Gaming Platform
            </Typography>
            <div className="mb-4 flex flex-col gap-6 items-center">
                {errorMessage}
                <Typography variant="h5" htmlFor="playerName" className="mr-2">
                    Enter your name:
                </Typography>
                <TextField
                    type="text"
                    id="playerName"
                    variant="outlined"
                    size="small"
                    className={inputStyles}
                    value={playerName}
                    sx={{ mx: 1, width: "140px" }}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
                <Button
                    onClick={() => {
                        handleGameSelection("TicTacToe");
                        createOrJoinGame;
                    }}
                    variant="contained"
                    className={`${buttonStyles} ml-2`}
                >
                    Play Tic-Tac-Toe
                </Button>
                {/* <Button
                    onClick={() => {
                        handleGameSelection("Battleship"), navigate("/battleship");
                    }}
                    variant="contained"
                    className={`${buttonStyles} ml-2`}
                >
                    Play Battleship
                </Button> */}
                <Button
                    onClick={
                        () => {
                            handleGameSelection("Reversi");
                            createOrJoinGame;
                        }
                        //  navigate("/Reversi");
                    }
                    variant="contained"
                    className={`${buttonStyles} ml-2`}
                >
                    Play Reversi
                </Button>
                {!roomId ? //     className={`${buttonStyles} ml-2`} //     variant="contained" //     onClick={createOrJoinGame} // <Button
                // >
                //     Create Game
                // </Button>
                null : (
                    <Typography variant="h6" htmlFor="playerName" className="mr-2">
                        Waiting for another player to join
                    </Typography>
                )}
            </div>
            {session ? (
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">Game Session</h2>
                    <p className="mb-1">Session ID: {session.id}</p>
                    <p className="mb-4">Players: {session.players.join(", ")}</p>
                </div>
            ) : null}
            <div className="sessions-row">
                {sessions
                    ? sessions.map((session) => (
                          <div key={session.id} className="session-card">
                              <h2 className="text-xl font-semibold mb-2">Game Session</h2>
                              <p className="mb-1">Game: {session.game}</p>
                              <p className="mb-4">Players: {session.players.join(", ")}</p>
                              <Button
                                  onClick={() => joinTicTacToe(session.game, session)}
                                  variant="contained"
                                  className={`${buttonStyles} ml-2`}
                              >
                                  Join Game
                              </Button>
                          </div>
                      ))
                    : null}
            </div>
        </div>
    );
};

export default Home;
